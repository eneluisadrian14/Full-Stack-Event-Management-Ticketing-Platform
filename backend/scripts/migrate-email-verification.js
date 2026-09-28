/**
 * Migrare: tabel registration_verifications pentru verificare email la înregistrare.
 * Usage: npm run migrate-email-verification
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrationPath = path.join(
  __dirname,
  '../../database/migrations/add-registration-verification.sql'
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
    console.log('Migrare verificare email la înregistrare finalizată.');
  } catch (err) {
    console.error('Eroare migrare:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
