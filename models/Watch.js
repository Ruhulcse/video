const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.Promise = global.Promise;

const watchSchema = new Schema(
  {
    ip: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    moral: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Watch", watchSchema);
