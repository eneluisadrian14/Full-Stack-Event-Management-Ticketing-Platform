const nodemailer = require('nodemailer');

function smtpConfigurat() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM
  );
}

function creazaTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function trimiteEmailResetare(emailDestinatar, linkResetare) {
  const subiect = 'ManFast — Resetare parolă';
  const text = `Ai solicitat resetarea parolei ManFast.\n\nApasă link-ul de mai jos (valabil 1 oră):\n${linkResetare}\n\nDacă nu ai solicitat tu, ignoră acest email.`;
  const html = `
    <p>Ai solicitat resetarea parolei <strong>ManFast</strong>.</p>
    <p><a href="${linkResetare}">Resetează parola</a></p>
    <p>Link-ul expiră în <strong>1 oră</strong>.</p>
    <p>Dacă nu ai solicitat tu, ignoră acest email.</p>
  `;

  const logInConsola = () => {
    console.log('\n========== RESET PAROLĂ (link în consolă) ==========');
    console.log(`Către: ${emailDestinatar}`);
    console.log(`Link:  ${linkResetare}`);
    console.log('==================================================\n');
  };

  if (!smtpConfigurat()) {
    logInConsola();
    return { trimis: false, mod: 'consola' };
  }

  try {
    const transport = creazaTransport();
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: emailDestinatar,
      subject: subiect,
      text,
      html,
    });
    return { trimis: true, mod: 'smtp' };
  } catch (err) {
    console.error('Eroare trimitere email SMTP:', err.message);
    logInConsola();
    return { trimis: false, mod: 'consola', eroare: err.message };
  }
}

async function trimiteEmailVerificareInregistrare(emailDestinatar, cod) {
  const subiect = 'ManFast — Cod de verificare cont';
  const text = `Bine ai venit la ManFast!\n\nCodul tău de verificare este: ${cod}\n\nCodul expiră în 15 minute. Dacă nu ai creat un cont, ignoră acest email.`;
  const html = `
    <p>Bine ai venit la <strong>ManFast</strong>!</p>
    <p>Codul tău de verificare este:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${cod}</p>
    <p>Codul expiră în <strong>15 minute</strong>.</p>
    <p>Dacă nu ai creat un cont, ignoră acest email.</p>
  `;

  const logInConsola = () => {
    console.log('\n========== VERIFICARE ÎNREGISTRARE (cod în consolă) ==========');
    console.log(`Către: ${emailDestinatar}`);
    console.log(`Cod:   ${cod}`);
    console.log('============================================================\n');
  };

  if (!smtpConfigurat()) {
    logInConsola();
    return { trimis: false, mod: 'consola' };
  }

  try {
    const transport = creazaTransport();
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: emailDestinatar,
      subject: subiect,
      text,
      html,
    });
    return { trimis: true, mod: 'smtp' };
  } catch (err) {
    console.error('Eroare trimitere email SMTP:', err.message);
    logInConsola();
    return { trimis: false, mod: 'consola', eroare: err.message };
  }
}

module.exports = {
  smtpConfigurat,
  trimiteEmailResetare,
  trimiteEmailVerificareInregistrare,
};
