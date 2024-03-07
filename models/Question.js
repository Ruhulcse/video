const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.Promise = global.Promise;

const QuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    total_vote: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
