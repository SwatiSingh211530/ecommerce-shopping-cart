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
      const res = await axios.post('http://localhost:5000/users/login', { username, password });
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
