const Plans = require('../../model/plans');
const mongoose = require('mongoose');

// Render plan management page
exports.renderPlansPage = async (req, res) => {
    try {
        const plans = await Plans.find().sort({ sortOrder: 1, createdAt: -1 });
        res.render('admin/plan', { plans, activePage: 'plans' });
    } catch (error) {
        console.error('Failed to load plans:', error);
        res.status(500).send('Server Error');
    }
};

// Render edit plan page
exports.renderEditPlanPage = async (req, res) => {
    try {
        const plan = await Plans.findById(req.params.id);
        if (!plan) {
            return res.status(404).send('Plan not found');
        }
        res.render('admin/edit-plan', { plan, activePage: 'plans' });
    } catch (error) {
        console.error('Failed to load plan for editing:', error);
        res.status(500).send('Server Error');
    }
};

exports.createPlan = async (req, res) => {
    try {
        const {
            planname,
            price,
            originalPrice,
            discount,
            currency,
            currencyCode,
            currencySymbol,
            duration,
            durationUnit,
            totalsessions,
            description,
            shortDescription,
            protocols,
            category,
            isactive,
            isPopular,
            sortOrder,
            maxParticipants,
            includesRecording,
            includesSupport,
            supportHours,
            features
        } = req.body;

        // Validate required fields
        if (!planname || !price || !duration || !totalsessions || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: plan name, price, duration, total sessions, and description are required'
            });
        }

        // Validate price
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid price. Price must be a positive number.'
            });
        }

        // Parse features from JSON string or array
        let parsedFeatures = [];
        if (features) {
            if (typeof features === 'string') {
                try {
                    parsedFeatures = JSON.parse(features);
                } catch (e) {
                    console.log('Error parsing features JSON:', e);
                    parsedFeatures = features.split(',').map(f => ({ name: f.trim() }));
                }
            } else if (Array.isArray(features)) {
                parsedFeatures = features;
            }
        }

        // Parse protocols
        const parsedProtocols = protocols ? protocols.split(',').map(protocol => protocol.trim()) : [];

        const newPlan = new Plans({
            planname,
            setprice: {
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
                discount: discount ? parseFloat(discount) : 0,
                currency: currency || 'USD',
                currencyCode: currencyCode || 'USD',
                currencySymbol: currencySymbol || '$'
            },
            duration: parseInt(duration),
            durationUnit: durationUnit || 'days',
            totalsessions: parseInt(totalsessions),
            description,
            shortDescription,
            features: parsedFeatures,
            protocols: parsedProtocols,
            category: category || 'basic',
            isactive: isactive === 'true' || isactive === true,
            isPopular: isPopular === 'true' || isPopular === true,
            sortOrder: sortOrder ? parseInt(sortOrder) : 0,
            maxParticipants: maxParticipants ? parseInt(maxParticipants) : 1,
            includesRecording: includesRecording === 'true' || includesRecording === true,
            includesSupport: includesSupport === 'true' || includesSupport === true,
            supportHours: supportHours || '9 AM - 5 PM'
        });

        await newPlan.save();
        
        // Return JSON response for AJAX requests
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                success: true,
                message: 'Plan created successfully',
                plan: newPlan
            });
        }
        
        res.redirect('/admin/plans');
    } catch (err) {
        console.error('Error creating plan:', err);
        
        // Return JSON response for AJAX requests
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({
                success: false,
                message: 'Error creating plan: ' + err.message
            });
        }
        
        res.status(500).send('Error creating plan: ' + err.message);
    }
};

// Update existing plan
exports.updatePlan = async (req, res) => {
    try {
        const {
            planname,
            price,
            originalPrice,
            discount,
            currency,
            currencyCode,
            currencySymbol,
            duration,
            durationUnit,
            totalsessions,
            description,
            shortDescription,
            protocols,
            category,
            isactive,
            isPopular,
            sortOrder,
            maxParticipants,
            includesRecording,
            includesSupport,
            supportHours,
            features
        } = req.body;
        
        const planId = req.params.id;

        // Parse features
        let parsedFeatures = [];
        if (features) {
            if (typeof features === 'string') {
                try {
                    parsedFeatures = JSON.parse(features);
                } catch (e) {
                    parsedFeatures = features.split(',').map(f => ({ name: f.trim() }));
                }
            } else if (Array.isArray(features)) {
                parsedFeatures = features;
            }
        }

        // Parse protocols
        const parsedProtocols = protocols ? protocols.split(',').map(protocol => protocol.trim()) : [];

        const updatedPlan = await Plans.findByIdAndUpdate(planId, {
            planname,
            setprice: {
                price: parseFloat(price),
                originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
                discount: discount ? parseFloat(discount) : 0,
                currency: currency || 'USD',
                currencyCode: currencyCode || 'USD',
                currencySymbol: currencySymbol || '$'
            },
            duration: parseInt(duration),
            durationUnit: durationUnit || 'days',
            totalsessions: parseInt(totalsessions),
            description,
            shortDescription,
            features: parsedFeatures,
            protocols: parsedProtocols,
            category: category || 'basic',
            isactive: isactive === 'true' || isactive === true,
            isPopular: isPopular === 'true' || isPopular === true,
            sortOrder: sortOrder ? parseInt(sortOrder) : 0,
            maxParticipants: maxParticipants ? parseInt(maxParticipants) : 1,
            includesRecording: includesRecording === 'true' || includesRecording === true,
            includesSupport: includesSupport === 'true' || includesSupport === true,
            supportHours: supportHours || '9 AM - 5 PM'
        }, { new: true });

        res.redirect('/admin/plans');
    } catch (err) {
        console.error('Error updating plan:', err);
        res.status(500).send('Error updating plan');
    }
};

// Delete a plan
exports.deletePlan = async (req, res) => {
    try {
        const planId = req.params.id;
        await Plans.findByIdAndDelete(planId);
        res.redirect('/admin/plans');
    } catch (err) {
        console.error('Error deleting plan:', err);
        res.status(500).send('Error deleting plan');
    }
};

// Update plan status (active/inactive)
exports.updateStatus = async (req, res) => {
    try {
        const planId = req.params.id;
        const plan = await Plans.findById(planId);

        if (!plan) {
            return res.status(404).send('Plan not found');
        }

        plan.isactive = !plan.isactive;
        await plan.save();
        res.redirect('/admin/plans');
    } catch (err) {
        console.error('Error updating plan status:', err);
        res.status(500).send('Error updating plan status');
    }
};

// Toggle popular status
exports.togglePopular = async (req, res) => {
    try {
        const planId = req.params.id;
        const plan = await Plans.findById(planId);

        if (!plan) {
            return res.status(404).send('Plan not found');
        }

        plan.isPopular = !plan.isPopular;
        await plan.save();
        res.redirect('/admin/plans');
    } catch (err) {
        console.error('Error toggling popular status:', err);
        res.status(500).send('Error updating popular status');
    }
};

// Get plans for API
exports.getPlans = async (req, res) => {
    try {
        const plans = await Plans.find({ isactive: true })
            .sort({ sortOrder: 1, createdAt: -1 })
            .select('-__v');
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
};

// Get single plan for API
exports.getPlan = async (req, res) => {
    try {
        const plan = await Plans.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        res.json(plan);
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ error: 'Failed to fetch plan' });
    }
};
