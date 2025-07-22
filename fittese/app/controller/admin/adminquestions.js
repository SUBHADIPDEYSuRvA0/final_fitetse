const ques = require("../../model/questions");




class AdminQuestionsController {
    updateObecityQuestions = async (req, res) => {
        try {
          const { questions = [], options = [] } = req.body;
      
          const formattedQuestions = [];
      
          questions.forEach((q, idx) => {
            const opts = Array.isArray(options[idx]) ? options[idx] : [options[idx]];
            formattedQuestions.push({ question: q, options: opts });
          });
      
          await ques.findOneAndUpdate({}, { obecityquestions: formattedQuestions });
      
          res.redirect("/admin/questions");
        } catch (err) {
          console.error(err);
          res.status(500).send("Error updating questions");
        }
      };
}

module.exports = new AdminQuestionsController();