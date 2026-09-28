/**
 * Promovează un utilizator la admin după email.
 * Usage: node scripts/promote-admin.js eneluisadrian@gmail.com
 */
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/promote-admin.js <email>');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function promote() {
  const found = await pool.query(
    'SELECT id, username, email, role FROM users WHERE email = $1',
    [email]
  );

  if (found.rows.length === 0) {
    console.log(`Nu există cont cu emailul: ${email}`);
    console.log('Înregistrează-te mai întâi din aplicație (/register), apoi rulează din nou:');
    console.log(`  node scripts/promote-admin.js ${email}`);
    process.exit(1);
  }

  const user = found.rows[0];

  if (user.role === 'admin') {
    console.log(`Contul ${email} este deja administrator.`);
    process.exit(0);
  }

  await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
  console.log(`Contul "${user.username}" (${email}) a fost promovat la admin.`);
  console.log('Deloghează-te și autentifică-te din nou pentru a vedea Panou Admin.');
}

promote()
  .catch((err) => {
    console.error('Eroare:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
