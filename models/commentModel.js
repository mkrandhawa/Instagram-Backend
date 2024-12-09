const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Your comment must have description"],
    minLength: 1,
    maxLength: 150,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
