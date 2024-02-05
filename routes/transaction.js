const router = require("express").Router();

const { cost, createIntend } = require("../controllers/transaction");

router.post("/cost", cost);
router.post("/payment_check", createIntend);

module.exports = router;
