require('dotenv').config();

const port = process.env.PORT || 5000;

module.exports = {
  port,
  backendUrl: process.env.BACKEND_URL || `http://localhost:${port}`,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
