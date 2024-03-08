const userModel = require("../models/User");
const QuestionModel = require("../models/Question");
const voteModel = require("../models/vote");
const { ErrorHandler } = require("../utils/error");
module.exports.createQuestion = async (req, res, next) => {
  const { body } = req;

  try {
    const newQuestion = await QuestionModel.create(body);

    res.send({
      status: true,
      data: { Question: newQuestion },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.getQuestions = async (req, res, next) => {
  try {
    const allQuestion = await QuestionModel.find({});
    console.log("all question ", allQuestion);
    res.send({
      status: true,
      data: { Question: allQuestion },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.castVote = async (req, res, next) => {
  const { voteType, voterIP } = req.body; // 'upvote' or 'downvote'
  const questionId = req.params.id;
  console.log("question id is ", questionId, voteType, voterIP);
  try {
    // Check if this IP has already voted on this question
    let existingVote = await voteModel.findOne({
      question: questionId,
      voterIP,
    });
    console.log("existing vote ", existingVote);
    if (existingVote) {
      console.log("age vote dise ai question er jonno ");
      // If the existing vote is the same as the new vote, return an appropriate response
      if (existingVote.voteType === voteType) {
        return res
          .status(200)
          .send("You have already voted this way on this question.");
      }

      // If the vote is different, update the vote type
      existingVote.voteType = voteType;
      await existingVote.save();

      // Adjust the question's total vote count based on the change
      if (voteType === "upvote") {
        // This means the previous vote was a downvote, so add 2 to total_vote (remove downvote, add upvote)
        await QuestionModel.findByIdAndUpdate(questionId, {
          $inc: { total_vote: 2 },
        });
      } else {
        // This means the previous vote was an upvote, so subtract 2 from total_vote (remove upvote, add downvote)
        await QuestionModel.findByIdAndUpdate(questionId, {
          $inc: { total_vote: -2 },
        });
      }
    } else {
      // If no existing vote, create a new vote record
      const newVote = new voteModel({
        question: questionId,
        voterIP,
        voteType,
      });
      await newVote.save();
      console.log("save hoise ");
      // Update the question's total vote count
      const update =
        voteType === "upvote"
          ? { $inc: { total_vote: 1 } }
          : { $inc: { total_vote: -1 } };
      console.log("increment dne", update);
      await QuestionModel.findByIdAndUpdate(questionId, update);
      console.log("success ");
    }

    res.status(200).send("Vote recorded successfully.");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error processing your vote: " + error.message);
  }
};
