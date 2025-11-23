const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Item = require('../models/Item');

// Helper function to generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}${random}`;
};

// Helper function to safely calculate numbers
const safeNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Create order from active cart or direct checkout
router.post('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const { shippingAddress, billingAddress, paymentInfo, items: directItems } = req.body;

    let orderItems = [];
    let subtotal = 0;

    if (directItems && directItems.length > 0) {
      // Direct checkout with provided items
      for (const directItem of directItems) {
        const item = await Item.findById(directItem.item_id);
        if (!item) {
          return res.status(400).json({ error: `Item not found: ${directItem.item_id}` });
        }
        const quantity = safeNumber(directItem.quantity, 1);
        const price = safeNumber(item.price, 0);
        const itemTotal = price * quantity;

        if (itemTotal <= 0) {
          return res.status(400).json({ error: `Invalid item price for ${item.name}` });
        }

        orderItems.push({
          item_id: item._id,
          quantity,
          price,
          total: itemTotal
        });
        subtotal += itemTotal;
      }
    } else {
      // Order from active cart
      const cart = await Cart.findOne({ user_id: user._id, status: 'active' }).populate('items.item_id');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'No active cart or empty cart' });
      }

      for (const cartItem of cart.items) {
        const quantity = safeNumber(cartItem.quantity, 1);
        const usdPrice = safeNumber(cartItem.item_id.price, 0);
        const inrPrice = usdPrice * 83.12; // Convert USD to INR
        const itemTotal = inrPrice * quantity;

        if (itemTotal <= 0) {
          console.warn(`Skipping item with invalid price: ${cartItem.item_id.name}`);
          continue;
        }

        orderItems.push({
          item_id: cartItem.item_id._id,
          quantity,
          price: inrPrice, // Store INR price
          total: itemTotal
        });
        subtotal += itemTotal;
      }

      // Mark cart as completed
      cart.status = 'completed';
      await cart.save();
    }

    // Validate subtotal
    if (subtotal <= 0 || isNaN(subtotal)) {
      return res.status(400).json({ error: 'Invalid order total. Please check item prices.' });
    }

    // Calculate tax and shipping (Indian rates)
    const tax = safeNumber(subtotal * 0.18, 0); // 18% GST
    const shipping = subtotal > 4150 ? 0 : 100; // Free shipping over ₹4150
    const total = safeNumber(subtotal + tax + shipping, 0);

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = new Order({
      user_id: user._id,
      orderNumber,
      items: orderItems,
      subtotal: safeNumber(subtotal, 0),
      tax: safeNumber(tax, 0),
      shipping: safeNumber(shipping, 0),
      total: safeNumber(total, 0),
      shippingAddress: shippingAddress || {
        fullName: user.name || 'Customer',
        addressLine1: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        phone: '+91-9876543210'
      },
      billingAddress: billingAddress || shippingAddress,
      paymentInfo: paymentInfo || {
        method: 'credit_card',
        paymentStatus: 'completed'
      },
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();

    res.json({
      success: true,
      order_id: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      estimatedDelivery: order.estimatedDelivery
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all orders for user
router.get('/', auth, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const query = { user_id: req.user._id };

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.item_id', 'name image price')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific order details
// Test endpoint to check order access
router.get('/:orderId/test', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user_id: req.user._id
    });

    res.json({
      found: !!order,
      orderId: orderId,
      userId: req.user._id,
      orderStatus: order ? order.status : null,
      canCancel: order ? ['pending', 'confirmed'].includes(order.status) : false
    });
  } catch (err) {
    console.error('Test order error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user._id
    }).populate('items.item_id', 'name image price description');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (admin functionality)
router.patch('/:orderId/status', auth, async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user._id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (note) order.notes = note;

    // Set delivery date when delivered
    if (status === 'delivered' && !order.actualDelivery) {
      order.actualDelivery = new Date();
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel order
router.patch('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user._id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }

    order.status = 'cancelled';
    if (reason) order.notes = `Cancelled: ${reason}`;

    await order.save();
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Track order
router.get('/:orderId/track', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user._id
    }).select('orderNumber status statusHistory trackingNumber estimatedDelivery actualDelivery');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery,
      statusHistory: order.statusHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order invoice
router.get('/:orderId/invoice', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user._id
    }).populate('items.item_id', 'name image price').populate('user_id', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const invoice = {
      orderNumber: order.orderNumber,
      orderDate: order.created_at,
      customer: {
        name: order.user_id.name,
        email: order.user_id.email
      },
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items.map(item => ({
        name: item.item_id.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentInfo.method,
      paymentStatus: order.paymentInfo.paymentStatus
    };

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder (create new order from existing order)
router.post('/:orderId/reorder', auth, async (req, res) => {
  try {
    const originalOrder = await Order.findOne({
      _id: req.params.orderId,
      user_id: req.user._id
    }).populate('items.item_id');

    if (!originalOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if items are still available
    const availableItems = [];
    for (const orderItem of originalOrder.items) {
      const currentItem = await Item.findById(orderItem.item_id._id);
      if (currentItem && currentItem.status === 'available') {
        availableItems.push({
          item_id: currentItem._id,
          quantity: orderItem.quantity
        });
      }
    }

    if (availableItems.length === 0) {
      return res.status(400).json({ error: 'No items from this order are currently available' });
    }

    // Create new order with available items
    req.body.items = availableItems;
    req.body.shippingAddress = originalOrder.shippingAddress;
    req.body.billingAddress = originalOrder.billingAddress;

    // Reuse the create order logic
    return router.handle({
      ...req,
      method: 'POST',
      url: '/'
    }, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel order (only for pending orders)
router.patch('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason = 'Customer requested cancellation' } = req.body;

    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    // Use findOneAndUpdate for atomic operation
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        user_id: req.user._id,
        status: { $in: ['pending', 'confirmed'] }
      },
      {
        status: 'cancelled',
        notes: reason,
        updated_at: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found or cannot be cancelled' });
    }

    res.json({
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (err) {
    console.error('Order cancellation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove item from order (only for pending orders)
router.delete('/:orderId/items/:itemId', auth, async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const order = await Order.findOne({
      _id: orderId,
      user_id: req.user._id,
      status: 'pending' // Only allow removal from pending orders
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or cannot be modified' });
    }

    // Find and remove the item
    const itemIndex = order.items.findIndex(item => item.item_id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in order' });
    }

    // Remove the item and recalculate totals
    const removedItem = order.items.splice(itemIndex, 1)[0];

    // If no items left, cancel the order
    if (order.items.length === 0) {
      order.status = 'cancelled';
      order.cancelledAt = new Date();
    } else {
      // Recalculate totals
      let newSubtotal = 0;
      order.items.forEach(item => {
        const itemTotal = safeNumber(item.total, 0);
        newSubtotal += itemTotal;
      });

      const tax = safeNumber(newSubtotal * 0.18, 0); // 18% GST
      const shipping = newSubtotal > 4150 ? 0 : 100; // Free shipping over ₹4150
      const total = safeNumber(newSubtotal + tax + shipping, 0);

      order.subtotal = safeNumber(newSubtotal, 0);
      order.tax = safeNumber(tax, 0);
      order.shipping = safeNumber(shipping, 0);
      order.total = safeNumber(total, 0);
    }

    await order.save();

    res.json({
      message: 'Item removed from order successfully',
      order: order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
