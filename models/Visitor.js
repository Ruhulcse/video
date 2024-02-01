const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.Promise = global.Promise;
// Define the schema
const VisitorSchema = new Schema(
  {
    ip_address: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    country_code: {
      type: String,
      required: true,
    },
    total_visit: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Create the model from the schema
const Visitor = mongoose.model("Visitor", VisitorSchema);

module.exports = Visitor;
