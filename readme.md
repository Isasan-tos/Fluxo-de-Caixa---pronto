# Sistema de Fluxo de Caixa ◈

Aplicação Full-Stack para gerenciamento e controle financeiro pessoal ou empresarial. Projeto desenvolvido com arquitetura MVC utilizando Node.js no ecossistema do backend e JavaScript Vanila com manipulação dinâmica do DOM no frontend, integrado a um banco de dados relacional MySQL.

---

## Tecnologias Utilizadas

### Frontend
- **HTML5 & CSS3:** Interface responsiva com padrão estético moderno e estruturação em visualizações de tela única (Single Page Application simulada).
- **JavaScript (ES6+):** Manipulação dinâmica de tabelas, controle assíncrono de requisições de API (`Fetch API`), mapeamento de eventos dinâmicos por Tipo de lançamento e sistema nativo de navegação estrutural.

### Backend
- **Node.js & Express.js:** Criação e estruturação da API RESTful.
- **MySQL & mysql2:** Armazenamento persistente de dados com gerenciamento de conexões otimizado (`Pool de conexões`).
- **UUID (v4):** Geração de chaves primárias identificadoras universais para os registros.
- **CORS:** Middleware para liberação e segurança das requisições entre origens.

---
---

## Como rodar

```bash
# 1. Instalar as dependências
npm install

# 2. Configurar o banco MySQL
CREATE DATABASE fluxo_caixa;

USE fluxo_caixa;

CREATE TABLE lancamentos (
    id VARCHAR(36) PRIMARY KEY,
    descricao VARCHAR(255),
    valor DECIMAL(10,2),
    tipo VARCHAR(20),
    categoria VARCHAR(100),
    data DATE
    );

# 3. Configurar conexão com o MySQL
# Arquivo: src/config/db.js
# Arquivo: src/models/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "SUA_SENHA",
  database: "fluxo_caixa"
});

module.exports = pool;

# 4. Rodar em modo desenvolvimento (reinicia sozinho ao salvar)
npm run dev

# 5. Rodar em modo produção
npm start
```

A API ficará disponível em: `http://localhost:3000`

---

## Estrutura de pastas

```
fluxo-caixa/
├── frontend/
│   ├── index.html                  # Estrutura visual das seções (Painel, Lançamentos, Novo)
│   ├── styles.css                  # Estilização da interface e componentes
│   └── script.js                   # Sistema de rotas frontend, validação e Fetch API
│
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Configuração e Pool de conexão com o MySQL
│   │   ├── controllers/
│   │   │   ├── lancamentos.controller.js # Regras de negócio e intermediação do CRUD
│   │   │   └── resumo.controller.js      # Operações matemáticas de consolidação do saldo
│   │   ├── middlewares/
│   │   │   └── errorHandler.js     # Captura e tratamento global de erros HTTP
│   │   ├── models/
│   │   │   └── lancamentos.model.js # Queries e interações diretas com o banco MySQL
│   │   ├── routes/
│   │   │   ├── lancamentos.routes.js # Definição dos endpoints de lançamentos
│   │   │   └── resumo.routes.js      # Definição do endpoint de balanço geral
│   │   └── server.js               # Inicialização do servidor e distribuição estática
│   ├── package.json
│   └── README.md
```

---

## Rotas da API

### Lançamentos

| Método | Rota                      | Descrição                        |
|--------|---------------------------|----------------------------------|
| POST   | /api/lancamentos          | Criar um lançamento              |
| GET    | /api/lancamentos          | Listar todos (com filtros)       |
| GET    | /api/lancamentos/:id      | Buscar um lançamento por ID      |
| PUT    | /api/lancamentos/:id      | Atualizar um lançamento          |
| DELETE | /api/lancamentos/:id      | Deletar um lançamento            |
| GET    | /api/resumo               | Resumo financeiro (saldo)        |

---

### POST /api/lancamentos — Criar

**Body (JSON):**
```json
{
  "descricao": "Salário de maio",
  "valor": 3500.00,
  "tipo": "entrada",
  "categoria": "salario",
  "data": "2025-05-01"
}
```

- `descricao` — obrigatório
- `valor` — obrigatório, número positivo
- `tipo` — obrigatório: `"entrada"` ou `"saida"`
- `categoria` — opcional (veja lista abaixo)
- `data` — opcional, formato `YYYY-MM-DD` (padrão: hoje)

**Categorias de entrada:** salario, freelance, investimento, venda, outros

**Categorias de saída:** alimentacao, transporte, moradia, saude, educacao, lazer, outros

---

### GET /api/lancamentos — Listar

**Filtros opcionais via query params:**
```
GET /api/lancamentos?tipo=saida
GET /api/lancamentos?categoria=alimentacao
GET /api/lancamentos?dataInicio=2025-05-01&dataFim=2025-05-31
GET /api/lancamentos?tipo=saida&dataInicio=2025-05-01
```

---

### GET /api/lancamentos/:id — Buscar por ID

```
GET /api/lancamentos/550e8400-e29b-41d4-a716-446655440000
```

---

### PUT /api/lancamentos/:id — Atualizar

Envie apenas os campos que deseja alterar:

```json
{
  "descricao": "Salário de maio (corrigido)",
  "valor": 3800.00
}
```

---

### DELETE /api/lancamentos/:id — Deletar

```
DELETE /api/lancamentos/550e8400-e29b-41d4-a716-446655440000
```

---

### GET /api/resumo — Resumo financeiro

```
GET /api/resumo
GET /api/resumo?dataInicio=2025-05-01&dataFim=2025-05-31
```

**Resposta:**
```json
{
  "periodo": { "dataInicio": "2025-05-01", "dataFim": "2025-05-31" },
  "totalEntradas": 5000.00,
  "totalSaidas": 2300.00,
  "saldo": 2700.00,
  "situacao": "positivo",
  "quantidadeLancamentos": 8,
  "porCategoria": {
    "salario": { "entradas": 5000.00, "saidas": 0 },
    "alimentacao": { "entradas": 0, "saidas": 800.00 }
  }
}
```

---

## Melhorias implementadas

- Substituição do banco JSON por MySQL
- Criação da camada models
- Integração utilizando mysql2
- Separação da conexão em config/database.js
- Uso de async/await
- Organização em arquitetura MVC
- Tratamento global de erros
- Estrutura preparada para integração com frontend React
- Dashboard Financeiro (Painel): Exibição em tempo real do Saldo Atual (com badges dinâmicos de situação positiva/negativa), Totalizador acumulado de Entradas e Saídas diretamente calculados de queries do MySQL.
- Listagem em Tempo Real: Tabelas que extraem a resposta JSON estruturada do backend de forma segura e tratam estados vazios.
- Filtro Inteligente de Categorias: O formulário de cadastro atualiza os campos de seleção dinamicamente baseado no tipo selecionado (Ex: Exibe categorias como Salário e Venda se for Entrada; e Alimentação ou Transporte se for Saída).
- Navegação SPA nativa: Alternância fluida de telas no frontend utilizando seletores de atributos (data-view) sem a necessidade de recarregar a página.
- Robustez a Erros: Envelopamento de listeners contra carregamentos nulos e tratativas de exceção visual para requisições que falham.
