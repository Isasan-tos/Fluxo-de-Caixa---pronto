// src/server.js
const path = require('path');
const express = require('express');
const app = express();

const lancamentosRoutes = require('./routes/lancamentos.routes');
const resumoRoutes = require('./routes/resumo.routes');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());

// Rotas da API
app.use('/api/lancamentos', lancamentosRoutes);
app.use('/api/resumo', resumoRoutes);

// Servir front-end estático (ajuste o caminho conforme sua estrutura)
app.use(express.static(path.join(__dirname, 'frontend')));

// Opcional: entregar index.html na raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Middlewares de erro (deve ser o último)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});