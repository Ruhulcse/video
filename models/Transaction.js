const mongoose = require("mongoose");
const { Schema } = mongoose;
const objectID = Schema.ObjectId;
mongoose.Promise = global.Promise;

const TransactionSchema = new Schema(
  {
    user_id: {
      type: objectID,
      ref: "User",
    },
    total_word: {
      type: Number,
    },
    transaction_type: {
      type: String,
      enum: ["IN", "OUT"], // Only allow "IN" or "OUT" as values
      required: true, // Make this field required
    },
    total_balance: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
