const express = require('express');
const router = express.Router();
const db = require('../db');
const { frontendUrl } = require('../config');
const { getStripe } = require('../utils/stripe');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Plățile Stripe nu sunt configurate. Contactează administratorul.' });
  }

  const { event_id, nume_participanti } = req.body;
  const user_id = req.user.id;

  if (!event_id || !nume_participanti || nume_participanti.length === 0) {
    return res.status(400).json({ error: 'Date incomplete pentru inițierea plății!' });
  }

  const numeCuratate = nume_participanti.map((n) => n.trim()).filter(Boolean);
  if (numeCuratate.length !== nume_participanti.length) {
    return res.status(400).json({ error: 'Toate numele participanților trebuie completate!' });
  }

  try {
    const eventResult = await db.query(
      'SELECT titlu, pret, locuri_disponibile FROM events WHERE id = $1',
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Evenimentul nu a fost găsit!' });
    }

    const event = eventResult.rows[0];
    const cantitate = numeCuratate.length;

    if (event.locuri_disponibile < cantitate) {
      return res.status(400).json({ error: 'Nu mai sunt suficiente locuri disponibile pentru această cantitate!' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: `Bilet Nominal - ${event.titlu}`,
              description: `Participanți: ${numeCuratate.join(', ')}`,
            },
            unit_amount: Math.round(Number(event.pret) * 100),
          },
          quantity: cantitate,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/events/${event_id}`,
      metadata: {
        event_id: String(event_id),
        user_id: String(user_id),
        nume_participanti: JSON.stringify(numeCuratate),
        cantitate_bilete: String(cantitate),
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Eroare la crearea sesiunii Stripe:', err.message);
    res.status(500).json({ error: 'Eroare internă la crearea sesiunii de plată Stripe!' });
  }
});

router.post('/confirm-payment', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Plățile Stripe nu sunt configurate.' });
  }

  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'session_id lipsește.' });
  }

  const client = await db.getClient();

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Plata biletelor nu a fost finalizată cu succes!' });
    }

    const { event_id, user_id, nume_participanti, cantitate_bilete } = session.metadata;
    let arrayNume;

    try {
      arrayNume = JSON.parse(nume_participanti).map((n) => n.trim()).filter(Boolean);
    } catch {
      return res.status(400).json({ error: 'Date participanți invalide în sesiunea de plată.' });
    }

    const cantitateAsteptata = parseInt(cantitate_bilete, 10) || arrayNume.length;
    if (arrayNume.length !== cantitateAsteptata) {
      return res.status(400).json({ error: 'Numărul de bilete nu corespunde cu participanții înscriși.' });
    }

    const curatatUserId = (user_id === 'null' || !user_id) ? null : parseInt(user_id, 10);

    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT nume_buletin FROM tickets WHERE stripe_session_id = $1',
      [session_id]
    );

    if (existing.rows.length >= cantitateAsteptata) {
      await client.query('COMMIT');
      return res.json({
        success: true,
        message: 'Biletele pentru această tranzacție au fost deja salvate!',
        dejaProcesat: true,
        bilete: existing.rows.length,
      });
    }

    const numeDejaSalvate = new Set(existing.rows.map((r) => r.nume_buletin));
    const numeDeInserat = arrayNume.filter((nume) => !numeDejaSalvate.has(nume));

    for (const nume of numeDeInserat) {
      await client.query(
        'INSERT INTO tickets (event_id, user_id, nume_buletin, stripe_session_id) VALUES ($1, $2, $3, $4)',
        [event_id, curatatUserId, nume, session_id]
      );
    }

    if (numeDeInserat.length > 0) {
      await client.query(
        'UPDATE events SET locuri_disponibile = locuri_disponibile - $1 WHERE id = $2',
        [numeDeInserat.length, event_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Plata a fost confirmată! Locurile tale au fost rezervate cu succes.',
      bilete: cantitateAsteptata,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Eroare la procesarea confirmării:', err.message);

    if (err.code === '23505') {
      return res.status(500).json({
        error: 'Conflict la salvarea biletelor. Rulează: npm run migrate-multi-tickets',
      });
    }

    res.status(500).json({ error: 'A apărut o eroare de server la înregistrarea biletelor!' });
  } finally {
    client.release();
  }
});

router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const queryText = `
      SELECT t.id, t.nume_buletin, t.check_in, e.titlu, e.data_eveniment, e.locatie, e.durata_ore
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      WHERE t.user_id = $1
      ORDER BY e.data_eveniment ASC
    `;
    const result = await db.query(queryText, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Eroare la preluarea biletelor utilizatorului:', err.message);
    res.status(500).json({ error: 'Eroare de server la încărcarea biletelor tale!' });
  }
});

router.get('/admin/participants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const queryText = `
      SELECT t.id, t.nume_buletin, t.check_in, t.stripe_session_id, t.event_id, e.titlu as eveniment_titlu
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      ORDER BY t.nume_buletin ASC
    `;
    const result = await db.query(queryText);
    res.json(result.rows);
  } catch (err) {
    console.error('Eroare la preluarea participanților:', err.message);
    res.status(500).json({ error: 'Eroare de server la preluarea listei de participanți!' });
  }
});

router.patch('/:id/checkin', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { check_in } = req.body;

  try {
    const result = await db.query(
      'UPDATE tickets SET check_in = $1 WHERE id = $2 RETURNING *',
      [check_in, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Biletul nu a fost găsit!' });
    }

    res.json({ success: true, message: 'Status check-in actualizat!', ticket: result.rows[0] });
  } catch (err) {
    console.error('Eroare la modificarea check-in-ului:', err.message);
    res.status(500).json({ error: 'Eroare de server la modificarea statusului!' });
  }
});

module.exports = router;
