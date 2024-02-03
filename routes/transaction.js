const router = require("express").Router();

const { cost } = require("../controllers/transaction");

router.post("/cost", cost);

module.exports = router;
