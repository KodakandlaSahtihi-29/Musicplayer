const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { uploadSongFields, cloudinary } = require("../config/cloudinary");
const Song = require("../models/Song");
const auth = require("../middleware/auth");

const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".flac", ".ogg"]);
const AUDIO_MIMES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/ogg",
  "audio/vorbis",
]);

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

const uploadsRoot = path.join(__dirname, "..", "uploads");
const audioDir = path.join(uploadsRoot, "audio");
const coverDir = path.join(uploadsRoot, "covers");

fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(coverDir, { recursive: true });

function isValidFile(file, extSet, mimeSet) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();
  return extSet.has(ext) && mimeSet.has(mime);
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "cover") return cb(null, coverDir);
    return cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function localFileFilter(req, file, cb) {
  if (file.fieldname === "audio") {
    if (!isValidFile(file, AUDIO_EXTENSIONS, AUDIO_MIMES)) {
      return cb(new Error("Invalid audio file type. Allowed: mp3, wav, flac, ogg"));
    }
    return cb(null, true);
  }

  if (file.fieldname === "cover") {
    if (!isValidFile(file, IMAGE_EXTENSIONS, IMAGE_MIMES)) {
      return cb(new Error("Invalid cover file type. Allowed: jpg, jpeg, png, webp"));
    }
    return cb(null, true);
  }

  return cb(new Error("Unexpected file field"));
}

const uploadSongFieldsLocal = multer({
  storage: localStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: localFileFilter,
}).fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

function isCloudinaryConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const hasAllValues = cloudName && apiKey && apiSecret;
  const hasPlaceholders = [cloudName, apiKey, apiSecret].some((v) =>
    ["your_cloud_name", "your_api_key", "your_api_secret"].includes(v)
  );

  return Boolean(hasAllValues && !hasPlaceholders);
}

router.post("/song", auth, (req, res) => {
  const useCloudinary = isCloudinaryConfigured();
  const uploader = useCloudinary ? uploadSongFields : uploadSongFieldsLocal;

  uploader(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const { title, artist, album, genre } = req.body;
      const audioFile = req.files?.audio?.[0];
      const coverFile = req.files?.cover?.[0];

      if (!audioFile) return res.status(400).json({ error: "Audio file required" });

      let audioUrl = "";
      let audioPublicId = "";
      let coverUrl = "";
      let coverPublicId = "";
      let duration = 1;

      if (useCloudinary) {
        let audioInfo = null;
        try {
          audioInfo = await cloudinary.api.resource(audioFile.filename, {
            resource_type: "raw",
          });
        } catch {
          audioInfo = null;
        }

        audioUrl = audioFile.path;
        audioPublicId = audioFile.filename;
        coverUrl = coverFile?.path || "";
        coverPublicId = coverFile?.filename || "";
        duration = Math.max(1, Math.round(audioInfo?.duration || 0));
      } else {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        audioUrl = `${baseUrl}/uploads/audio/${audioFile.filename}`;
        audioPublicId = `audio/${audioFile.filename}`;
        coverUrl = coverFile ? `${baseUrl}/uploads/covers/${coverFile.filename}` : "";
        coverPublicId = coverFile ? `covers/${coverFile.filename}` : "";
      }

      const song = await Song.create({
        title,
        artist,
        album,
        genre,
        audioUrl,
        audioPublicId,
        coverUrl,
        coverPublicId,
        duration,
        uploadedBy: req.user.id,
      });

      res.status(201).json(song);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

router.delete("/song/:id", auth, async (req, res) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, uploadedBy: req.user.id });
    if (!song) return res.status(403).json({ error: "Forbidden" });

    const useCloudinary = isCloudinaryConfigured();

    if (useCloudinary) {
      const audioPublicId = song.audioPublicId;
      const coverPublicId = song.coverPublicId;

      await Promise.all([
        audioPublicId
          ? cloudinary.uploader.destroy(audioPublicId, { resource_type: "raw" })
          : Promise.resolve(),
        coverPublicId ? cloudinary.uploader.destroy(coverPublicId) : Promise.resolve(),
      ]);
    } else {
      const filePaths = [song.audioPublicId, song.coverPublicId]
        .filter(Boolean)
        .map((relativePath) => path.join(uploadsRoot, relativePath));

      await Promise.all(
        filePaths.map(async (filePath) => {
          try {
            await fs.promises.unlink(filePath);
          } catch {
            // Ignore missing files during cleanup.
          }
        })
      );
    }

    await song.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
