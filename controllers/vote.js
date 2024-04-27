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

module.exports.deleteHistory = async (req, res, next) => {
  const { ip } = req.body;
  try {
    // Delete all entries with the specified IP from the Watch model
    const result = await watchModel.deleteMany({ ip: ip });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No records found for the specified IP to delete." });
    }

    // Respond with success message if deletion was successful
    res.status(200).json({
      message: "Watch history successfully deleted.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    // Handle possible errors during the operation
    console.error("Failed to delete watch history:", error);
    res.status(500).json({
      message: "Failed to delete watch history due to an internal error.",
    });
  }
};
