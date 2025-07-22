const Employeetype = require("../../model/Employeetype");
// const question = require("../../model/questions");
const questions = require("../../model/questions");
const slot = require("../../model/slots");
const user = require("../../model/user");
const mongoose = require("mongoose");
const Employee = require('../../model/employee');





class AdminPagesController {
    

    dashboard(req, res) {
        res.render('admin/index', { activePage: 'dashboard' });
    }
    calendar = async (req, res) => {
        try {
            // Just render the calendar view - the slots will be fetched via AJAX
            res.render('admin/calendar', { activePage: 'calendar' });
        } catch (err) {
            console.error('Error loading calendar:', err);
            res.status(500).send('Internal Server Error');
        }
    };
    // Add more methods for other pages as needed

    // users = async (req, res) => {
    //     try {
    //         // Fetch all users with role "user"
    //         const users = await user
    //             .find({ role: "user" })
    //             .populate('democall')
    //             .populate('employeetype')
    //             .lean();
    
    //         const questionKeySet = new Set();
    
    //         // Extract question keys from users' test objects
    //         users.forEach(user => {
    //             const test = user.test || {};
    //             const testPairs = [];
    
    //             for (const [key, answer] of Object.entries(test)) {
    //                 questionKeySet.add(key);
    //                 testPairs.push({ questionKey: key, answer });
    //             }
    
    //             user.testPairs = testPairs;
    //         });
    
    //         // Fetch all questions from DB
    //         const allQuestions = await questions.find().lean();
    
    //         const questionMap = {};
    //         const qquestions = [];
    
    //         // Map question keys to text
    //         allQuestions.forEach(q => {
    //             if (q.obecityquestions && Array.isArray(q.obecityquestions)) {
    //                 q.obecityquestions.forEach(question => {
    //                     if (question.key && question.question) {
    //                         questionMap[question.key] = question.question;
    //                         qquestions.push({ key: question.key, question: question.question });
    //                     }
    //                 });
    //             }
    //         });
    
    //         // Handle missing questions
    //         questionKeySet.forEach(key => {
    //             if (!questionMap[key]) {
    //                 questionMap[key] = `Question not found (${key})`;
    //                 qquestions.push({ key, question: `Question not found (${key})` });
    //             }
    //         });

    //         const question = await questions.findOne();
    //         console.log("qnuestion:", question);
    
    //         res.render('admin/users', {
    //             users,
    //             questionMap,
    //             qquestions,
    //             question
    //         });
    //     } catch (error) {
    //         console.error("Error fetching users or questions:", error);
    //         res.status(500).send("Internal Server Error");
    //     }
    // };
    // controllers/admin.js

users = async (req, res) => {
    try {
        // Get sort parameters from query
        const sortBy = req.query.sortBy || 'createdAt'; // Default sort by creation date
        const sortOrder = req.query.sortOrder || 'desc'; // Default descending order

        // 1. Get questions (assuming single doc with obecityquestions array)
        const data = await questions.findOne();
        let qquestions = [];
        
        if (data && Array.isArray(data.obecityquestions)) {
            // 2. Build qquestions: [{ key, question, options }]
            qquestions = data.obecityquestions.map(q => ({
                key: q._id.toString(),
                question: q.question,
                options: q.options || []
            }));
        }

        // 3. Get users with role "user" (not employees) and apply sorting
        let sortQuery = {};
        if (sortBy === 'createdAt') {
            sortQuery = { createdAt: sortOrder === 'desc' ? -1 : 1 };
        } else if (sortBy === 'name') {
            sortQuery = { name: sortOrder === 'desc' ? -1 : 1 };
        } else if (sortBy === 'email') {
            sortQuery = { email: sortOrder === 'desc' ? -1 : 1 };
        }

        const usersRaw = await user.find({ role: "user" })
            .populate("democall")
            .sort(sortQuery)
            .lean();

        // 4. Prepare users table with detailed answer information
        const usersTable = usersRaw.map(user => {
            // Answer logic
            const testAnswers = user.test instanceof Map
                ? Object.fromEntries(user.test)
                : (user.test || {});
            
            // Create detailed answers array
            const detailedAnswers = qquestions.map(q => {
                const answer = testAnswers[q.key] || "—";
                return {
                    question: q.question,
                    answer: answer,
                    options: q.options
                };
            });

            // Calculate completion percentage
            const answeredQuestions = Object.keys(testAnswers).length;
            const totalQuestions = qquestions.length;
            const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

            // Slot & democall logic
            let slot = user.slot || "—";
            let start = "—";
            let end = "—";
            let joiningLink = "—";
            
            if (user.democall) {
                // democall is an object
                slot = user.democall.slot || slot;
                start = user.democall.start || start;
                end = user.democall.end || end;
                
                // Generate joining link
                if (user.email && user.democall._id) {
                    joiningLink = `/meeting/${encodeURIComponent(user.email)}/${user.democall._id}`;
                }
            }

            // Format dates for display
            const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '—';

            return {
                ...user,
                detailedAnswers,
                completionPercentage,
                answeredQuestions,
                totalQuestions,
                slot,
                democallStart: start,
                democallEnd: end,
                joiningLink,
                createdAtFormatted: createdAt
            };
        });

        res.render('admin/users', {
            users: usersTable,
            qquestions,
            currentSort: { by: sortBy, order: sortOrder },
            activePage: 'users'
        });
    } catch (error) {
        console.error("Error fetching users or questions:", error);
        res.status(500).send("Internal Server Error");
    }
};


    
    
    // Add more methods for other pages as needed
    mymeet = async (req, res) => {
        try {
            // Get meetings with populated data
            const meetings = await mongoose.model('Meeting').find()
                .populate('user', 'name email')
                .populate('employee', 'name email')
                .populate('admin', 'name email')
                .populate('slot', 'start end')
                .populate('participants', 'name email')
                .sort({ createdAt: -1 })
                .lean();

            // Get available employees for group meetings
            const employees = await user.find({ role: 'employee' })
                .populate('employeetype')
                .lean();

            // Get available slots
            const slots = await mongoose.model('Slot').find({ status: 'available' })
                .sort({ start: 1 })
                .lean();

            res.render('admin/mymeet', {
                meetings,
                employees,
                slots,
                activePage: 'mymeet'
            });
        } catch (error) {
            console.error("Error fetching meetings:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // Get users list for meeting participants
    getUsersList = async (req, res) => {
        try {
            const users = await user.find({ role: 'user' })
                .select('name email')
                .lean();
            res.json(users);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }

    // Create new meeting
    createMeeting = async (req, res) => {
        try {
            console.log('Creating meeting with data:', req.body);
            
            const { title, type, slot, employee, description, group, participants, userId } = req.body;
            
            // Validate required fields
            if (!title || !slot) {
                console.log('Validation failed: missing title or slot');
                return res.status(400).json({ success: false, message: 'Title and slot are required' });
            }

            // Validate slot exists and is available
            const slotExists = await mongoose.model('Slot').findById(slot);
            if (!slotExists) {
                console.log('Slot not found:', slot);
                return res.status(400).json({ success: false, message: 'Selected slot not found' });
            }

            if (slotExists.status !== 'available') {
                console.log('Slot not available:', slotExists.status);
                return res.status(400).json({ success: false, message: 'Selected slot is not available' });
            }

            // Create meeting data
            const meetingData = {
                title,
                slot,
                status: 'scheduled',
                group: group || false
            };

            // Add required user field with proper authentication check
            if (userId) {
                meetingData.user = userId;
            } else if (req.user && req.user._id) {
                // Use the current admin user as the meeting creator
                meetingData.user = req.user._id;
                meetingData.admin = req.user._id;
            } else {
                console.log('Authentication error: req.user is not set');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Admin authentication required. Please login as admin.' 
                });
            }

            // Add optional fields
            if (employee) meetingData.employee = employee;
            if (description) meetingData.description = description;
            
            // Handle participants for group meetings
            if (group && participants && participants.length > 0) {
                meetingData.participants = participants;
                console.log('Group meeting with participants:', participants);
            } else if (group) {
                console.log('Group meeting selected but no participants provided');
                return res.status(400).json({ 
                    success: false, 
                    message: 'Group meetings require at least one participant' 
                });
            }

            console.log('Meeting data to save:', meetingData);

            // Create the meeting
            const Meeting = mongoose.model('Meeting');
            const newMeeting = new Meeting(meetingData);
            await newMeeting.save();

            console.log('Meeting saved successfully:', newMeeting._id);

            // Update slot status to booked
            await mongoose.model('Slot').findByIdAndUpdate(slot, { status: 'booked' });
            console.log('Slot status updated to booked');

            // Generate video call link for the meeting
            const videoRoomId = `fittese-${newMeeting._id}`;
            const videoLink = `http://localhost:3000/video/join/${videoRoomId}`;
            
            // Update meeting with video link
            await Meeting.findByIdAndUpdate(newMeeting._id, { videoLink });

            res.json({ 
                success: true, 
                message: 'Meeting created successfully', 
                meeting: {
                    ...newMeeting.toObject(),
                    videoLink
                }
            });
        } catch (error) {
            console.error("Error creating meeting:", error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to create meeting: ' + error.message 
            });
        }
    }

    questions=async(req, res)=> {
        let data = await questions.findOne(); // Assuming there's only one doc
        if (!data) {
          data = await questions.create({ obecityquestions: [] });
        }
        res.render('admin/questions',{data, activePage: 'questions'});
    }
    employeetype =async(req, res)=> {

        const types = await Employeetype.find();
        res.render('admin/employeetype',{types, activePage: 'employeetype'});
    }

    addemployee=async(req, res)=> {
        try {
            const employeetypes = await Employeetype.find();
            const employees = await user.find({ role: 'employee' }).populate('employeetype');
            res.render('admin/employee', { employeetypes, employees, activePage: 'addemployee' });
        } catch (error) {
            console.error('Error loading employee types:', error);
            res.status(500).send('Internal Server Error');
        }
    };

    recordings = async (req, res) => {
        try {
            // Redirect to the recordings controller
            const recordingsController = require('./recordings.controller');
            const controller = new recordingsController();
            await controller.getRecordingsDashboard(req, res);
        } catch (error) {
            console.error('Error loading recordings:', error);
            res.status(500).send('Internal Server Error');
        }
    };
}

module.exports = new AdminPagesController();