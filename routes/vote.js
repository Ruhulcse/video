const router = require("express").Router();
const {
  createQuestion,
  getQuestions,
  castVote,
} = require("../controllers/vote");

// User Routes
router.post("/createquestion", createQuestion);
router.get("/getquestion", getQuestions);
router.post("/questions/:id/vote", castVote);

module.exports = router;
