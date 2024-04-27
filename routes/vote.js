const router = require("express").Router();
const {
  getQuestions,
  castVote,
  createVideo,
  getAllVideo,
} = require("../controllers/vote");

// User Routes
router.post("/createvideo", createVideo);
router.get("/getallVideo", getAllVideo);
router.get("/getquestion", getQuestions);
router.post("/questions/:id/vote", castVote);

module.exports = router;
