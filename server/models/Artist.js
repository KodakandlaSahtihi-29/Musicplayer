const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    genre: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

artistSchema.index({ name: "text", genre: "text" });

module.exports = mongoose.model("Artist", artistSchema);
