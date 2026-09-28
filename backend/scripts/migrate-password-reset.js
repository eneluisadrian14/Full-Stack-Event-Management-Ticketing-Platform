/**
 * Migrare: unicitate telefon + tabel password_reset_tokens.
 * Usage: npm run migrate-password-reset
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrationPath = path.join(
  __dirname,
  '../../database/migrations/add-unique-telefon-reset-tokens.sql'
);

async function migrate() {
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(sql);

    const { normalizeazaTelefon } = require('../utils/telefon');
    const users = await pool.query('SELECT id, numar_telefon FROM users WHERE numar_telefon IS NOT NULL');
    for (const row of users.rows) {
      const normalizat = normalizeazaTelefon(row.numar_telefon);
      if (normalizat && normalizat !== row.numar_telefon) {
        await pool.query('UPDATE users SET numar_telefon = $1 WHERE id = $2', [normalizat, row.id]);
      }
    }

    console.log('Migrare password reset / telefon unique finalizată.');
  } catch (err) {
    console.error('Eroare migrare:', err.message);
    if (err.message.includes('duplicate key') || err.code === '23505') {
      console.error('Există numere de telefon duplicate în users — rezolvă manual înainte de migrare.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
