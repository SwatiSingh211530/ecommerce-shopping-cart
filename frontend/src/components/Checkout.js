import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Checkout({ token, cartCount, setCartCount, onCartUpdate, onBack, onOrderComplete, formatPrice, onRemoveFromCart }) {
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/carts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const carts = res.data || [];
      const activeCart = carts.find(c => c.status === 'active');
      
      if (activeCart && activeCart.items) {
        setCartItems(activeCart.items);
        
        // Calculate totals - Convert USD to INR
        const itemsSubtotal = activeCart.items.reduce((sum, item) => {
          return sum + (item.item_id.price * 83.12 * item.quantity); // Convert USD to INR
        }, 0);
        
        const calculatedTax = itemsSubtotal * 0.18; // 18% GST
        const calculatedShipping = itemsSubtotal > 4150 ? 0 : 100; // Free shipping over ₹4150 (already converted)
        const calculatedTotal = itemsSubtotal + calculatedTax + calculatedShipping;
        
        setSubtotal(itemsSubtotal);
        setTax(calculatedTax);
        setShipping(calculatedShipping);
        setTotal(calculatedTotal);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Basic validation
    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city) {
      alert('Please fill in all required shipping address fields');
      return;
    }

    if (paymentInfo.method === 'credit_card' && (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv)) {
      alert('Please fill in all payment details');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        shippingAddress,
        billingAddress: shippingAddress, // Use same as shipping for simplicity
        paymentInfo: {
          method: paymentInfo.method,
          cardLast4: paymentInfo.cardNumber ? paymentInfo.cardNumber.slice(-4) : null,
          paymentStatus: 'completed'
        }
      };

      const res = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCartCount(0);
        alert(`Order placed successfully!\nOrder Number: ${res.data.orderNumber}\nTotal: ₹${res.data.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);      if (onOrderComplete) {
        onOrderComplete(res.data);
      } else {
        onBack();
      }
    } catch (err) {
      console.error('Order error:', err);
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Cart
        </button>
        <h2>🛒 Checkout</h2>
      </div>

      <form onSubmit={placeOrder} className="checkout-form">
        {/* Shipping Address */}
        <div className="checkout-section">
          <h3>📍 Shipping Address</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={shippingAddress.fullName}
                onChange={(e) => handleAddressChange('fullName', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                value={shippingAddress.phone}
                onChange={(e) => handleAddressChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Address Line 1 *</label>
              <input
                type="text"
                className="form-input"
                value={shippingAddress.addressLine1}
                onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Address Line 2 (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={shippingAddress.addressLine2}
                onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                value={shippingAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <select
                className="form-input"
                value={shippingAddress.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                required
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">PIN Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="400001"
                value={shippingAddress.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                pattern="[0-9]{6}"
                maxLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-input"
                value="India"
                readOnly
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              />
              <input type="hidden" name="country" value="India" />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="checkout-section">
          <h3>💳 Payment Information</h3>
          
          <div className="payment-methods">
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={paymentInfo.method === 'credit_card'}
                onChange={(e) => handlePaymentChange('method', e.target.value)}
              />
              <span>💳 Credit Card</span>
            </label>
            
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="debit_card"
                checked={paymentInfo.method === 'debit_card'}
                onChange={(e) => handlePaymentChange('method', e.target.value)}
              />
              <span>💳 Debit Card</span>
            </label>
            
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentInfo.method === 'paypal'}
                onChange={(e) => handlePaymentChange('method', e.target.value)}
              />
              <span>🎯 PayPal</span>
            </label>
            
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                checked={paymentInfo.method === 'cash_on_delivery'}
                onChange={(e) => handlePaymentChange('method', e.target.value)}
              />
              <span>💵 Cash on Delivery</span>
            </label>
          </div>

          {(paymentInfo.method === 'credit_card' || paymentInfo.method === 'debit_card') && (
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentInfo.cardholderName}
                  onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                  placeholder="Name on card"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>

              <div className="form-group">
                <label className="form-label">CVV</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentInfo.cvv}
                  onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="checkout-section">
          <h3>📋 Order Summary</h3>
          
          {/* Cart Items */}
          {cartItems.length > 0 && (
            <div className="cart-items-preview">
              <h4>Items in Your Cart:</h4>
              {cartItems.map((item, index) => (
                <div key={index} className="checkout-item">
                  <img 
                    src={item.item_id.image || 'https://via.placeholder.com/60x60'} 
                    alt={item.item_id.name}
                    className="checkout-item-image"
                  />
                  <div className="checkout-item-details">
                    <h5>{item.item_id.name}</h5>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: {formatPrice ? formatPrice(item.item_id.price) : `₹${(item.item_id.price * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} each</p>
                  </div>
                  <div className="checkout-item-actions">
                    <div className="checkout-item-total">
                      {formatPrice ? formatPrice(item.item_id.price * item.quantity) : `₹${(item.item_id.price * item.quantity * 83.12).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </div>
                    <button 
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.item_id._id, item.item_id.name)}
                      disabled={loading}
                      title="Remove from cart"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="order-summary-checkout">
            <div className="summary-line">
              <span>Subtotal ({cartCount} items):</span>
              <span>{formatPrice ? formatPrice(subtotal / 83.12) : `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
            <div className="summary-line">
              <span>Tax (18% GST):</span>
              <span>{formatPrice ? formatPrice(tax / 83.12) : `₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
            <div className="summary-line">
              <span>Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : (formatPrice ? formatPrice(shipping / 83.12) : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}</span>
            </div>
            <div className="summary-line total-line">
              <span><strong>Total:</strong></span>
              <span><strong>{formatPrice ? formatPrice(total) : `₹${(total * 83.12).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}</strong></span>
            </div>
            {subtotal > 50 && (
              <div className="summary-note success">
                You qualify for FREE shipping across India!
              </div>
            )}
            {subtotal <= 50 && subtotal > 0 && (
              <div className="summary-note">
                Add ₹{Math.max(0, 4150 - subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more for FREE shipping!
              </div>
            )}
          </div>
        </div>

        {/* Place Order Button */}
        <div className="checkout-actions">
          <button
            type="submit"
            className={`place-order-btn ${loading ? 'loading' : ''}`}
            disabled={loading || cartCount === 0}
          >
            {loading ? 
              '⏳ Processing Your Order...' : 
              cartCount === 0 ? 
                '🛒 Cart is Empty' :
                `Place Order - ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${cartCount} items)`
            }
          </button>
          
          {cartCount === 0 && (
            <div className="empty-cart-note">
              <p>🛒 Your cart is empty.</p>
              <button 
                type="button" 
                onClick={onBack}
                className="continue-shopping-btn"
              >
                Continue Shopping
              </button>
            </div>
          )}
          
          {cartCount > 0 && (
            <div className="checkout-info">
              <p>✅ Secure checkout with SSL encryption</p>
              <p>📱 You will receive SMS and email updates</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}