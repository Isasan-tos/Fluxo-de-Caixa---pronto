const express = require("express");
const router = express.Router();
const controller = require("../controllers/resumo.controller");

router.get("/", controller.obterResumo); // Resumo financeiro

module.exports = router;
