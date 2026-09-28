# ManFast

Platformă web full-stack pentru **gestionarea evenimentelor sportive/competiții**, **bilete nominale** și **plăți online** prin Stripe.

Proiect de licență — stack: **React 19 + Vite + Material UI 9** (frontend), **Node.js + Express + PostgreSQL** (backend).

---

## Cuprins

1. [Funcționalități](#funcționalități)
2. [Tehnologii](#tehnologii)
3. [Structura proiectului](#structura-proiectului)
4. [Cerințe](#cerințe)
5. [Instalare rapidă](#instalare-rapidă)
6. [Variabile de mediu](#variabile-de-mediu)
7. [Bază de date și migrări](#bază-de-date-și-migrări)
8. [Email (Brevo SMTP)](#email-brevo-smtp)
9. [Stripe (plăți test)](#stripe-plăți-test)
10. [Cont administrator](#cont-administrator)
11. [Rute aplicație](#rute-aplicație)
12. [API principal](#api-principal)
13. [Scripturi npm](#scripturi-npm)
14. [Scenariu demo (prezentare)](#scenariu-demo-prezentare)
15. [Depanare](#depanare)
16. [Securitate și bune practici](#securitate-și-bune-practici)

---

## Funcționalități

### Utilizator

| Funcție | Descriere |
|--------|-----------|
| Înregistrare | Formular + **cod de verificare pe email** (6 cifre, 15 min); contul se creează după confirmare |
| Autentificare | Login JWT, sesiune 24h |
| Resetare parolă | Prin email sau telefon (email mascat la căutare după telefon) |
| Profil | Editare username, email, telefon; schimbare parolă; **ștergere cont** |
| Evenimente | Listă, filtre (nume, județ, dată), pagină detalii |
| Bilete | Cumpărare nominală (unul sau mai multe nume), plată Stripe, „Biletele mele” |
| Transfer login → register | Email și parola se precompletează la click pe „Înregistrează-te” |

### Administrator

| Funcție | Descriere |
|--------|-----------|
| Panou `/admin` | Publicare, editare, ștergere evenimente |
| Evenimente | Titlu, descriere, dată, județ, localitate, locație, preț, locuri, durată, **upload imagini** |
| Participanți | Listă per eveniment, **check-in** |
| Gestionare admini | Promovare / revocare rol (necesită parolă de autorizare) |

---

## Tehnologii

| Layer | Tehnologii |
|-------|------------|
| Frontend | React 19, Vite 8, React Router 7, MUI 9, Emotion |
| Backend | Express 4, Node.js 18+, JWT, bcrypt |
| Bază de date | PostgreSQL 14+ |
| Plăți | Stripe Checkout (RON) |
| Email | Nodemailer + Brevo SMTP (opțional; fallback: consolă backend) |

---

## Structura proiectului

```
LucrareaDeLicenta/
├── backend/                 # API Express
│   ├── routes/              # auth, events, tickets
│   ├── middleware/          # JWT, requireAdmin
│   ├── utils/               # email, telefon, Stripe
│   ├── uploads/             # imagini evenimente
│   ├── scripts/             # setup DB, migrări, promote-admin
│   └── .env                 # configurare (NU comite în Git!)
├── frontend/                # React + Vite
│   └── src/
│       ├── pages/           # Home, Login, Register, Admin, etc.
│       ├── components/      # Navbar, layout, admin
│       └── context/         # AuthContext
├── database/
│   ├── schema.sql           # schema completă (instalare nouă)
│   └── migrations/          # migrări incrementale
└── README.md
```

---

## Cerințe

- **Node.js** 18 sau mai nou
- **PostgreSQL** 14+
- Cont **Stripe** (mod test) pentru plăți
- Opțional: cont **Brevo** pentru emailuri reale (înregistrare + reset parolă)

---

## Instalare rapidă

### 1. PostgreSQL

Creează baza de date (exemplu):

```sql
CREATE DATABASE manfast;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Editează .env — vezi secțiunea Variabile de mediu
npm install
npm run setup-db
npm run migrate-password-reset
npm run migrate-email-verification
npm run dev
```

Server: `http://localhost:5000`  
Test: `http://localhost:5000/api/test`

### 3. Frontend

Terminal separat:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Aplicație: `http://localhost:5173`

> Folosește mereu `http://localhost:5173` (nu amesteca cu `127.0.0.1`) pentru a evita probleme minore cu HMR Vite.

### 4. Build producție (opțional)

```bash
cd frontend
npm run build
npm run preview
```

```bash
cd backend
npm start
```

---

## Variabile de mediu

### `backend/.env`

| Variabilă | Obligatoriu | Descriere |
|-----------|-------------|-----------|
| `PORT` | Nu (default 5000) | Port server |
| `BACKEND_URL` | Da | URL public API, ex. `http://localhost:5000` |
| `FRONTEND_URL` | Da | URL frontend (Stripe redirect, link reset parolă) |
| `DB_USER` | Da | Utilizator PostgreSQL |
| `DB_PASSWORD` | Da | Parolă PostgreSQL |
| `DB_HOST` | Da | Host DB, ex. `localhost` |
| `DB_PORT` | Da | Port DB, ex. `5432` |
| `DB_NAME` | Da | Nume bază, ex. `manfast` |
| `JWT_SECRET` | Da | Cheie secretă JWT (**diferită** de cheia Stripe!) |
| `STRIPE_SECRET_KEY` | Pentru plăți | Cheie secretă Stripe test (`sk_test_...`) |
| `ADMIN_AUTHORIZATION_PASSWORD` | Nu | Parolă pentru promovare/revocare admin în UI (default în cod dacă lipsește) |
| `SMTP_HOST` | Pentru email | ex. `smtp-relay.brevo.com` |
| `SMTP_PORT` | Pentru email | ex. `587` |
| `SMTP_SECURE` | Pentru email | `false` pentru port 587 |
| `SMTP_USER` | Pentru email | Login SMTP Brevo |
| `SMTP_PASS` | Pentru email | Cheie SMTP Brevo |
| `MAIL_FROM` | Pentru email | Email expeditor verificat în Brevo |

### `frontend/.env`

| Variabilă | Descriere |
|-----------|-----------|
| `VITE_API_URL` | URL backend, ex. `http://localhost:5000` |

**Exemplu minimal `backend/.env`:**

```env
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

DB_USER=postgres
DB_PASSWORD=parola_ta
DB_HOST=localhost
DB_PORT=5432
DB_NAME=manfast

JWT_SECRET=schimba_cu_o_cheie_lunga_aleatoare
STRIPE_SECRET_KEY=sk_test_...

ADMIN_AUTHORIZATION_PASSWORD=parola_ta_secreta_admin
```

---

## Bază de date și migrări

### Instalare inițială

```bash
cd backend
npm run setup-db
```

Creează tabelele: `users`, `events`, `tickets`, `password_reset_tokens`, `registration_verifications`.

### Migrări (proiect existent, actualizat incremental)

Rulează **în ordine** dacă baza exista de dinainte:

```bash
cd backend
npm run migrate-multi-tickets      # bilete multiple per sesiune Stripe
npm run migrate-judet-localitate   # câmpuri județ + localitate
npm run migrate-password-reset     # telefon unic + token reset parolă
npm run migrate-email-verification # verificare email la înregistrare
```

> Înainte de `migrate-password-reset`: asigură-te că **nu există numere de telefon duplicate** în `users`.

### Curățare înregistrare blocată (test)

Dacă primești `429` la înregistrare în timpul testelor:

```sql
DELETE FROM registration_verifications WHERE email = 'email@exemplu.com';
```

În `npm run dev`, limitele de cod sunt relaxate automat pe backend.

---

## Email (Brevo SMTP)

Fără SMTP configurat, **codul de înregistrare** și **link-ul de resetare parolă** apar în **consola backend-ului**.

### Configurare Brevo (gratuit ~300 emailuri/zi)

1. Cont pe [brevo.com](https://www.brevo.com)
2. Verifică un expeditor (Senders)
3. Obține datele SMTP: **SMTP & API → SMTP**
4. Completează în `backend/.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`

### Flux înregistrare

1. Completează formularul → **Creează cont**
2. Primești cod **6 cifre** (15 minute)
3. **Confirmă și creează contul** → abia acum există contul în `users`

### Flux resetare parolă

1. Login → **Am uitat parola**
2. Email sau telefon
3. Link valid **1 oră** (email sau consolă backend)

---

## Stripe (plăți test)

1. Cont [Stripe Dashboard](https://dashboard.stripe.com) → mod **Test**
2. Copiază **Secret key** (`sk_test_...`) în `backend/.env` → `STRIPE_SECRET_KEY`
3. Repornește backend-ul
4. La cumpărare bilet: folosește card test Stripe, ex. `4242 4242 4242 4242`, dată viitoare, CVC oarecare

Flux: utilizator autentificat → detalii eveniment → nume participanți → Stripe Checkout → `/payment-success` → bilete în „Biletele mele”.

---

## Cont administrator

### Varianta 1 — Script (recomandat)

```bash
cd backend
npm run promote-admin -- emailul-tau@exemplu.com
```

sau:

```bash
node scripts/promote-admin.js emailul-tau@exemplu.com
```

### Varianta 2 — SQL

```sql
UPDATE users SET role = 'admin' WHERE email = 'emailul-tau@exemplu.com';
```

### Varianta 3 — Din panou (admin existent)

`/admin` → **Gestionare administratori** → Promovează / Revocă (necesită `ADMIN_AUTHORIZATION_PASSWORD`).

După promovare: **delogare + login** pentru a reîncărca token-ul JWT cu rol `admin`.

---

## Rute aplicație

| Rută | Acces | Descriere |
|------|-------|-----------|
| `/` | Public | Listă evenimente + filtre |
| `/events/:id` | Public | Detalii + cumpărare bilet |
| `/login` | Public | Autentificare |
| `/register` | Public | Înregistrare + verificare cod |
| `/forgot-password` | Public | Solicitare reset |
| `/reset-password` | Public | Parolă nouă (cu token din link) |
| `/profile` | Autentificat | Profil, parolă, ștergere cont |
| `/my-tickets` | Autentificat | Biletele mele |
| `/payment-success` | Autentificat | Confirmare plată Stripe |
| `/admin` | Admin | Panou administrare |

---

## API principal

Prefix: `http://localhost:5000/api`

### Autentificare (`/auth`)

| Metodă | Rută | Descriere |
|--------|------|-----------|
| POST | `/auth/register` | Trimite cod verificare email |
| POST | `/auth/register/verify` | Confirmă cod, creează cont |
| POST | `/auth/register/resend` | Retrimite cod |
| POST | `/auth/login` | Login → JWT |
| GET | `/auth/me` | Utilizator curent |
| PUT | `/auth/profile` | Actualizare profil |
| PUT | `/auth/password` | Schimbare parolă |
| DELETE | `/auth/account` | Ștergere cont (cu parolă) |
| POST | `/auth/forgot-password` | Reset parolă |
| POST | `/auth/reset-password` | Parolă nouă cu token |
| POST | `/auth/admin/create` | Promovare admin |
| POST | `/auth/admin/revoke` | Revocare admin |

### Evenimente (`/events`)

| Metodă | Rută | Descriere |
|--------|------|-----------|
| GET | `/events` | Listă publică |
| GET | `/events/:id` | Detalii |
| GET | `/events/admin/list` | Listă admin |
| POST | `/events` | Creare (admin) |
| PUT | `/events/:id` | Editare (admin) |
| DELETE | `/events/:id` | Ștergere (admin) |

### Bilete (`/tickets`)

| Metodă | Rută | Descriere |
|--------|------|-----------|
| POST | `/tickets/create-checkout-session` | Sesiune Stripe |
| POST | `/tickets/confirm-payment` | Confirmare după plată |
| GET | `/tickets/my-tickets` | Biletele utilizatorului |
| GET | `/tickets/admin/participants` | Participanți (admin) |

Imagini evenimente servite la: `http://localhost:5000/uploads/...`

---

## Scripturi npm

### Backend (`cd backend`)

| Script | Descriere |
|--------|-----------|
| `npm run dev` | Server cu nodemon |
| `npm start` | Server producție |
| `npm run setup-db` | Creează tabele din `schema.sql` |
| `npm run promote-admin` | Promovează user la admin după email |
| `npm run create-admin` | Creează admin (script dedicat) |
| `npm run migrate-*` | Migrări DB (vezi secțiunea migrări) |

### Frontend (`cd frontend`)

| Script | Descriere |
|--------|-----------|
| `npm run dev` | Development Vite |
| `npm run build` | Build producție |
| `npm run preview` | Preview build |
| `npm run lint` | ESLint |

---

## Scenariu demo (prezentare)

1. **Pornește** backend + frontend.
2. **Înregistrare** utilizator nou → cod din email sau consolă backend → confirmare.
3. **Login** → navighează evenimente → filtrează după județ.
4. **Cumpără bilet** cu card Stripe test → verifică „Biletele mele”.
5. **Promovează** contul la admin (`promote-admin` sau SQL) → relogin.
6. **Admin**: publică eveniment cu poze → check-in participant la evenimentul cu bilet.
7. Opțional: **profil** → schimbare parolă; zonă roșie → ștergere cont test.

---

## Depanare

| Problemă | Cauză probabilă | Soluție |
|--------|-----------------|---------|
| `[vite] failed to connect to websocket` | HMR Vite (dev) | Repornește `npm run dev`; folosește `localhost:5173`; incognito fără extensii |
| MetaMask în consolă | Extensie browser | Ignoră sau dezactivează MetaMask pe localhost |
| Login `400` | Credențiale greșite sau cont neconfirmat | Finalizează înregistrarea cu codul de 6 cifre |
| Register `429` | Prea multe cereri cod | Așteaptă 15 min sau șterge din `registration_verifications` |
| Plăți indisponibile | Stripe lipsă | Setează `STRIPE_SECRET_KEY`, repornește backend |
| Email nu sosește | SMTP greșit | Verifică Brevo; vezi consola backend pentru cod/link |
| `CORS` error | URL greșit | `FRONTEND_URL` = URL-ul din browser; `VITE_API_URL` = backend |
| Admin nu apare | Token vechi | Delogare + login după promovare |

---

## Securitate și bune practici

- **Nu comite** fișierul `backend/.env` în Git (adaugă în `.gitignore`).
- Folosește **`JWT_SECRET`** diferit de `STRIPE_SECRET_KEY`.
- În producție: HTTPS, parole puternice DB, `NODE_ENV=production`.
- Parola de autorizare admin (`ADMIN_AUTHORIZATION_PASSWORD`) — schimb-o din default.
- Ștergerea contului și resetarea parolei au rate limiting în producție.

---

## Autor

Lucrare de licenta realizata de:
Nume: Ene Luis Adrian
Faculatea de Matematica si Informatica Constanta
Anul 3

---

## Licență

Proiect academic — plicatie pentru organmizarea si gestionarea evenimentelor. 
