// backend-node/routes/properties.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const SavedProperty = require('../models/SavedProperty');
const auth = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const PYTHON_API = (process.env.PYTHON_API || 'http://localhost:5000').replace(/\/+$/, '');

// load JSON data (three files)
const basics = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'property_basics.json')));
const characteristics = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'property_characteristics.json')));
const images = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'property_images.json')));

function mergeData() {
  return basics.map(b => {
    const char = characteristics.find(c => c.id === b.id) || {};
    const img = images.find(i => i.id === b.id) || {};
    return { ...b, ...char, ...img };
  });
}

// POST /search
router.post('/search', (req, res) => {
  try {
    const { location, budget, bedrooms, q } = req.body || {};
    let results = mergeData();

    if (location) {
      const term = location.toLowerCase();
      results = results.filter(r => (r.location || '').toLowerCase().includes(term));
    }
    if (budget) results = results.filter(r => (r.price || 0) <= Number(budget));
    if (bedrooms) results = results.filter(r => (r.bedrooms || 0) >= Number(bedrooms));
    if (q) {
      const term = q.toLowerCase();
      results = results.filter(r => (r.title || '').toLowerCase().includes(term) ||
        (r.amenities || []).join(' ').toLowerCase().includes(term));
    }

    res.json(results);
  } catch (err) {
    console.error('search error', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST /compare
router.post('/compare', (req, res) => {
  try {
    const { ids } = req.body || {};
    const all = mergeData();
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });
    const selected = all.filter(p => ids.includes(p.id));
    res.json(selected);
  } catch (err) {
    console.error('compare error', err);
    res.status(500).json({ error: 'Compare failed' });
  }
});

// POST /predict -> calls Python /predict

// router.post('/predict', auth, async (req, res) => {
//   try {
//     const input = req.body; // should be dict of features your model expects
//     const pyRes = await axios.post(`${PYTHON_API}/predict`, input, { timeout: 10000 });
//     const predictedPrice = pyRes.data.predicted_price;

//     // save in Mongo
//     const saved = await SavedProperty.create({
//       userId: req.user.id,
//       propertyId: input.id || null,
//       title: input.title || null,
//       location: input.location || null,
//       price: input.price || null,
//       bedrooms: input.bedrooms || null,
//       bathrooms: input.bathrooms || null,
//       image_url: input.image_url || null,
//       predictedPrice
//     });

//     res.json({ saved });
//   } catch (err) {
//     console.error('predict route error', err.response ? err.response.data : err.message);
//     res.status(500).json({ error: 'Prediction failed' });
//   }
// });

// POST /nlp -> forward natural language to python NLP parser and return structured filters
router.post('/nlp', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    const pyRes = await axios.post(`${PYTHON_API}/nlp`, { text }, { timeout: 10000 });
    res.json(pyRes.data);
  } catch (err) {
    console.error('nlp error', err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'NLP parse failed' });
  }
});

// POST /save (protected) — save without predicting
router.post('/save', auth, async (req, res) => {
  try {
    const { id, ...data } = req.body;  // extract id from body
    console.log("saved data", req.body);

    const saved = await SavedProperty.create({
      userId: req.user.id,
      propertyId: id,  // store original id separately if you want
      ...data
    });
    res.json({ saved });
  } catch (err) {
    console.error('save error', err);
    res.status(500).json({ error: 'Save failed', details: err.message });
  }
});


// GET /saved (protected)
router.get('/saved', auth, async (req, res) => {
  try {
    const docs = await SavedProperty.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(200);
    res.json(docs);
  } catch (err) {
    console.error('saved list error', err);
    res.status(500).json({ error: 'Failed to get saved properties' });
  }
});

module.exports = router;
