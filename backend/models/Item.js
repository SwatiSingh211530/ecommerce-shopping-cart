const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  category: { type: String },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  status: { type: String, default: 'available' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', ItemSchema);
