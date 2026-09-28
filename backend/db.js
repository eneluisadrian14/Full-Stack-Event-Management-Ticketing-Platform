const { Pool } = require('pg');
require('dotenv').config();

// Configuram un "Pool" de conexiuni folosind datele secrete din .env
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Testam conexiunea cand porneste serverul
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Eroare la conectarea cu PostgreSQL:', err.stack);
  } else {
    console.log('✅ Conexiunea cu PostgreSQL a fost realizata cu succes!');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};