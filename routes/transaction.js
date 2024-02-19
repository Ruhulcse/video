const router = require("express").Router();

const {
  cost,
  createIntend,
  createTransaction,
} = require("../controllers/transaction");

router.post("/cost", cost);
router.post("/payment_check", createIntend);
router.post("/api/transaction", createTransaction);

module.exports = router;
