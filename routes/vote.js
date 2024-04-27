const router = require("express").Router();
const {
  getQuestions,
  castVote,
  createVideo,
  getAllVideo,
  watchVideo,
  watchHistory,
} = require("../controllers/vote");

// User Routes
router.post("/createvideo", createVideo);
router.get("/getallVideo", getAllVideo);
router.get("/getquestion", getQuestions);
router.post("/watchvideo", watchVideo);
router.post("/watchhistory", watchHistory);

module.exports = router;
