-- ManFast - schema baza de date PostgreSQL
-- Rulează: npm run setup-db (din folderul backend)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    numar_telefon VARCHAR(20) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    titlu VARCHAR(255) NOT NULL,
    descriere TEXT,
    data_eveniment TIMESTAMP NOT NULL,
    judet VARCHAR(100),
    localitate VARCHAR(200),
    locatie VARCHAR(255) NOT NULL,
    pret NUMERIC(10, 2) NOT NULL,
    locuri_totale INTEGER NOT NULL,
    locuri_disponibile INTEGER NOT NULL,
    imagini TEXT[] DEFAULT '{}',
    durata_ore INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    nume_buletin VARCHAR(255) NOT NULL,
    stripe_session_id VARCHAR(255),
    check_in BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_stripe_session_id ON tickets(stripe_session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_session_nume ON tickets(stripe_session_id, nume_buletin);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_events_data_eveniment ON events(data_eveniment);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE TABLE IF NOT EXISTS registration_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    numar_telefon VARCHAR(20) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_code_sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    codes_sent INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_verifications_username
    ON registration_verifications(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_verifications_telefon
    ON registration_verifications(numar_telefon);
CREATE INDEX IF NOT EXISTS idx_registration_verifications_expires_at
    ON registration_verifications(expires_at);
