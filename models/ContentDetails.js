const mongoose = require("mongoose");
const { Schema } = mongoose;
const objectID = Schema.ObjectId;
mongoose.Promise = global.Promise;

const contentDetailsSchema = new Schema(
  {
    content: {
      type: objectID,
      ref: "Content",
    },
    title: {
      type: String,
      trim: true,
    },
    value: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContentDetails", contentDetailsSchema);
