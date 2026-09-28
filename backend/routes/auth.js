const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { frontendUrl } = require('../config');
const { normalizeazaTelefon, esteEmail, valideazaTelefon } = require('../utils/telefon');
const { mascareEmail } = require('../utils/mascareEmail');
const { trimiteEmailResetare, trimiteEmailVerificareInregistrare } = require('../utils/email');

const DURATA_COD_INREGISTRARE_MIN = 15;
const COOLDOWN_RETRIMITERE_SEC = 60;
const MAX_CERERI_COD_15_MIN = 3;
const isDev = process.env.NODE_ENV !== 'production';

function depasesteLimitaCoduri(row) {
    if (isDev) return false;
    const secundeDeLaUltimulCod = (Date.now() - new Date(row.last_code_sent_at).getTime()) / 1000;
    if (secundeDeLaUltimulCod < COOLDOWN_RETRIMITERE_SEC) {
        return {
            status: 429,
            error: `Așteaptă ${Math.ceil(COOLDOWN_RETRIMITERE_SEC - secundeDeLaUltimulCod)} secunde înainte de a solicita un cod nou.`,
        };
    }
    if (inFereastraDe15Minute(row.last_code_sent_at) && row.codes_sent >= MAX_CERERI_COD_15_MIN) {
        return {
            status: 429,
            error: 'Prea multe cereri de cod. Încearcă din nou peste 15 minute.',
        };
    }
    return null;
}

const PAROLA_AUTORIZARE_ADMIN = process.env.ADMIN_AUTHORIZATION_PASSWORD || 'GoxvmC1VLnfj';
const MESAJ_RESET_GENERIC =
    'Dacă există un cont asociat, vei primi un email cu link de resetare a parolei.';

function verificaParolaAutorizare(parola_autorizare) {
    if (!parola_autorizare) {
        return { ok: false, status: 400, error: 'Introdu parola de autorizare.' };
    }
    if (parola_autorizare !== PAROLA_AUTORIZARE_ADMIN) {
        return { ok: false, status: 403, error: 'Parola de autorizare este incorectă.' };
    }
    return { ok: true };
}

function valideazaEmail(email) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false, error: 'Introdu un email valid.' };
    }
    return { ok: true, email: email.trim().toLowerCase() };
}

function genereazaCodVerificare() {
    return String(crypto.randomInt(100000, 1000000));
}

function hashCodVerificare(cod) {
    return crypto.createHash('sha256').update(String(cod).trim()).digest('hex');
}

async function valideazaDateInregistrare({ username, email, numar_telefon, password }) {
    if (!username || !email || !numar_telefon || !password) {
        return { ok: false, status: 400, error: 'Toate câmpurile sunt obligatorii!' };
    }

    const emailValid = valideazaEmail(email);
    if (!emailValid.ok) {
        return { ok: false, status: 400, error: emailValid.error };
    }

    const telefonValid = valideazaTelefon(numar_telefon);
    if (!telefonValid.ok) {
        return { ok: false, status: 400, error: telefonValid.error };
    }

    const usernameCurat = username.trim();
    if (usernameCurat.length < 3) {
        return {
            ok: false,
            status: 400,
            error: 'Numele de utilizator trebuie să aibă cel puțin 3 caractere.',
        };
    }

    if (password.length < 6) {
        return { ok: false, status: 400, error: 'Parola trebuie să aibă cel puțin 6 caractere.' };
    }

    return {
        ok: true,
        email: emailValid.email,
        username: usernameCurat,
        telefon: telefonValid.telefon,
    };
}

async function verificaDuplicateInregistrare(email, username, telefon) {
    const emailDuplicat = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailDuplicat.rows.length > 0) {
        return { ok: false, error: 'Acest email este deja folosit.' };
    }

    const usernameDuplicat = await db.query(
        `SELECT email FROM users WHERE username = $1
         UNION ALL
         SELECT email FROM registration_verifications WHERE username = $1 AND email <> $2
         LIMIT 1`,
        [username, email]
    );
    if (usernameDuplicat.rows.length > 0) {
        return { ok: false, error: 'Acest nume de utilizator este deja folosit.' };
    }

    const telefonDuplicat = await db.query(
        `SELECT email FROM users WHERE numar_telefon = $1
         UNION ALL
         SELECT email FROM registration_verifications WHERE numar_telefon = $1 AND email <> $2
         LIMIT 1`,
        [telefon, email]
    );
    if (telefonDuplicat.rows.length > 0) {
        return { ok: false, error: 'Acest număr de telefon este deja folosit.' };
    }

    return { ok: true };
}

function inFereastraDe15Minute(data) {
    return Date.now() - new Date(data).getTime() < 15 * 60 * 1000;
}

async function salveazaSiTrimiteCodInregistrare({ email, username, telefon, passwordHash }) {
    const cod = genereazaCodVerificare();
    const codeHash = hashCodVerificare(cod);
    const expiresAt = new Date(Date.now() + DURATA_COD_INREGISTRARE_MIN * 60 * 1000);
    const acum = new Date();

    await db.query(
        `INSERT INTO registration_verifications
            (email, username, password_hash, numar_telefon, code_hash, expires_at, last_code_sent_at, codes_sent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
         ON CONFLICT (email) DO UPDATE SET
            username = EXCLUDED.username,
            password_hash = EXCLUDED.password_hash,
            numar_telefon = EXCLUDED.numar_telefon,
            code_hash = EXCLUDED.code_hash,
            expires_at = EXCLUDED.expires_at,
            last_code_sent_at = EXCLUDED.last_code_sent_at,
            codes_sent = CASE
                WHEN registration_verifications.last_code_sent_at > NOW() - INTERVAL '15 minutes'
                THEN registration_verifications.codes_sent + 1
                ELSE 1
            END`,
        [email, username, passwordHash, telefon, codeHash, expiresAt, acum]
    );

    await trimiteEmailVerificareInregistrare(email, cod);
    return cod;
}

// ==========================================
// 1. ÎNREGISTRARE — trimite cod pe email (POST /api/auth/register)
// ==========================================
router.post('/register', async (req, res) => {
    const validare = await valideazaDateInregistrare(req.body);
    if (!validare.ok) {
        return res.status(validare.status).json({ error: validare.error });
    }

    const { email, username, telefon } = validare;

    try {
        const duplicate = await verificaDuplicateInregistrare(email, username, telefon);
        if (!duplicate.ok) {
            return res.status(400).json({ error: duplicate.error });
        }

        const pending = await db.query(
            'SELECT last_code_sent_at, codes_sent FROM registration_verifications WHERE email = $1',
            [email]
        );

        if (pending.rows.length > 0) {
            const limita = depasesteLimitaCoduri(pending.rows[0]);
            if (limita) {
                return res.status(limita.status).json({ error: limita.error });
            }
        }

        const passwordHash = await bcrypt.hash(req.body.password, 10);
        await salveazaSiTrimiteCodInregistrare({ email, username, telefon, passwordHash });

        res.json({
            requiresVerification: true,
            email,
            email_mascat: mascareEmail(email),
            message: `Am trimis un cod de verificare la ${mascareEmail(email)}. Introdu codul pentru a finaliza înregistrarea.`,
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email-ul, numele de utilizator sau telefonul este deja folosit.' });
        }
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la înregistrare!' });
    }
});

router.post('/register/verify', async (req, res) => {
    const { email, cod } = req.body;

    if (!email || !cod) {
        return res.status(400).json({ error: 'Introdu email-ul și codul de verificare.' });
    }

    const emailValid = valideazaEmail(email);
    if (!emailValid.ok) {
        return res.status(400).json({ error: emailValid.error });
    }

    const codCurat = String(cod).trim();
    if (!/^\d{6}$/.test(codCurat)) {
        return res.status(400).json({ error: 'Codul trebuie să conțină exact 6 cifre.' });
    }

    try {
        const pending = await db.query(
            `SELECT * FROM registration_verifications
             WHERE email = $1 AND code_hash = $2 AND expires_at > NOW()`,
            [emailValid.email, hashCodVerificare(codCurat)]
        );

        if (pending.rows.length === 0) {
            return res.status(400).json({ error: 'Cod invalid sau expirat. Solicită un cod nou.' });
        }

        const inregistrare = pending.rows[0];
        const duplicate = await verificaDuplicateInregistrare(
            inregistrare.email,
            inregistrare.username,
            inregistrare.numar_telefon
        );
        if (!duplicate.ok) {
            await db.query('DELETE FROM registration_verifications WHERE email = $1', [
                inregistrare.email,
            ]);
            return res.status(400).json({ error: duplicate.error });
        }

        const newUser = await db.query(
            'INSERT INTO users (username, email, password_hash, numar_telefon, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, numar_telefon, role',
            [
                inregistrare.username,
                inregistrare.email,
                inregistrare.password_hash,
                inregistrare.numar_telefon,
                'user',
            ]
        );

        await db.query('DELETE FROM registration_verifications WHERE email = $1', [
            inregistrare.email,
        ]);

        res.status(201).json({
            message: 'Contul ManFast a fost creat cu succes!',
            user: newUser.rows[0],
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email-ul sau numărul de telefon este deja folosit.' });
        }
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la verificarea codului!' });
    }
});

router.post('/register/resend', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Introdu email-ul.' });
    }

    const emailValid = valideazaEmail(email);
    if (!emailValid.ok) {
        return res.status(400).json({ error: emailValid.error });
    }

    try {
        const existentUser = await db.query('SELECT id FROM users WHERE email = $1', [emailValid.email]);
        if (existentUser.rows.length > 0) {
            return res.status(400).json({ error: 'Acest email are deja un cont activ.' });
        }

        const pending = await db.query(
            'SELECT * FROM registration_verifications WHERE email = $1',
            [emailValid.email]
        );

        if (pending.rows.length === 0) {
            return res.status(400).json({
                error: 'Nu există o înregistrare în așteptare pentru acest email. Completează formularul din nou.',
            });
        }

        const inregistrare = pending.rows[0];
        const limita = depasesteLimitaCoduri(inregistrare);
        if (limita) {
            return res.status(limita.status).json({ error: limita.error });
        }

        await salveazaSiTrimiteCodInregistrare({
            email: inregistrare.email,
            username: inregistrare.username,
            telefon: inregistrare.numar_telefon,
            passwordHash: inregistrare.password_hash,
        });

        res.json({
            email_mascat: mascareEmail(emailValid.email),
            message: `Am retrimis codul la ${mascareEmail(emailValid.email)}.`,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la retrimiterea codului.' });
    }
});

// ==========================================
// 2. RUTA DE AUTENTIFICARE (POST /api/auth/login)
// ==========================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Validare de bază
    if (!email || !password) {
        return res.status(400).json({ error: "Te rugăm să introduci email-ul și parola!" });
    }

    const emailValid = valideazaEmail(email);
    if (!emailValid.ok) {
        return res.status(400).json({ error: emailValid.error });
    }

    try {
        // 2. Căutăm utilizatorul în baza de date după email
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [emailValid.email]);

        // Dacă nu găsim email-ul, dăm o eroare generică (pentru securitate, să nu știe hackerii dacă email-ul e bun sau nu)
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Email sau parolă incorectă!" });
        }

        const user = userResult.rows[0];

        // 3. Verificăm dacă parola se potrivește cu hash-ul din baza de date
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Email sau parolă incorectă!" });
        }

        // 4. Generăm token-ul securizat JWT dacă parola e corectă
        // Token-ul va conține ID-ul utilizatorului și rolul lui (user/admin)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token-ul expiră automat după 24 de ore
        );

        // 5. Trimitem răspunsul către Frontend (fără hash-ul parolei, trimitem doar datele sigure și token-ul)
        res.json({
            message: "Autentificare reușită pe ManFast!",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                numar_telefon: user.numar_telefon,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Eroare de server la autentificare!" });
    }
});

function userPublic(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        numar_telefon: user.numar_telefon,
        role: user.role,
    };
}

function genereazaToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// ==========================================
// 3. PROFIL UTILIZATOR
// ==========================================
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, username, email, numar_telefon, role FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
        }

        res.json({ user: userPublic(result.rows[0]) });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la preluarea profilului.' });
    }
});

router.put('/profile', authenticateToken, async (req, res) => {
    const { username, email, numar_telefon } = req.body;

    if (!username?.trim() || !email?.trim() || !numar_telefon?.trim()) {
        return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii.' });
    }

    const emailValid = valideazaEmail(email);
    if (!emailValid.ok) {
        return res.status(400).json({ error: emailValid.error });
    }

    const usernameCurat = username.trim();
    if (usernameCurat.length < 3) {
        return res.status(400).json({ error: 'Numele de utilizator trebuie să aibă cel puțin 3 caractere.' });
    }

    const telefonValid = valideazaTelefon(numar_telefon);
    if (!telefonValid.ok) {
        return res.status(400).json({ error: telefonValid.error });
    }

    try {
        const emailDuplicat = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [
            emailValid.email,
            req.user.id,
        ]);
        if (emailDuplicat.rows.length > 0) {
            return res.status(400).json({ error: 'Acest email este deja folosit.' });
        }

        const usernameDuplicat = await db.query('SELECT id FROM users WHERE username = $1 AND id != $2', [
            usernameCurat,
            req.user.id,
        ]);
        if (usernameDuplicat.rows.length > 0) {
            return res.status(400).json({ error: 'Acest nume de utilizator este deja folosit.' });
        }

        const telefonDuplicat = await db.query('SELECT id FROM users WHERE numar_telefon = $1 AND id != $2', [
            telefonValid.telefon,
            req.user.id,
        ]);
        if (telefonDuplicat.rows.length > 0) {
            return res.status(400).json({ error: 'Acest număr de telefon este deja folosit.' });
        }

        const result = await db.query(
            `UPDATE users SET username = $1, email = $2, numar_telefon = $3
             WHERE id = $4
             RETURNING id, username, email, numar_telefon, role`,
            [usernameCurat, emailValid.email, telefonValid.telefon, req.user.id]
        );

        const user = result.rows[0];
        const token = genereazaToken(user);

        res.json({
            message: 'Profilul a fost actualizat cu succes.',
            user: userPublic(user),
            token,
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email-ul sau numărul de telefon este deja folosit.' });
        }
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la actualizarea profilului.' });
    }
});

router.put('/password', authenticateToken, async (req, res) => {
    const { parola_curenta, parola_noua } = req.body;

    if (!parola_curenta || !parola_noua) {
        return res.status(400).json({ error: 'Completează parola curentă și parola nouă.' });
    }

    if (parola_noua.length < 6) {
        return res.status(400).json({ error: 'Parola nouă trebuie să aibă cel puțin 6 caractere.' });
    }

    try {
        const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
        }

        const valida = await bcrypt.compare(parola_curenta, result.rows[0].password_hash);
        if (!valida) {
            return res.status(400).json({ error: 'Parola curentă este incorectă.' });
        }

        const passwordHash = await bcrypt.hash(parola_noua, 10);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.user.id]);

        res.json({ message: 'Parola a fost schimbată cu succes.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la schimbarea parolei.' });
    }
});

router.delete('/account', authenticateToken, async (req, res) => {
    const { parola } = req.body;

    if (!parola) {
        return res.status(400).json({ error: 'Introdu parola pentru a confirma ștergerea contului.' });
    }

    try {
        const result = await db.query(
            'SELECT id, role, password_hash FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
        }

        const user = result.rows[0];
        const parolaValida = await bcrypt.compare(parola, user.password_hash);

        if (!parolaValida) {
            return res.status(400).json({ error: 'Parola este incorectă.' });
        }

        if (user.role === 'admin') {
            const admini = await db.query("SELECT COUNT(*)::int AS total FROM users WHERE role = 'admin'");
            if (admini.rows[0].total <= 1) {
                return res.status(400).json({
                    error: 'Nu poți șterge ultimul cont de administrator. Promovează alt admin înainte.',
                });
            }
        }

        await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);

        res.json({ message: 'Contul tău a fost șters definitiv.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la ștergerea contului.' });
    }
});

async function gasesteUserDupaIdentifier(identifier) {
    const curat = (identifier || '').trim();
    if (!curat) return { user: null, tip: null };

    if (esteEmail(curat)) {
        const emailValid = valideazaEmail(curat);
        if (!emailValid.ok) return { user: null, tip: 'email' };
        const result = await db.query('SELECT id, email, numar_telefon FROM users WHERE email = $1', [
            emailValid.email,
        ]);
        return { user: result.rows[0] || null, tip: 'email' };
    }

    const telefonValid = valideazaTelefon(curat);
    if (!telefonValid.ok) return { user: null, tip: 'telefon' };
    const result = await db.query('SELECT id, email, numar_telefon FROM users WHERE numar_telefon = $1', [
        telefonValid.telefon,
    ]);
    return { user: result.rows[0] || null, tip: 'telefon' };
}

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// ==========================================
// 4. RESETARE PAROLĂ (forgot / reset)
// ==========================================
router.post('/forgot-password', async (req, res) => {
    const { identifier } = req.body;

    if (!identifier?.trim()) {
        return res.status(400).json({ error: 'Introdu email-ul sau numărul de telefon.' });
    }

    try {
        const { user, tip } = await gasesteUserDupaIdentifier(identifier);

        if (user) {
            const recent = await db.query(
                `SELECT COUNT(*)::int AS total FROM password_reset_tokens
                 WHERE user_id = $1 AND created_at > NOW() - INTERVAL '15 minutes'`,
                [user.id]
            );

            if (recent.rows[0].total >= 3) {
                return res.status(429).json({
                    error: 'Prea multe cereri de resetare. Încearcă din nou peste 15 minute.',
                });
            }

            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = hashResetToken(token);
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            await db.query(
                `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
                 VALUES ($1, $2, $3)`,
                [user.id, tokenHash, expiresAt]
            );

            const linkResetare = `${frontendUrl}/reset-password?token=${token}`;
            await trimiteEmailResetare(user.email, linkResetare);
        }

        const raspuns = { message: MESAJ_RESET_GENERIC };

        if (user && tip === 'telefon') {
            raspuns.email_mascat = mascareEmail(user.email);
            raspuns.message = `Am trimis un link de resetare a parolei la ${raspuns.email_mascat}. Verifică inbox-ul (și folderul Spam).`;
        }

        res.json(raspuns);
    } catch (err) {
        console.error('forgot-password error:', err.message);
        res.status(500).json({ error: 'Eroare de server la solicitarea resetării parolei.' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, parola_noua } = req.body;

    if (!token?.trim() || !parola_noua) {
        return res.status(400).json({ error: 'Token invalid sau parolă lipsă.' });
    }

    if (parola_noua.length < 6) {
        return res.status(400).json({ error: 'Parola nouă trebuie să aibă cel puțin 6 caractere.' });
    }

    try {
        const tokenHash = hashResetToken(token.trim());
        const tokenResult = await db.query(
            `SELECT id, user_id FROM password_reset_tokens
             WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
            [tokenHash]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ error: 'Link-ul de resetare este invalid sau a expirat.' });
        }

        const resetRow = tokenResult.rows[0];
        const passwordHash = await bcrypt.hash(parola_noua, 10);

        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
            passwordHash,
            resetRow.user_id,
        ]);
        await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [
            resetRow.id,
        ]);

        res.json({ message: 'Parola a fost resetată cu succes. Te poți autentifica acum.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la resetarea parolei.' });
    }
});

// ==========================================
// 5. CREARE CONT ADMIN (POST /api/auth/admin/create)
// ==========================================
router.post('/admin/create', authenticateToken, requireAdmin, async (req, res) => {
    const { email, parola_autorizare } = req.body;

    const auth = verificaParolaAutorizare(parola_autorizare);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const emailValid = valideazaEmail(email);
    if (!emailValid.ok) return res.status(400).json({ error: emailValid.error });

    const emailNormalizat = emailValid.email;

    try {
        const existent = await db.query(
            'SELECT id, username, email, role FROM users WHERE email = $1',
            [emailNormalizat]
        );

        if (existent.rows.length === 0) {
            return res.status(404).json({
                error: 'Nu există cont cu acest email. Persoana trebuie să se înregistreze mai întâi la /register.',
            });
        }

        const user = existent.rows[0];

        if (user.role === 'admin') {
            return res.status(400).json({ error: 'Acest email are deja un cont de administrator.' });
        }

        await db.query("UPDATE users SET role = 'admin' WHERE id = $1", [user.id]);

        res.json({
            message: `Contul "${user.username}" a fost promovat la administrator. Parola de login rămâne cea aleasă la înregistrare.`,
            user: { id: user.id, username: user.username, email: user.email, role: 'admin' },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la promovarea contului de administrator.' });
    }
});

// ==========================================
// 5. REVOCARE ROL ADMIN (POST /api/auth/admin/revoke)
// ==========================================
router.post('/admin/revoke', authenticateToken, requireAdmin, async (req, res) => {
    const { email, parola_autorizare } = req.body;

    const auth = verificaParolaAutorizare(parola_autorizare);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const emailValid = valideazaEmail(email);
    if (!emailValid.ok) return res.status(400).json({ error: emailValid.error });

    const emailNormalizat = emailValid.email;

    try {
        const existent = await db.query(
            'SELECT id, username, email, role FROM users WHERE email = $1',
            [emailNormalizat]
        );

        if (existent.rows.length === 0) {
            return res.status(404).json({ error: 'Nu există cont cu acest email.' });
        }

        const user = existent.rows[0];

        if (user.role !== 'admin') {
            return res.status(400).json({ error: 'Acest cont nu are rol de administrator.' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ error: 'Nu îți poți revoca propriul rol de administrator.' });
        }

        const admini = await db.query("SELECT COUNT(*)::int AS total FROM users WHERE role = 'admin'");
        if (admini.rows[0].total <= 1) {
            return res.status(400).json({ error: 'Nu poți revoca ultimul administrator din sistem.' });
        }

        await db.query("UPDATE users SET role = 'user' WHERE id = $1", [user.id]);

        res.json({
            message: `Rolul de administrator a fost revocat pentru "${user.username}". Parola de login rămâne neschimbată.`,
            user: { id: user.id, username: user.username, email: user.email, role: 'user' },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Eroare de server la revocarea rolului de administrator.' });
    }
});

module.exports = router;