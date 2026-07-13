import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Login.css';

export default function Login({ onNavigateToSignup, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!email || !password) {
      return 'Please enter both email and password.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Simulate login interaction
    setSuccess('Logging in... Authenticating JWT token from backend...');
    console.log('Login credentials submitted:', { email, password });

    if (onLoginSuccess) {
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <img src="/logo/logo.jpeg" alt="PetLink Logo" className="login-logo" />
          <h2 className="login-title">Sign In</h2>
          <p className="login-subtitle">Access your PetLink account</p>
        </div>

        {error && (
          <div className="login-alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="login-alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input 
                type="email" 
                id="email"
                className="form-control login-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                className="form-control login-input-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 20px', marginTop: '10px' }}
          >
            Sign In
          </button>
        </form>

        <p className="login-footer-link">
          Don't have an account? 
          <span className="login-link" onClick={onNavigateToSignup}>
            Register Here
          </span>
        </p>
      </div>
    </div>
  );
}
