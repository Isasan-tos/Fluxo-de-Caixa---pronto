// errorHandler.js — Captura erros inesperados e evita que a API quebre

function errorHandler(err, req, res, next) {
  console.error("Erro interno:", err.message);
  res.status(500).json({
    erro: "Erro interno do servidor.",
    detalhe: err.message,
  });
}

module.exports = errorHandler;
