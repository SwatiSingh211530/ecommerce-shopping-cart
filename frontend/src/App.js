import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Items from './components/Items';
import Orders from './components/Orders';
import Checkout from './components/Checkout';

export default function App() {
  const tokenInitial = localStorage.getItem('token');
  const [token, setToken] = useState(tokenInitial);
  const [showRegister, setShowRegister] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('shopping'); // shopping, orders, checkout
  const [cartLoading, setCartLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [cartAnimation, setCartAnimation] = useState('');

  const handleLogin = (t) => {
    localStorage.setItem('token', t);
    setToken(t);
    setShowRegister(false);
    setCurrentView('shopping'); // Redirect to home/shopping page after login
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    
    // Simulate logout process delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    localStorage.removeItem('token');
    setToken(null);
    setShowRegister(false);
    setCartCount(0);
    setLogoutLoading(false);
  };

  const handleCartClick = () => {
    setCartLoading(true);
    setCartAnimation('cart-updated');
    
    setTimeout(() => {
      setCurrentView('checkout');
      setCartLoading(false);
      setCartAnimation('');
    }, 300);
  };

  const handleCartUpdate = (newCount) => {
    setCartCount(newCount);
    setCartAnimation('success');
    
    setTimeout(() => {
      setCartAnimation('');
    }, 600);
  };

  // Currency formatting utility - Convert USD to Indian Rupees
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (!numPrice || isNaN(numPrice)) return '₹0';
    const inrPrice = numPrice * 83.12; // Convert USD to INR
    return `₹${inrPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Alternative format for consistent INR display
  const formatPriceINR = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (!numPrice || isNaN(numPrice)) return '₹0';
    const inrPrice = numPrice * 83.12; // Convert USD to INR
    return `₹${inrPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Remove item from cart
  const handleRemoveFromCart = async (itemId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/carts/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
      });
      
      if (response.ok) {
        const result = await response.json();
        handleCartUpdate(result.cartCount);
        return true;
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
    return false;
  };

  const handleRegister = () => {
    setShowRegister(false);
  };

  const switchToRegister = () => setShowRegister(true);
  const switchToLogin = () => setShowRegister(false);

  if (!token) {
    return showRegister ? (
      <Register onRegister={handleRegister} switchToLogin={switchToLogin} />
    ) : (
      <Login onLogin={handleLogin} switchToRegister={switchToRegister} />
    );
  }

  return (
    <div className="app-container">
      {/* Enhanced Modern E-commerce Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            🛒 ShopMart
          </div>
          
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search for products, brands and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">
              🔍
            </button>
          </div>
          
          <div className="header-actions">
            <button
              onClick={() => setCurrentView('orders')}
              className={`nav-btn ${currentView === 'orders' ? 'active' : ''}`}
            >
              📦 My Orders
            </button>
            
            <div 
              className={`cart-icon ${cartLoading ? 'loading' : ''} ${cartAnimation} ${cartCount === 0 ? 'cart-empty' : 'cart-full'}`}
              onClick={handleCartClick}
              data-count={cartCount}
              data-tooltip={cartCount === 0 ? "Your cart is empty" : `${cartCount} items in cart`}
            >
              🛒 <span>Cart</span>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>
            
            <button 
              onClick={handleLogout}
              className={`logout-btn ${logoutLoading ? 'loading' : ''}`}
              disabled={logoutLoading}
            >
              {logoutLoading ? '⏳' : '👤'} <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentView === 'shopping' && (
          <Items 
            token={token} 
            cartCount={cartCount} 
            setCartCount={setCartCount}
            onCartUpdate={handleCartUpdate}
            searchQuery={searchQuery}
            onLogout={handleLogout}
            formatPrice={formatPrice}
          />
        )}
        
        {currentView === 'orders' && (
          <Orders 
            token={token}
            onBack={() => setCurrentView('shopping')}
            formatPrice={formatPrice}
            onRemoveFromCart={handleRemoveFromCart}
          />
        )}
        
        {currentView === 'checkout' && (
          <Checkout
            token={token}
            cartCount={cartCount}
            setCartCount={setCartCount}
            onCartUpdate={handleCartUpdate}
            onBack={() => setCurrentView('shopping')}
            onOrderComplete={() => setCurrentView('orders')}
            formatPrice={formatPrice}
            onRemoveFromCart={handleRemoveFromCart}
          />
        )}
      </main>
    </div>
  );
}
