function normalizeazaTelefon(telefon) {
  if (!telefon || typeof telefon !== 'string') return '';
  const cifre = telefon.replace(/\D/g, '');

  if (cifre.length === 0) return '';

  // Format RO: păstrează ultimele 10 cifre (ex. 0712345678)
  if (cifre.length >= 10) {
    const ultimele = cifre.slice(-10);
    return ultimele.startsWith('0') ? ultimele : `0${ultimele.slice(-9)}`;
  }

  return cifre.startsWith('0') ? cifre : `0${cifre}`;
}

function esteEmail(identifier) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((identifier || '').trim());
}

function valideazaTelefon(telefon) {
  const normalizat = normalizeazaTelefon(telefon);
  if (normalizat.length < 10) {
    return { ok: false, error: 'Introdu un număr de telefon valid (10 cifre).' };
  }
  return { ok: true, telefon: normalizat };
}

module.exports = {
  normalizeazaTelefon,
  esteEmail,
  valideazaTelefon,
};
