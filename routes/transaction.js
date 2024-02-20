const router = require("express").Router();

const {
  cost,
  createIntend,
  createTransaction,
  TransactionByUser,
} = require("../controllers/transaction");

router.post("/cost", cost);
router.post("/payment_check", createIntend);
router.post("/api/transaction", createTransaction);
router.get("/api/transactionbyuser", TransactionByUser);

module.exports = router;
