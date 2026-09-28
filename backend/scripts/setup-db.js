/**
 * Script de inițializare baza de date ManFast.
 * Rulează din backend: npm run setup-db
 * Creează baza de date dacă lipsește, apoi tabelele.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const schemaPath = path.join(__dirname, '../../database/schema.sql');

function getPoolConfig(database) {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database,
  };
}

async function ensureDatabaseExists(dbName) {
  const adminPool = new Pool(getPoolConfig('postgres'));

  try {
    const exists = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (exists.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`Baza de date "${dbName}" a fost creată.`);
    } else {
      console.log(`Baza de date "${dbName}" există deja.`);
    }
  } finally {
    await adminPool.end();
  }
}

async function setup() {
  const required = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('Variabile lipsă în backend/.env:', missing.join(', '));
    console.error('Copiază backend/.env.example în backend/.env și completează valorile.');
    process.exit(1);
  }

  const dbName = process.env.DB_NAME;

  try {
    await ensureDatabaseExists(dbName);
  } catch (err) {
    console.error('Eroare la crearea bazei de date:', err.message);
    console.error('Verifică că PostgreSQL rulează și că userul din .env are drept CREATE DATABASE.');
    process.exit(1);
  }

  const pool = new Pool(getPoolConfig(dbName));

  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Schema ManFast a fost creată/actualizată cu succes.');
    console.log('');
    console.log('Pentru cont admin, după înregistrare rulează în PostgreSQL:');
    console.log("  UPDATE users SET role = 'admin' WHERE email = 'emailul-tau@exemplu.com';");
    console.log('');
    console.log('Apoi repornește backend-ul: npm run dev');
  } catch (err) {
    console.error('Eroare la setup DB:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setup();
