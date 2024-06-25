const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  emailPhone: {
    type: String,
    required: [true, "Please provide an email address or phone number"],
    unique: true,
    lowercase: true  
  },
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    minLength: 8,
    required: [true, "Please provide a password"],
    select: false,
  },
  dob:{
    month: String,
    day: String,
    year: String
  },
  likedPosts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
  ],
  savedPosts: [
    {
      type: mongoose.Schema.  ObjectId,
      ref: "Post",
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
