const router = require("express").Router();
const {
  uploadContent,
  getContents,
  getContentDetailsById,
} = require("../controllers/content");
// const { upload } = require("../middlewares/fileUpload");

router.post("/api/content", uploadContent);
router.get("/api/content", getContents);
router.get("/api/content/:id", getContentDetailsById);

module.exports = router;
