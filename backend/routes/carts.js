const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');

// Add item to user's active cart (create if none)
router.post('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const { item_id, quantity = 1 } = req.body;
    if (!item_id) return res.status(400).json({ error: 'item_id required' });
    
    let cart = await Cart.findOne({ user_id: user._id, status: 'active' });
    if (!cart) {
      cart = new Cart({ user_id: user._id, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.item_id.toString() === item_id);
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ item_id, quantity });
    }
    
    await cart.save();
    res.json({ cartCount: cart.items.length, cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List carts for user
router.get('/', auth, async (req, res) => {
  try {
    const carts = await Cart.find({ user_id: req.user._id }).populate('items.item_id');
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user_id: req.user._id, status: 'active' });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find and remove the first occurrence of the item
    const itemIndex = cart.items.findIndex(item => item.item_id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    res.json({ 
      message: 'Item removed from cart',
      cartCount: cart.items.length,
      cart: cart
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart (alternative POST endpoint for compatibility)
router.post('/remove', auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    const cart = await Cart.findOne({ user_id: req.user._id, status: 'active' });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find and remove the first occurrence of the item
    const itemIndex = cart.items.findIndex(item => item.item_id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    res.json({ 
      message: 'Item removed from cart',
      cartCount: cart.items.length,
      cart: cart
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
