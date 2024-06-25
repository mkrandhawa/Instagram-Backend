const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

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

userSchema.pre('save', async function (next){

  if (this.isModified('password') || this.isNew) {  // Hash password only if it is new or modified
    this.password = await bcrypt.hash(this.password, 12);
}
  next();
})


userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
