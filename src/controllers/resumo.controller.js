// resumo.controller.js — Resumo financeiro do fluxo de caixa conectado ao MySQL

const pool = require("../models/db"); // Importa o pool do MySQL

// ──────────────────────────────────────────
// GET /api/resumo
// Retorna saldo, total de entradas e saídas
// ──────────────────────────────────────────
async function obterResumo(req, res) {
  try {
    // 1. Busca todos os lançamentos direto do banco de dados MySQL
    // Desestruturamos para pegar apenas as linhas (rows) que retornam do banco
    const [lancamentos] = await pool.query("SELECT * FROM lancamentos");

    const { dataInicio, dataFim } = req.query;

    // Filtros opcionais de data aplicados na memória (ou você pode fazer no SQL se preferir)
    let lancamentosFiltrados = lancamentos;
    if (dataInicio) lancamentosFiltrados = lancamentosFiltrados.filter((l) => l.data >= dataInicio);
    if (dataFim)    lancamentosFiltrados = lancamentosFiltrados.filter((l) => l.data <= dataFim);

    // 2. Garante que os valores vêm como números (o MySQL às vezes traz como String dependendo do tipo da coluna)
    const lancamentosFormatados = lancamentosFiltrados.map(l => ({
      ...l,
      valor: parseFloat(l.valor) || 0
    }));

    // 3. Cálculos de Entradas e Saídas
    const totalEntradas = lancamentosFormatados
      .filter((l) => l.tipo === "entrada")
      .reduce((soma, l) => soma + l.valor, 0);

    const totalSaidas = lancamentosFormatados
      .filter((l) => l.tipo === "saida")
      .reduce((soma, l) => soma + l.valor, 0);

    const saldo = totalEntradas - totalSaidas;

    // 4. Agrupa por categoria para mostrar no gráfico/grade do Painel
    const porCategoria = lancamentosFormatados.reduce((acc, l) => {
      if (!l.categoria) l.categoria = "Outros";
      if (!acc[l.categoria]) acc[l.categoria] = 0; // Simplificado para bater com o script.js
      acc[l.categoria] += l.valor;
      return acc;
    }, {});

    // 5. Retorna a resposta certinha pro front-end
    return res.json({
      periodo: {
        dataInicio: dataInicio || "desde o início",
        dataFim: dataFim || "até hoje",
      },
      totalEntradas: parseFloat(totalEntradas.toFixed(2)),
      totalSaidas: parseFloat(totalSaidas.toFixed(2)),
      saldo: parseFloat(saldo.toFixed(2)),
      situacao: saldo >= 0 ? "positivo" : "negativo",
      quantidadeLancamentos: lancamentosFormatados.length,
      porCategoria, // Objeto com { Categoria: Valor total }
    });

  } catch (error) {
    console.error("Erro interno no controlador de resumo:", error);
    return res.status(500).json({ message: "Erro ao calcular o resumo financeiro no banco de dados." });
  }
}

module.exports = { obterResumo };