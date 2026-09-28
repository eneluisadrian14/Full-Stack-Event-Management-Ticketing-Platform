/**
 * Creează un cont administrator (sau promovează unul existent).
 * Usage: node scripts/create-admin.js <email> <username> <parola> <telefon>
 */
const path = require('path');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const [email, username, password, numar_telefon] = process.argv.slice(2);

if (!email || !username || !password || !numar_telefon) {
  console.error('Usage: node scripts/create-admin.js <email> <username> <parola> <telefon>');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function createOrPromoteAdmin() {
  const existing = await pool.query(
    'SELECT id, email, role FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existing.rows.length > 0) {
    const user = existing.rows[0];
    if (user.role === 'admin') {
      console.log(`Contul ${user.email} este deja administrator.`);
      return;
    }
    await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [user.id]);
    console.log(`Contul existent ${user.email} a fost promovat la admin.`);
    console.log('Folosește parola setată la înregistrare. Deloghează-te și loghează-te din nou.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, numar_telefon, role)
     VALUES ($1, $2, $3, $4, 'admin')
     RETURNING id, username, email, role`,
    [username, email, passwordHash, numar_telefon]
  );

  const user = result.rows[0];
  console.log('Cont administrator creat cu succes:');
  console.log(`  Email:    ${user.email}`);
  console.log(`  Username: ${user.username}`);
  console.log(`  Parolă:   (cea introdusă la comandă)`);
  console.log('');
  console.log('Autentifică-te la /login — vei vedea butonul Panou Admin.');
}

createOrPromoteAdmin()
  .catch((err) => {
    console.error('Eroare:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
