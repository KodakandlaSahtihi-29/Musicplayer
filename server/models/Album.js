const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
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
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
      },
    ],
    coverUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

albumSchema.index({ title: "text", artist: "text" });

module.exports = mongoose.model("Album", albumSchema);
