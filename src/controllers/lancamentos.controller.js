// lancamentos.controller.js — Toda a lógica de negócio dos lançamentos

const { v4: uuidv4 } = require("uuid");
const model = require("../models/lancamentos.model");

// Tipos e categorias válidas
const TIPOS_VALIDOS = ["entrada", "saida"];

const CATEGORIAS_VALIDAS = {
  entrada: ["salario", "freelance", "investimento", "venda", "outros"],
  saida: ["alimentacao", "transporte", "moradia", "saude", "educacao", "lazer", "outros"],
};

// ──────────────────────────────────────────
// POST /api/lancamentos
// Cria um novo lançamento
// ──────────────────────────────────────────
async function criar(req, res) {
  try{

  const { descricao, valor, tipo, categoria, data } = req.body;

  // Validações
  if (!descricao || !valor || !tipo) {
    return res.status(400).json({
      erro: "Campos obrigatórios: descricao, valor e tipo.",
    });
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({
      erro: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(" ou ")}.`,
    });
  }

  if (typeof valor !== "number" || valor <= 0) {
    return res.status(400).json({
      erro: "O valor deve ser um número positivo.",
    });
  }

  if (categoria && !CATEGORIAS_VALIDAS[tipo].includes(categoria)) {
    return res.status(400).json({
      erro: `Categoria inválida para ${tipo}. Opções: ${CATEGORIAS_VALIDAS[tipo].join(", ")}.`,
    });
  }

  const novoLancamento = {
    id: uuidv4(),
    descricao: descricao.trim(),
    valor: parseFloat(valor.toFixed(2)),
    tipo,                                          // "entrada" ou "saida"
    categoria: categoria || "outros",
    data: data || new Date().toISOString().split("T")[0], // YYYY-MM-DD
    criadoEm: new Date().toISOString(),
  };

  await model.criarLancamento(novoLancamento);

  return res.status(201).json({
    mensagem: "Lançamento criado com sucesso.",
    lancamento: novoLancamento,
  });

}  catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}

// ──────────────────────────────────────────
// GET /api/lancamentos
// Lista todos com filtros opcionais
// Query params: tipo, categoria, dataInicio, dataFim
// ──────────────────────────────────────────
async function listar(req, res) {
  try {

    const lancamentos = await model.listarTodos();

    return res.json({
      total: lancamentos.length,
      lancamentos,
    });

  } catch (error) {
    return res.status(500).json({
      erro: error.message,
    });
  }
}

// ──────────────────────────────────────────
// GET /api/lancamentos/:id
// Busca um lançamento pelo ID
// ──────────────────────────────────────────
function buscarPorId(req, res) {
  const { id } = req.params;
  const lancamentos = lerTodos();

  const lancamento = lancamentos.find((l) => l.id === id);

  if (!lancamento) {
    return res.status(404).json({ erro: "Lançamento não encontrado." });
  }

  return res.json(lancamento);
}

// ──────────────────────────────────────────
// PUT /api/lancamentos/:id
// Atualiza um lançamento existente
// ──────────────────────────────────────────
function atualizar(req, res) {
  const { id } = req.params;
  const { descricao, valor, tipo, categoria, data } = req.body;

  const lancamentos = lerTodos();
  const index = lancamentos.findIndex((l) => l.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Lançamento não encontrado." });
  }

  // Validações (só valida os campos enviados)
  if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ erro: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(" ou ")}.` });
  }

  if (valor !== undefined && (typeof valor !== "number" || valor <= 0)) {
    return res.status(400).json({ erro: "O valor deve ser um número positivo." });
  }

  const tipoFinal = tipo || lancamentos[index].tipo;
  if (categoria && !CATEGORIAS_VALIDAS[tipoFinal].includes(categoria)) {
    return res.status(400).json({
      erro: `Categoria inválida para ${tipoFinal}. Opções: ${CATEGORIAS_VALIDAS[tipoFinal].join(", ")}.`,
    });
  }

  // Mescla os dados antigos com os novos (só atualiza o que foi enviado)
  lancamentos[index] = {
    ...lancamentos[index],
    descricao: descricao ? descricao.trim() : lancamentos[index].descricao,
    valor: valor !== undefined ? parseFloat(valor.toFixed(2)) : lancamentos[index].valor,
    tipo: tipo || lancamentos[index].tipo,
    categoria: categoria || lancamentos[index].categoria,
    data: data || lancamentos[index].data,
    atualizadoEm: new Date().toISOString(),
  };

  salvarTodos(lancamentos);

  return res.json({
    mensagem: "Lançamento atualizado com sucesso.",
    lancamento: lancamentos[index],
  });
}

// ──────────────────────────────────────────
// DELETE /api/lancamentos/:id
// Remove um lançamento
// ──────────────────────────────────────────
function deletar(req, res) {
  const { id } = req.params;
  const lancamentos = lerTodos();

  const index = lancamentos.findIndex((l) => l.id === id);

  if (index === -1) {
    return res.status(404).json({ erro: "Lançamento não encontrado." });
  }

  const [removido] = lancamentos.splice(index, 1);
  salvarTodos(lancamentos);

  return res.json({
    mensagem: "Lançamento removido com sucesso.",
    lancamento: removido,
  });
}

module.exports = { criar, listar, buscarPorId, atualizar, deletar };
