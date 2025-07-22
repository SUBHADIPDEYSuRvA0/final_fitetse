const question = require("../../model/questions");
const Slot = require("../../model/slots");
const user = require("../../model/user");
const Plan = require("../../model/plans");


class pagescontroller{
    dashboard= async (req, res)=>{
        let data = await question.findOne();
        const users = await user.find().populate("democall").lean();
    const questionData = await question.find().lean();

    const questionMap = {};
    // Flatten questions array (assuming multiple in `obecityquestions`)
    questionData.forEach(entry => {
      if (entry.obecityquestions && Array.isArray(entry.obecityquestions)) {
        entry.obecityquestions.forEach(q => {
          questionMap[q._id.toString()] = q;
        });
      }
    });

    const userData = users.map(user => {
      const testAnswers = user.test instanceof Map
        ? Object.fromEntries(user.test)
        : user.test || {};

      const enrichedAnswers = Object.entries(testAnswers).map(([qId, answer]) => {
        const questionObj = questionMap[qId];
        return {
          question: questionObj?.question || `Unknown Question (${qId})`,
          selectedAnswer: answer,
          allOptions: questionObj?.options || []
        };
      });

      return {
        ...user,
        answers: enrichedAnswers
      };

     
    });

    console.log(userData);
        res.render('user/index',{ questions: data.obecityquestions, users: userData });
    }
    api = async (req, res) => {
        try {
          const slots = await Slot.find();
          res.json(slots);
        } catch (err) {
          res.status(500).json({ message: 'Error fetching slots' });
        }
      };

    // Add this method to fetch and render real plans
    plansPage = async (req, res) => {
        try {
            const plans = await Plan.find({ isactive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
            res.render('user/panel/plans', { user: req.user, activePage: 'plans', plans });
        } catch (err) {
            res.status(500).send('Error fetching plans');
        }
    }
}   

module.exports = new pagescontroller();