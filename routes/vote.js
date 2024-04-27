const router = require("express").Router();
const {
  getQuestions,
  castVote,
  createVideo,
  getAllVideo,
  watchVideo,
  watchHistory,
  recommended,
} = require("../controllers/vote");

// User Routes
router.post("/createvideo", createVideo);
router.get("/getallVideo", getAllVideo);
router.post("/getrecommended", recommended);
router.post("/watchvideo", watchVideo);
router.post("/watchhistory", watchHistory);

module.exports = router;
