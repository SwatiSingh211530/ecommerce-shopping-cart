import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin, switchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      window.alert('⚠️ Please enter both username and password');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users/login`, { username, password });
      const { token } = res.data;
      if (!token) return window.alert('❌ Invalid username/password');
      onLogin(token);
    } catch (err) {
      if (err.response?.status === 401) {
        window.alert('❌ Invalid username/password\n\nDouble-check your credentials or create a new account.');
      } else {
        window.alert('❌ Login failed\n\nPlease try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = () => {
    setUsername('demo');
    setPassword('demo');
  };

  return (
    <div className="center">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">🛒</div>
          <h1 className="login-title">Sign in to ShopMart</h1>
        </div>

        {/* Demo Credentials Section */}
        <div className="demo-credentials">
          <h3 style={{margin: '0 0 10px 0', color: '#667eea', fontSize: '14px'}}>🎯 Try Demo Account</h3>
          <div className="demo-buttons">
            <button 
              type="button" 
              onClick={() => {setUsername('demo'); setPassword('demo123');}} 
              className="demo-btn"
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              Demo User
            </button>
            <button 
              type="button" 
              onClick={() => {setUsername('admin'); setPassword('admin123');}} 
              className="demo-btn"
              style={{
                background: '#764ba2',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Admin User
            </button>
          </div>
          <p style={{fontSize: '11px', color: '#666', margin: '8px 0 15px 0'}}>
            Click to auto-fill credentials, then login
          </p>
        </div>
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              className="form-input"
              type="text"
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="form-input"
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <button 
          type="button"
          className="demo-login-btn"
          onClick={loginDemo}
        >
          🎭 Try Demo Account
        </button>
        
        <div className="register-link">
          New to ShopMart? <a href="#" onClick={switchToRegister}>Create your account</a>
        </div>
      </div>
    </div>
  );
}
