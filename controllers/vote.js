const userModel = require("../models/User");
const QuestionModel = require("../models/Question");
const voteModel = require("../models/vote");
const VideoModel = require("../models/Video");
const watchModel = require("../models/Watch");
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

module.exports.watchVideo = async (req, res, next) => {
  const { name, genre, moral, link, ip } = req.body; // 'upvote' or 'downvote'

  try {
    const newWatch = new watchModel({
      ip,
      name,
      genre,
      moral,
      link,
    });
    await newWatch.save();
    res.status(200).send("Watch history added.");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error processing watch history: " + error.message);
  }
};

module.exports.watchHistory = async (req, res, next) => {
  const { ip } = req.body; // 'upvote' or 'downvote'
  try {
    const newvideo = await watchModel.find({ ip: ip });

    res.send({
      status: true,
      data: { video: newvideo },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports.recommended = async (req, res, next) => {
  const { ip } = req.body; // 'upvote' or 'downvote'
  try {
    // Retrieve all watch history for a given IP and extract unique genres
    const watches = await watchModel.find({ ip: ip });
    let watchedGenres = new Set();
    watches.forEach((watch) => {
      watch.genre
        .split(", ")
        .forEach((genre) => watchedGenres.add(genre.trim()));
    });

    // Find videos that have any genre that matches the genres watched by this IP
    let recommendedVideos = [];
    const videos = await VideoModel.find({});
    videos.forEach((video) => {
      const videoGenres = video.genre.split(", ").map((genre) => genre.trim());
      const commonGenres = videoGenres.some((genre) =>
        watchedGenres.has(genre)
      );
      if (commonGenres) {
        recommendedVideos.push(video);
      }
    });
    // Send the recommended videos as a response
    res.status(200).json(recommendedVideos);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching recommendations");
  }
};
