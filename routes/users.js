const router = require("express").Router();
const health = require("../controllers/health");
const {
  loginUser,
  forgotPassword,
  resetPassword,
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  visitor,
  stats,
} = require("../controllers/user");

// System Routes
router.get("/health", health.check);

// User Routes
router.post("/login", loginUser);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);
router.post("/visitor", visitor);
router.get("/stats", stats);
router.post("/signup", createUser);
router.get("/api/users", getUsers);
router.get("/api/users/:id", getUserById);
router.put("/api/users/:id", updateUserById);
router.delete("/api/users/:id", deleteUserById);

module.exports = router;
