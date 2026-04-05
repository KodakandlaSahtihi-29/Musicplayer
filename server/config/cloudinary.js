const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

function isValidFile(file, extSet, mimeSet) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();
  return extSet.has(ext) && mimeSet.has(mime);
}

function uploadFileFilter(req, file, cb) {
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

// Audio storage — stored as raw
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "musify/audio",
    resource_type: "raw",
    allowed_formats: ["mp3", "wav", "flac", "ogg"],
    transformation: [{ quality: "auto" }],
  },
});

// Cover art storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "musify/covers",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill", quality: "auto" }],
  },
});

const mixedStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === "cover") {
      return {
        folder: "musify/covers",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 500, height: 500, crop: "fill", quality: "auto" }],
      };
    }

    return {
      folder: "musify/audio",
      resource_type: "raw",
      allowed_formats: ["mp3", "wav", "flac", "ogg"],
      transformation: [{ quality: "auto" }],
    };
  },
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!isValidFile(file, AUDIO_EXTENSIONS, AUDIO_MIMES)) {
      return cb(new Error("Invalid audio file type. Allowed: mp3, wav, flac, ogg"));
    }
    return cb(null, true);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!isValidFile(file, IMAGE_EXTENSIONS, IMAGE_MIMES)) {
      return cb(new Error("Invalid cover file type. Allowed: jpg, jpeg, png, webp"));
    }
    return cb(null, true);
  },
});

const uploadSongFields = multer({
  storage: mixedStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: uploadFileFilter,
}).fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

module.exports = {
  cloudinary,
  audioStorage,
  imageStorage,
  uploadAudio,
  uploadImage,
  uploadSongFields,
};
