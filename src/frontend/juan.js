// Configuração
// Atualize se a API não estiver na mesma origem/local
const API_BASE_URL = "http://localhost:3000"; // ajuste conforme necessário

// Elementos DOM
const apiStatusEl = document.getElementById("api-status");
const btnRefreshStatus = document.getElementById("btn-refresh-status");

const lancForm = document.getElementById("lanc-form");
const lancTableBody = document.querySelector("#lanc-table tbody");

const resumoContentEl = document.getElementById("resumo-content");
const btnRefreshResumo = document.getElementById("btn-refresh-resumo");

// Buscar status da API (rota raiz)
async function fetchApiStatus() {
  try {
    const res = await fetch(API_BASE_URL + "/");
    const data = await res.json();
    if (res.ok) {
      apiStatusEl.textContent = data.mensagem + ` • versão ${data.versao || ""}`;
      // Opcional: listar rotas recebidas
      if (data.rotas) {
        apiStatusEl.title = "Rotas: " +
          Object.values(data.rotas).join(", ");
      }
      apiStatusEl.style.background = "#2d9d6a";
    } else {
      apiStatusEl.textContent = "API não respondeu corretamente";
      apiStatusEl.style.background = "#e67e22";
    }
  } catch (e) {
    apiStatusEl.textContent = "Erro ao conectar à API";
    apiStatusEl.style.background = "#e74c3c";
  }
}

// Listar lançamentos
async function fetchLancamentos() {
  lancTableBody.innerHTML = "";
  try {
    const res = await fetch(API_BASE_URL + "/api/lancamentos");
    if (!res.ok) {
      throw new Error("Erro ao buscar lançamentos");
    }
    const lancamentos = await res.json();
    // Supondo array de objetos { id, data, descricao, tipo, categoria, valor }
    lancamentos.forEach((l) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${l.id ?? ""}</td>
        <td>${l.data ?? l.date ?? ""}</td>
        <td>${l.descricao ?? ""}</td>
        <td>${l.tipo ?? ""}</td>
        <td>${l.categoria ?? ""}</td>
        <td>${l.valor != null ? Number(l.valor).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ""}</td>
      `;
      lancTableBody.appendChild(tr);
    });
    if (lancamentos.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="6">Nenhum lançamento encontrado.</td>`;
      lancTableBody.appendChild(tr);
    }
  } catch (e) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6">Erro ao carregar lançamentos: ${e.message}</td>`;
    lancTableBody.appendChild(tr);
  }
}

// Criar novo lançamento
if (lancForm) {
  lancForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = document.getElementById("lanc-data").value;
    const descricao = document.getElementById("lanc-descricao").value;
    const valor = parseFloat(document.getElementById("lanc-valor").value);
    const tipo = document.getElementById("lanc-tipo").value;
    const categoria = document.getElementById("lanc-categoria").value;

    const payload = {
      data,
      descricao,
      valor,
      tipo,
      categoria,
    };

    try {
      const res = await fetch(API_BASE_URL + "/api/lancamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Falha ao criar lançamento");
      }

      // Limpar o formulário
      lancForm.reset();
      // Atualizar a lista
      await fetchLancamentos();
    } catch (err) {
      alert("Erro ao criar lançamento: " + err.message);
    }
  });
}

// Buscar resumo
async function fetchResumo() {
  try {
    const res = await fetch(API_BASE_URL + "/api/resumo");
    if (!res.ok) throw new Error("Erro ao buscar resumo");
    const resumo = await res.json();
    // Mostrar de forma simples; ajuste conforme a estrutura real
    resumoContentEl.innerHTML = `
      <strong>Resumo:</strong><br/>
      ${resumo?.periodo ?? ""} • ${resumo?.saldo ?? resumo?.saldoAtual ?? ""} Now
      ${resumo?.totalReceitas != null ? `Receitas: ${Number(resumo.totalReceitas).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ` : ""}
      ${resumo?.totalDespesas != null ? `Despesas: ${Number(resumo.totalDespesas).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : ""}
    `;
  } catch (e) {
    resumoContentEl.innerHTML = "Erro ao carregar resumo: " + e.message;
  }
}

// Botões de refresh
btnRefreshStatus.addEventListener("click", fetchApiStatus);
btnRefreshResumo.addEventListener("click", fetchResumo);

// Inicialização
(async function init() {
  await fetchApiStatus();
  await fetchLancamentos();
  await fetchResumo();
})();