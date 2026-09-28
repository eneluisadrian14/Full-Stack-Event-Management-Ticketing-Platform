const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { backendUrl } = require('../config');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { valideazaLocatieEveniment } = require('../constants/judete');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Încarcă doar imagini.'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
}).array('imagini', 8);

router.post('/', authenticateToken, requireAdmin, (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ error: err.message });

    const { titlu, descriere, data_eveniment, judet, localitate, pret, locuri_totale, durata_ore } = req.body;

    if (!titlu || !data_eveniment || !pret || !locuri_totale || !durata_ore) {
      return res.status(400).json({ error: 'Te rugăm să completezi toate câmpurile obligatorii!' });
    }

    const locatieValidata = valideazaLocatieEveniment(judet, localitate);
    if (!locatieValidata.ok) {
      return res.status(400).json({ error: locatieValidata.error });
    }

    try {
      const pozeUrls = (req.files || []).map(
        (file) => `${backendUrl}/uploads/${file.filename}`
      );

      const queryText = `
        INSERT INTO events (titlu, descriere, data_eveniment, judet, localitate, locatie, pret, locuri_totale, locuri_disponibile, imagini, durata_ore)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        titlu,
        descriere,
        data_eveniment,
        locatieValidata.judet,
        locatieValidata.localitate,
        locatieValidata.locatie,
        pret,
        locuri_totale,
        pozeUrls,
        parseInt(durata_ore, 10),
      ];
      const newEvent = await db.query(queryText, values);

      res.status(201).json({
        message: 'Evenimentul a fost adăugat cu succes!',
        event: newEvent.rows[0]
      });
    } catch (dbErr) {
      console.error(dbErr.message);
      res.status(500).json({ error: 'Eroare de server la salvarea evenimentului!' });
    }
  });
});

router.get('/admin/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM events ORDER BY data_eveniment DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Eroare de server la preluarea evenimentelor pentru admin!' });
  }
});

router.get('/', async (req, res) => {
  try {
    const queryText = `
      SELECT * FROM events
      WHERE data_eveniment + (durata_ore || ' hours')::INTERVAL > NOW()
      ORDER BY data_eveniment ASC
    `;

    const allEvents = await db.query(queryText);
    res.json(allEvents.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Eroare de server la preluarea evenimentelor!' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eventResult = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Evenimentul nu a fost găsit!' });
    }
    res.json(eventResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la preluarea detaliilor!' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ error: err.message });

    const { id } = req.params;
    const { titlu, descriere, data_eveniment, judet, localitate, pret, locuri_totale, durata_ore, imagini_pastrate } = req.body;

    if (!titlu || !data_eveniment || !pret || !locuri_totale || !durata_ore) {
      return res.status(400).json({ error: 'Te rugăm să completezi toate câmpurile obligatorii!' });
    }

    const locatieValidata = valideazaLocatieEveniment(judet, localitate);
    if (!locatieValidata.ok) {
      return res.status(400).json({ error: locatieValidata.error });
    }

    try {
      const existing = await db.query('SELECT * FROM events WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Evenimentul nu a fost găsit!' });
      }

      const event = existing.rows[0];
      const locuriVandute = Number(event.locuri_totale) - Number(event.locuri_disponibile);
      const locuriTotaleNoi = parseInt(locuri_totale, 10);
      const locuriDisponibileNoi = locuriTotaleNoi - locuriVandute;

      if (locuriDisponibileNoi < 0) {
        return res.status(400).json({
          error: `Nu poți seta mai puțin de ${locuriVandute} locuri — atâtea bilete au fost deja vândute.`,
        });
      }

      let imaginiFinale = [];
      if (imagini_pastrate) {
        try {
          imaginiFinale = JSON.parse(imagini_pastrate);
        } catch {
          return res.status(400).json({ error: 'Lista imaginilor păstrate este invalidă.' });
        }
      }

      const fisiereNoi = (req.files || []).map((file) => `${backendUrl}/uploads/${file.filename}`);
      imaginiFinale = [...imaginiFinale, ...fisiereNoi];

      if (imaginiFinale.length > 8) {
        return res.status(400).json({ error: 'Maximum 8 imagini per eveniment.' });
      }

      const result = await db.query(
        `UPDATE events SET
          titlu = $1, descriere = $2, data_eveniment = $3, judet = $4, localitate = $5, locatie = $6,
          pret = $7, locuri_totale = $8, locuri_disponibile = $9, imagini = $10, durata_ore = $11
        WHERE id = $12
        RETURNING *`,
        [
          titlu,
          descriere,
          data_eveniment,
          locatieValidata.judet,
          locatieValidata.localitate,
          locatieValidata.locatie,
          pret,
          locuriTotaleNoi,
          locuriDisponibileNoi,
          imaginiFinale,
          parseInt(durata_ore, 10),
          id,
        ]
      );

      res.json({
        message: 'Evenimentul a fost actualizat cu succes!',
        event: result.rows[0],
      });
    } catch (dbErr) {
      console.error(dbErr.message);
      res.status(500).json({ error: 'Eroare de server la actualizarea evenimentului!' });
    }
  });
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await db.query('SELECT titlu FROM events WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Evenimentul nu a fost găsit!' });
    }

    const bilete = await db.query('SELECT COUNT(*)::int AS count FROM tickets WHERE event_id = $1', [id]);
    const numarBilete = bilete.rows[0].count;

    await db.query('DELETE FROM events WHERE id = $1', [id]);

    res.json({
      message: 'Evenimentul a fost șters cu succes!',
      bileteSterse: numarBilete,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Eroare de server la ștergerea evenimentului!' });
  }
});

module.exports = router;
