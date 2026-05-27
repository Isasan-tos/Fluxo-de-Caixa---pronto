const express = require("express");
const router = express.Router();
const controller = require("../controllers/lancamentos.controller");

// CRUD de lançamentos
router.post("/", controller.criar);          // Criar
router.get("/", controller.listar);          // Listar (com filtros)
router.get("/:id", controller.buscarPorId);  // Buscar por ID
router.put("/:id", controller.atualizar);    // Atualizar
router.delete("/:id", controller.deletar);   // Deletar

module.exports = router;
