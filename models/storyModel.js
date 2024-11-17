const mongoose = require("mongoose");

const storySchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
    },
    story: {
      type: String, 
      required: [true, "A story must have a media file"],
    },
    createdAt: {
      type: Date,
      default: Date.now, 
      expires: 86400, 
    },
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
