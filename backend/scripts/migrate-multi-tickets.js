/**
 * Permite mai multe bilete per sesiune Stripe (elimină UNIQUE pe stripe_session_id).
 * Rulează o dată: npm run migrate-multi-tickets
 */
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function migrate() {
  await pool.query(`
    ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_stripe_session_id_key;
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tickets_stripe_session_id ON tickets(stripe_session_id);
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_session_nume
    ON tickets(stripe_session_id, nume_buletin);
  `);
  console.log('Migrare reușită: mai multe bilete per sesiune Stripe sunt permise acum.');
}

migrate()
  .catch((err) => {
    console.error('Eroare migrare:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
