const express = require("express");
const router = express.Router();

const upload = require("../config/upload");
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/",
  authMiddleware,
  upload.single("arquivo"),
  uploadController.uploadArquivo
);

module.exports = router;
