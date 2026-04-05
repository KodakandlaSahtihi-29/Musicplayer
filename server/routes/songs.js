const express = require("express");
const Song = require("../models/Song");
const Artist = require("../models/Artist");
const Album = require("../models/Album");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    return res.status(200).json(songs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch songs.", error: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q, type = "all", limit = 20 } = req.query;

    if (!q?.trim()) {
      return res.json({ songs: [], albums: [], artists: [] });
    }

    const parsedLimit = Number(limit) || 20;
    const textQuery = { $text: { $search: q } };
    const scoreSort = { score: { $meta: "textScore" } };

    const [songs, albums, artists] = await Promise.all([
      type === "all" || type === "songs"
        ? Song.find(textQuery, scoreSort).sort(scoreSort).limit(parsedLimit)
        : [],
      type === "all" || type === "albums"
        ? Album.find(textQuery, scoreSort).sort(scoreSort).limit(parsedLimit)
        : [],
      type === "all" || type === "artists"
        ? Artist.find(textQuery, scoreSort).sort(scoreSort).limit(parsedLimit)
        : [],
    ]);

    return res.json({ songs, albums, artists });
  } catch (error) {
    return res.status(500).json({ message: "Search failed.", error: error.message });
  }
});

router.get("/top", async (req, res) => {
  try {
    const songs = await Song.find().sort({ plays: -1 }).limit(20);
    return res.json(songs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch top tracks.", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    return res.status(200).json(song);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch song.", error: error.message });
  }
});

module.exports = router;
