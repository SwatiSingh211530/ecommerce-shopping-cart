import React, { useState } from 'react';
import axios from 'axios';

export default function Register({ onRegister, switchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      window.alert('⚠️ Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      window.alert('⚠️ Passwords do not match');
      return;
    }
    
    if (password.length < 3) {
      window.alert('⚠️ Password must be at least 3 characters long');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/users', { username, password });
      window.alert('✅ Account created successfully!\n\nYou can now login with your credentials.');
      onRegister();
    } catch (err) {
      if (err.response?.data?.error === 'User exists') {
        window.alert('❌ Username already exists\n\nPlease choose a different username.');
      } else {
        window.alert('❌ Registration failed\n\nPlease try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">🛒</div>
          <h1 className="login-title">Create ShopMart Account</h1>
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
              minLength={3}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input 
              className="form-input"
              type="password"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              minLength={3}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? '⏳ Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="register-link">
          Already have an account? <a href="#" onClick={switchToLogin}>Sign In</a>
        </div>
      </div>
    </div>
  );
}