const mysql = require('mysql2/promise');
require('dotenv').config();

const poolEcommerce = mysql.createPool({
  host: process.env.DB_ECOMMERCE_HOST,
  port: parseInt(process.env.DB_ECOMMERCE_PORT) || 3306,
  user: process.env.DB_ECOMMERCE_USER,
  password: process.env.DB_ECOMMERCE_PASSWORD,
  database: 'db_gringao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

const poolLojaFisica = mysql.createPool({
  host: process.env.DB_LOJA_HOST,
  port: parseInt(process.env.DB_LOJA_PORT) || 3306,
  user: process.env.DB_LOJA_USER,
  password: process.env.DB_LOJA_PASSWORD,
  database: 'loja_fisica',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

module.exports = { poolEcommerce, poolLojaFisica };
