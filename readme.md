# Fluxo de Caixa — Backend

API REST para gerenciamento de fluxo de caixa. Projeto de faculdade — Node.js + Express.

## Tecnologias

- Node.js
- Express.js
- MySQL
- mysql2
- UUID (geração de IDs únicos)
- CORS (integração com o frontend)

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
# Arquivo: src/config/database.js
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
fluxo-caixa-backend/
├── src/
│   ├── server.js                           # Ponto de entrada da aplicação
│   │
│   ├── config/
│   │   └── database.js                    # Configuração conexão MySQL
│   │
│   ├── routes/
│   │   ├── lancamentos.routes.js          # Define as URLs de lançamentos
│   │   └── resumo.routes.js               # Define a URL de resumo
│   │
│   ├── controllers/
│   │   ├── lancamentos.controller.js      # Lógica do CRUD
│   │   └── resumo.controller.js           # Lógica do resumo financeiro
│   │
│   ├── middlewares/
│   │   └── errorHandler.js                # Tratamento global de erros
│   │
│   └── models/
│       └── lancamentos.model.js           # Comunicação com MySQL
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
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

## Próximos passos (quando evoluir o projeto)

- Adicionar autenticação com JWT
- Implementar dashboard financeiro
- Adicionar gráficos financeiros
- Criar sistema de usuários

