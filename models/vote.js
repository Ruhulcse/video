const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.Promise = global.Promise;

const VoteSchema = new Schema(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    voterIP: {
      type: String,
      required: true,
    },
    voteType: {
      type: String,
      required: true,
      enum: ["upvote", "downvote"],
    },
    upvote: {
      type: Boolean,
      default: false,
    },
    downvote: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vote", VoteSchema);
