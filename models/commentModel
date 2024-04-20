const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  description: {
    tyope: String,
    required: [true, "Your comment must have description"],
    minLength: 10,
    maxLength: 150,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  posts: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  users: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
