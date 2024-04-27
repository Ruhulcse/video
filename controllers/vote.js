const userModel = require("../models/User");
const QuestionModel = require("../models/Question");
const voteModel = require("../models/vote");
const VideoModel = require("../models/Video");
const { ErrorHandler } = require("../utils/error");
module.exports.createVideo = async (req, res, next) => {
  const { body } = req;

  try {
    const newvideo = await VideoModel.create(body);

    res.send({
      status: true,
      data: { video: newvideo },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.getAllVideo = async (req, res, next) => {
  try {
    const newvideo = await VideoModel.find({});

    res.send({
      status: true,
      data: { video: newvideo },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.getQuestions = async (req, res, next) => {
  try {
    const ipAddress = req.query.ip;
    console.log("IP address ", ipAddress);
    const allQuestions = await QuestionModel.find({}).sort({ total_vote: -1 });

    // Now, for each question, fetch the voting status for the provided IP address
    const questionsWithVoteStatus = await Promise.all(
      allQuestions.map(async (question) => {
        const vote = await voteModel.findOne({
          question: question._id,
          voterIP: ipAddress,
        });

        // Add vote status to the question object
        return {
          ...question.toObject(), // Convert mongoose document to plain JavaScript object
          upvote: vote ? vote.upvote : false,
          downvote: vote ? vote.downvote : false,
        };
      })
    );

    res.send({
      status: true,
      data: { Question: questionsWithVoteStatus },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.castVote = async (req, res, next) => {
  const { voteType, voterIP } = req.body; // 'upvote' or 'downvote'
  const questionId = req.params.id;
  // console.log("question id is ", questionId, voteType, voterIP);
  try {
    // Check if this IP has already voted on this question
    let existingVote = await voteModel.findOne({
      question: questionId,
      voterIP,
    });
    // console.log("existing vote ", questionId);
    if (existingVote) {
      // If the existing vote is the same as the new vote, return an appropriate response
      if (existingVote.voteType === voteType) {
        // console.log("same vote so delete it ", voteType);
        await voteModel.findOneAndDelete({
          question: questionId,
          voterIP,
        });
        // console.log("existing vote delete ");
        const total = voteType === "downvote" ? +1 : -1;
        await QuestionModel.findByIdAndUpdate(questionId, {
          $inc: { total_vote: total },
        });
        // console.log("question updated");
        res.status(200).send("Vote recorded successfully.");
      } else {
        // If the vote is different, update the vote type
        existingVote.voteType = voteType;
        existingVote.upvote = voteType === "upvote" ? true : false;
        existingVote.downvote = voteType === "downvote" ? true : false;
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
        res.status(200).send("Vote recorded successfully.");
      }
    } else {
      // If no existing vote, create a new vote record
      const upvote = voteType === "upvote" ? true : false;
      const downvote = voteType === "downvote" ? true : false;
      const newVote = new voteModel({
        question: questionId,
        voterIP,
        voteType,
        upvote,
        downvote,
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
      res.status(200).send("Vote recorded successfully.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error processing your vote: " + error.message);
  }
};
