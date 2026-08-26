import API_URL from '@/config';
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Login.css';

export default function Login({ onNavigateToSignup, onNavigateToForgot, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setSuccess(`Welcome back, ${data.name}! Redirecting to Dashboard...`);
      localStorage.setItem('user', JSON.stringify(data));

      if (onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess(data);
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Network error. Please make sure backend server is active.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-split-container">
      {/* Left branding panel */}
      <div className="login-left-panel">
        <div className="login-branding-wrapper">
          <img src="/logo/logo.jpeg" alt="PetLink Logo" className="login-branding-logo" />
          <h1 className="login-branding-title">PetLink</h1>
          <p className="login-branding-tagline">
            Bringing paws and people together, one click at a time.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-right-panel">
        <div className="login-card fade-in">
          <h2 className="login-title-h2">Welcome back</h2>
          <p className="login-desc">
            Log in to manage your pet's health and wellness journey.
          </p>

          {error && (
            <div className="login-alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="login-alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email field */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon-left" size={18} />
                <input 
                  type="email" 
                  id="email"
                  className="form-control login-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  className="form-control login-input-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={submitting}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="forgot-password-link-wrapper">
              <span className="forgot-link" onClick={onNavigateToForgot}>
                Forgot Password?
              </span>
            </div>

            {/* Submit button */}
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 20px' }}
              disabled={submitting}
            >
              {submitting ? 'Signing In...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider-container">
            <div className="login-divider-line"></div>
            <div className="login-divider-text">or</div>
            <div className="login-divider-line"></div>
          </div>

          {/* Signup outline btn */}
          <button 
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', padding: '14px 20px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
            onClick={onNavigateToSignup}
            disabled={submitting}
          >
            Sign Up for PetLink
          </button>
        </div>
      </div>
    </div>
  );
}
