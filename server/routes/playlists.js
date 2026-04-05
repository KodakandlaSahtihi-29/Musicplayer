const router = require("express").Router();
const Playlist = require("../models/Playlist");
const auth = require("../middleware/auth");

// GET all playlists for logged-in user
router.get("/mine", auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.id }).populate("songs");
    res.json(playlists);
  } catch {
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// GET single playlist by ID (public or owned)
router.get("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("songs");
    if (!playlist) return res.status(404).json({ error: "Not found" });
    res.json(playlist);
  } catch {
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

// POST create playlist
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const playlist = await Playlist.create({
      name,
      description,
      isPublic,
      owner: req.user.id,
    });
    res.status(201).json(playlist);
  } catch {
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

// PATCH update name/description
router.patch("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user.id });
    if (!playlist) return res.status(403).json({ error: "Forbidden" });
    Object.assign(playlist, req.body);
    await playlist.save();
    res.json(playlist);
  } catch {
    res.status(500).json({ error: "Failed to update playlist" });
  }
});

// DELETE playlist
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await Playlist.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!result) return res.status(403).json({ error: "Forbidden" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete playlist" });
  }
});

// POST add a song to playlist
router.post("/:id/songs", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user.id });
    if (!playlist) return res.status(403).json({ error: "Forbidden" });
    if (!playlist.songs.includes(req.body.songId)) {
      playlist.songs.push(req.body.songId);
      await playlist.save();
    }
    res.json(playlist);
  } catch {
    res.status(500).json({ error: "Failed to add song" });
  }
});

// DELETE remove a song from playlist
router.delete("/:id/songs/:songId", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user.id });
    if (!playlist) return res.status(403).json({ error: "Forbidden" });
    playlist.songs = playlist.songs.filter((s) => s.toString() !== req.params.songId);
    await playlist.save();
    res.json(playlist);
  } catch {
    res.status(500).json({ error: "Failed to remove song" });
  }
});

module.exports = router;
