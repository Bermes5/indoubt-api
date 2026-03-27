const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const equipamentosController = require("../controllers/equipamentosController");

router.get("/", authMiddleware, equipamentosController.listar);
router.post("/", authMiddleware, equipamentosController.criar);
router.put("/:id", authMiddleware, equipamentosController.atualizar);
router.delete("/:id", authMiddleware, equipamentosController.excluir);

module.exports = router;
