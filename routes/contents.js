const router = require("express").Router();
const { uploadContent, getContents } = require("../controllers/content");
// const { upload } = require("../middlewares/fileUpload");

router.post("/api/content", uploadContent);
router.get("/api/content", getContents);

module.exports = router;
