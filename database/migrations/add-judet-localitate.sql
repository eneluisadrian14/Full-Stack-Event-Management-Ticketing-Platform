-- Adaugă județ și localitate la evenimente (rulează o singură dată pe DB existent)
ALTER TABLE events ADD COLUMN IF NOT EXISTS judet VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS localitate VARCHAR(200);
