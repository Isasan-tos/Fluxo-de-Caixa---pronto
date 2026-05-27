const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Isa@301276",
  database: "fluxo_caixa",
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;