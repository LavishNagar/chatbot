// backend-node/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const propRoutes = require('./routes/properties');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/properties', propRoutes);

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.NODE_PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Node backend running on port ${PORT}`));
}).catch(err => {
  console.error('DB error', err);
});
