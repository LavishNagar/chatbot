// backend-node/models/SavedProperty.js
const mongoose = require('mongoose');

const SavedPropertySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  propertyId: Number,
  title: String,
  location: String,
  price: Number,
  bedrooms: Number,
  bathrooms: Number,
  image_url: String,
  predictedPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedProperty', SavedPropertySchema);
