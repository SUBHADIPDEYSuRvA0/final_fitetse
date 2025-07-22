const mongoose = require("mongoose");

const questionsSchema = new mongoose.Schema({
    obecityquestions:[{
    question: {
        type: String,
        required: true,
    },
    options:[
        {
            type: String,
            required: true
        }
    ]
}
]
});

module.exports = mongoose.model("Questions", questionsSchema);