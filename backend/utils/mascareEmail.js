/**
 * eneluisadrian@gmail.com → ene***********@gmail.com
 */
function mascareEmail(email) {
  if (!email || typeof email !== 'string') return '***@***';

  const parts = email.trim().split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return '***@***';

  const [local, domain] = parts;
  const prefix = local.slice(0, 3);
  const rest = Math.max(local.length - 3, 3);
  return `${prefix}${'*'.repeat(rest)}@${domain}`;
}

module.exports = { mascareEmail };
