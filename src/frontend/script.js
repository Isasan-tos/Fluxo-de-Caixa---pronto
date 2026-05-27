// Configuração
const API_BASE_URL = "http://localhost:3000"; 

// Elementos DOM (Ajustados exatamente para os IDs do seu index.html)
const apiStatusEl = document.getElementById("apiStatus");

// Elementos das Tabelas
const tbodyRecentes = document.getElementById("tbodyRecentes");
const tbodyLancamentos = document.getElementById("tbodyLancamentos");

// Elementos dos Cards de Resumo
const valorSaldo = document.getElementById("valorSaldo");
const valorEntradas = document.getElementById("valorEntradas");
const valorSaidas = document.getElementById("valorSaidas");
const qtdLancamentosEl = document.getElementById("qtdLancamentos");
const categoriaGrid = document.getElementById("categoriaGrid");

// Elementos do Formulário de Cadastro
const btnSalvar = document.getElementById("btnSalvar");
const inputDescricao = document.getElementById("fDescricao");
const inputValor = document.getElementById("fValor");
const inputTipo = document.getElementById("fTipo");
const inputCategoria = document.getElementById("fCategoria");
const inputData = document.getElementById("fData");

// --- SISTEMA DE NAVEGAÇÃO ENTRE TELAS ---
// Faz os botões da barra lateral e os botões de "+ Novo" funcionarem
document.querySelectorAll('[data-view]').forEach(elemento => {
    elemento.addEventListener('click', () => {
        const targetView = elemento.getAttribute('data-view');
        
        // Esconde todas as seções e remove o active dos botões
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        
        // Ativa a seção correspondente
        const section = document.getElementById(`view-${targetView}`);
        if (section) section.classList.add('active');
        
        // Ativa o botão correspondente na sidebar se existir
        const navItem = document.querySelector(`.sidebar-nav [data-view="${targetView}"]`);
        if (navItem) navItem.classList.add('active');
    });
});

// --- BUSCAR STATUS DA API ---
async function fetchApiStatus() {
  try {
    const res = await fetch(API_BASE_URL + "/");
    const data = await res.json();
    if (res.ok && apiStatusEl) {
      const dot = apiStatusEl.querySelector('.status-dot');
      if (dot) dot.style.background = "#2d9d6a"; // Verde se online
    }
  } catch (e) {
    if (apiStatusEl) {
      const dot = apiStatusEl.querySelector('.status-dot');
      if (dot) dot.style.background = "#e74c3c"; // Vermelho se offline
    }
  }
}

// --- LISTAR LANÇAMENTOS (Preenche a tabela geral e a de recentes) ---
async function fetchLancamentos() {
  if (tbodyLancamentos) tbodyLancamentos.innerHTML = "";
  if (tbodyRecentes) tbodyRecentes.innerHTML = "";
  
  try {
    const res = await fetch(API_BASE_URL + "/api/lancamentos");
    if (!res.ok) throw new Error("Erro ao buscar lançamentos");
    
    // --- ALTERAÇÃO AQUI: Lemos a resposta do back-end ---
    const dados = await res.json(); 
    
    // --- ALTERAÇÃO AQUI: Extraímos a lista real de lançamentos que está lá dentro ---
    const lancamentos = dados.lancamentos || []; 
    
    if (lancamentos.length === 0) {
      const semDados = `<tr><td colspan="6" style="text-align:center;">Nenhum lançamento encontrado.</td></tr>`;
      if (tbodyLancamentos) tbodyLancamentos.innerHTML = semDados;
      if (tbodyRecentes) tbodyRecentes.innerHTML = semDados;
      return;
    }

    // Preenche a tabela principal de Lançamentos
    lancamentos.forEach((l) => {
      const tr = document.createElement("tr");
      const classeTipo = l.tipo === 'entrada' ? 'text-success' : 'text-danger';
      const sinal = l.tipo === 'entrada' ? '+' : '-';

      tr.innerHTML = `
        <td>${l.data ? new Date(l.data).toLocaleDateString('pt-BR') : ""}</td>
        <td><strong>${l.descricao ?? ""}</strong></td>
        <td><span class="badge-item">${l.categoria ?? "Outros"}</span></td>
        <td><span class="${classeTipo}">${l.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}</span></td>
        <td class="th-right ${classeTipo}">${sinal} R$ ${Number(l.valor || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
        <td class="th-right">
            <button class="btn-ghost btn-ghost-red small" onclick="deletarLancamento('${l.id}')">Excluir</button>
        </td>
      `;
      if (tbodyLancamentos) tbodyLancamentos.appendChild(tr);
    });

    // Preenche a tabela de Últimos Lançamentos do Painel (máximo 5 itens)
    const recentes = lancamentos.slice(0, 5);
    recentes.forEach((l) => {
      const tr = document.createElement("tr");
      const classeTipo = l.tipo === 'entrada' ? 'text-success' : 'text-danger';
      
      tr.innerHTML = `
        <td>${l.data ? new Date(l.data).toLocaleDateString('pt-BR') : ""}</td>
        <td>${l.descricao ?? ""}</td>
        <td>${l.categoria ?? "Outros"}</td>
        <td><span class="${classeTipo}">${l.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
        <td class="th-right ${classeTipo}">R$ ${Number(l.valor || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
      `;
      if (tbodyRecentes) tbodyRecentes.appendChild(tr);
    });

  } catch (e) {
    const trErro = `<tr><td colspan="6" style="color:red;">Erro ao carregar dados: ${e.message}</td></tr>`;
    if (tbodyLancamentos) tbodyLancamentos.innerHTML = trErro;
    if (tbodyRecentes) tbodyRecentes.innerHTML = trErro;
  }
}

// --- CRIAR NOVO LANÇAMENTO (Vinculado ao clique do botão Salvar) ---
if (btnSalvar) {
  btnSalvar.addEventListener("click", async (e) => {
    e.preventDefault();

    // Captura os valores usando os IDs reais do seu HTML
    const data = inputData.value;
    const descricao = inputDescricao.value;
    const valor = parseFloat(inputValor.value);
    const tipo = inputTipo.value;
    const categoria = inputCategoria.value;

    // Validação básica dos campos obrigatórios com asterisco (*)
    if (!descricao || !valor || !tipo) {
        alert("Por favor, preencha todos os campos obrigatórios (*)");
        return;
    }

    const payload = { data, descricao, valor, tipo, categoria };

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

      // Limpar campos manualmente (já que não estamos usando uma tag <form>)
      inputDescricao.value = "";
      inputValor.value = "";
      inputTipo.value = "";
      inputCategoria.value = "";
      inputData.value = "";

      alert("Lançamento salvo com sucesso!");
      
      // Atualiza a listagem e o painel financeiro
      await fetchLancamentos();
      await fetchResumo();

      // Redireciona o usuário de volta para a tela de listagem
      const btnVoltar = document.querySelector('#view-novo .btn-ghost');
      if (btnVoltar) btnVoltar.click();

    } catch (err) {
      alert("Erro ao criar lançamento: " + err.message);
    }
  });
}

// --- ATUALIZAÇÃO DINÂMICA DAS CATEGORIAS ---
// Mapeamento das categorias exatamente como estão no seu backend
const categoriasPorTipo = {
  entrada: [
    { value: "salario", label: "Salário" },
    { value: "freelance", label: "Freelance" },
    { value: "investimento", label: "Investimento" },
    { value: "venda", label: "Venda" },
    { value: "outros", label: "Outros" }
  ],
  saida: [
    { value: "alimentacao", label: "Alimentação" },
    { value: "transporte", label: "Transporte" },
    { value: "moradia", label: "Moradia" },
    { value: "saude", label: "Saúde" },
    { value: "educacao", label: "Educação" },
    { value: "lazer", label: "Lazer" },
    { value: "outros", label: "Outros" }
  ]
};

// Monitora quando o usuário muda o campo "Tipo" (fTipo)
if (inputTipo && inputCategoria) {
  inputTipo.addEventListener("change", (e) => {
    const tipoSelecionado = e.target.value; // Pode ser "entrada", "saida" ou ""

    // Limpa as opções atuais da caixinha de categoria
    inputCategoria.innerHTML = "";

    // Se o usuário não selecionou nada, deixa a mensagem padrão
    if (!tipoSelecionado) {
      inputCategoria.innerHTML = '<option value="">Selecione o tipo primeiro</option>';
      return;
    }

    // Adiciona uma opção padrão para a categoria
    inputCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';

    // Pega a lista de categorias correspondente ao tipo e insere no HTML
    const categorias = categoriasPorTipo[tipoSelecionado] || [];
    categorias.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.value;
      option.textContent = cat.label;
      inputCategoria.appendChild(option);
    });
  });
}

// --- BUSCAR RESUMO (Preenche os cards do Painel) ---
async function fetchResumo() {
  try {
    const res = await fetch(API_BASE_URL + "/api/resumo");
    if (!res.ok) throw new Error("Erro ao buscar resumo");
    const resumo = await res.json();
    
    // Alimenta os elementos HTML do Dashboard se eles existirem na resposta da API
    if (valorSaldo) valorSaldo.textContent = `R$ ${Number(resumo?.saldoAtual ?? resumo?.saldo ?? 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (valorEntradas) valorEntradas.textContent = `R$ ${Number(resumo?.totalEntradas ?? 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (valorSaidas) valorSaidas.textContent = `R$ ${Number(resumo?.totalSaidas ?? 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    if (qtdLancamentosEl) qtdLancamentosEl.textContent = `${resumo?.qtdLancamentos ?? 0} lançamentos`;

    // Atualiza a grade de categorias se disponível
    if (categoriaGrid && resumo?.porCategoria) {
        categoriaGrid.innerHTML = "";
        Object.entries(resumo.porCategoria).forEach(([cat, val]) => {
            categoriaGrid.innerHTML += `
                <div class="categoria-item">
                    <span>${cat}</span>
                    <strong>R$ ${Number(val).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
                </div>
            `;
        });
    }
  } catch (e) {
    console.error("Erro ao carregar resumo: " + e.message);
  }
}

// Inicialização Automática ao carregar a página
(async function init() {
  await fetchApiStatus();
  await fetchLancamentos();
  await fetchResumo();
})();