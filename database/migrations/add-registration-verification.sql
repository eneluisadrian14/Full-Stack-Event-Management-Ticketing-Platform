-- Verificare email la înregistrare (contul se creează după confirmarea codului)
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
