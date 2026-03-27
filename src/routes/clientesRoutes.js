const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const clientesController = require("../controllers/clientesController");

router.get("/", authMiddleware, clientesController.listar);
router.post("/", authMiddleware, clientesController.criar);
router.put("/:id", authMiddleware, clientesController.atualizar);
router.delete("/:id", authMiddleware, clientesController.excluir);

module.exports = router;
const upload = require("../config/upload");

router.post(
  "/:id/foto",
  authMiddleware,
  upload.single("foto"),
  clientesController.uploadFoto
);
