const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

const app = express();
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e5);
    cb(null, unique + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Serve frontend
app.use(express.static(__dirname));

// Get local IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "localhost";
}

// API: local IP
app.get("/api/ip", (req, res) => {
  res.json({ ip: getLocalIP(), port: PORT });
});

// API: list files
app.get("/api/files", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR).map((name) => {
    const stats = fs.statSync(path.join(UPLOAD_DIR, name));
    const originalName = name.replace(/^\d+-\d+-/, "");
    return {
      storedName: name,
      originalName,
      size: stats.size,
      uploaded: stats.mtime,
    };
  });
  res.json(files.reverse());
});

// API: upload
app.post("/api/upload", upload.array("files"), (req, res) => {
  res.json({ success: true, count: req.files.length });
});

// API: download
app.get("/api/download/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  const originalName = req.params.filename.replace(/^\d+-\d+-/, "");
  res.download(filePath, originalName);
});

// API: delete
app.delete("/api/delete/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
  fs.unlinkSync(filePath);
  res.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║       LOCAL FILE SHARE RUNNING       ║");
  console.log("╠══════════════════════════════════════╣");
  console.log(`║  Local:   http://localhost:${PORT}      ║`);
  console.log(`║  Network: http://${ip}:${PORT}   ║`);
  console.log("╠══════════════════════════════════════╣");
  console.log("║  Share the Network URL with devices  ║");
  console.log("║  connected to the same WiFi!         ║");
  console.log("╚══════════════════════════════════════╝\n");
});
