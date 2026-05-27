const pool = require("../config/database");

// LISTAR TODOS
async function listarTodos() {
  const [rows] = await pool.query(
    "SELECT * FROM lancamentos ORDER BY data DESC"
  );

  return rows;
}

// BUSCAR POR ID
async function buscarPorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM lancamentos WHERE id = ?",
    [id]
  );

  return rows[0];
}

// CRIAR LANÇAMENTO
async function criarLancamento(dados) {
  const sql = `
    INSERT INTO lancamentos
    (id, descricao, valor, tipo, categoria, data)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await pool.query(sql, [
    dados.id,
    dados.descricao,
    dados.valor,
    dados.tipo,
    dados.categoria,
    dados.data
  ]);
}

// ATUALIZAR
async function atualizarLancamento(id, dados) {
  const sql = `
    UPDATE lancamentos
    SET descricao = ?,
        valor = ?,
        tipo = ?,
        categoria = ?,
        data = ?
    WHERE id = ?
  `;

  await pool.query(sql, [
    dados.descricao,
    dados.valor,
    dados.tipo,
    dados.categoria,
    dados.data,
    id
  ]);
}

// DELETAR
async function deletarLancamento(id) {
  await pool.query(
    "DELETE FROM lancamentos WHERE id = ?",
    [id]
  );
}

module.exports = {
  listarTodos,
  buscarPorId,
  criarLancamento,
  atualizarLancamento,
  deletarLancamento
};