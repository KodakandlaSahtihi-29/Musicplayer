const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from localhost, GitHub Pages deployments, or configured client origin
      if (
        !origin ||
        origin.includes("github.io") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        (process.env.CLIENT_ORIGIN && origin === process.env.CLIENT_ORIGIN)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(express.raw({ limit: "100mb" }));
app.use(express.text({ limit: "100mb" }));
app.use(cookieParser());

// Serve uploaded files from /uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in 15 minutes." },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

let isConnecting = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (isConnecting) return isConnecting;

  isConnecting = (async () => {
    const uri = process.env.MONGO_URI;

    // 1. If MongoDB Atlas / external URI provided (not localhost)
    if (uri && !uri.includes("localhost") && !uri.includes("127.0.0.1")) {
      try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB Atlas");
        return;
      } catch (err) {
        console.error("MongoDB Atlas connection failed:", err.message);
      }
    }

    // 2. Try local MongoDB service with a short timeout (only for local development)
    if (uri) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
        console.log("Connected to local MongoDB");
        return;
      } catch {
        console.log("Local MongoDB not found. Starting in-memory MongoDB for local development...");
      }
    }

    // 3. Fallback to in-memory MongoDB so signup & app work seamlessly out-of-the-box locally
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log("MongoDB in-memory server connected ready for development");
    } catch (err) {
      console.error("Failed to start in-memory MongoDB:", err.message);
    }
  })();

  try {
    await isConnecting;
  } finally {
    isConnecting = null;
  }
}

// Ensure database is connected before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/songs", require("./routes/songs"));
app.use("/api/playlists", require("./routes/playlists"));
app.use("/api/users", require("./routes/users"));
app.use("/api/upload", require("./routes/upload"));

// Only listen directly when running standalone (not required as a module/serverless function)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;
