const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { port, frontendUrl } = require('./config');
const { isStripeConfigured } = require('./utils/stripe');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');

const app = express();

app.use(cors({ origin: frontendUrl }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Serverul ManFast Node.js funcționează perfect!' });
});

app.listen(port, () => {
  console.log(`Serverul ManFast rulează pe portul ${port}`);
  if (!isStripeConfigured()) {
    console.warn('Atenție: STRIPE_SECRET_KEY lipsește — plățile nu vor funcționa până la configurare.');
  }
});
