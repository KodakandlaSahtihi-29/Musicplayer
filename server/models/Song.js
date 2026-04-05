const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    album: {
      type: String,
      default: "Single",
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    audioUrl: {
      type: String,
      required: true,
      trim: true,
    },
    audioPublicId: {
      type: String,
      default: "",
      trim: true,
    },
    coverUrl: {
      type: String,
      default: "",
      trim: true,
    },
    coverPublicId: {
      type: String,
      default: "",
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
      default: "Unknown",
    },
    plays: {
      type: Number,
      default: 0,
      min: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

songSchema.index({ title: "text", artist: "text", album: "text" });

module.exports = mongoose.model("Song", songSchema);
