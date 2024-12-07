const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Your post must have description"],
    minLength: 10,
    maxLength: 150,
  },
  likes: {
    type: Number,
    default: 0,
  },
  saves: {
    type: Number,
    default: 0,
  },
  shares: {
    type: Number,
    default: 0,
  },
  images:[{
    type: String,
    required: [true, 'Please choose a valid format']
  }],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }, // Reference to the User model
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
