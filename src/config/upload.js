const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/imagens");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "uploads/videos");
    } else {
      cb(new Error("Tipo de arquivo não suportado"));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, name + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

module.exports = upload;
