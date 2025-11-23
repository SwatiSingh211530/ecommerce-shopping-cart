const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, default: 1, min: 1 }
});

const CartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [CartItemSchema], default: [] },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', CartSchema);
