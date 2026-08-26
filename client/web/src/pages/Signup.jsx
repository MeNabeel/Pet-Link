import API_URL from '@/config';
import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Signup.css';

export default function Signup({ onNavigateToLogin, onSignupSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('buyer');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    if (!name || !email || !phone || !address || !role || !password) {
      return 'All fields are required for registration.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    const pkPhoneRegex = /^((\+92)|(0092))?\s?3\d{2}\s?\d{7}$|^03\d{9}$/;
    if (!pkPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return 'Please enter a valid Pakistani mobile number (e.g., 03001234567).';
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
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, address, role, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Account created successfully! Auto-authenticating...');
      localStorage.setItem('user', JSON.stringify(data));

      if (onSignupSuccess) {
        setTimeout(() => {
          onSignupSuccess(data);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Network error or server inactive.');
    } finally {
      setSubmitting(false);
    }
  };

  const roles = [
    { label: 'Adopter/Buyer', value: 'buyer' },
    { label: 'Pet Owner/Seller', value: 'seller' },
    { label: 'Shelter Provider', value: 'shelter_provider' },
    { label: 'Administrator', value: 'admin' },
  ];

  return (
    <div className="signup-split-container">
      {/* Left Panel logo */}
      <div className="signup-left-panel">
        <div className="signup-branding-wrapper">
          <img src="/logo/logo.jpeg" alt="PetLink Logo" className="signup-branding-logo" />
          <h1 className="signup-branding-title">PetLink</h1>
          <p className="signup-branding-tagline">
            Bringing paws and people together, one click at a time.
          </p>
        </div>
      </div>

      {/* Right Panel form */}
      <div className="signup-right-panel">
        <div className="signup-card fade-in">
          <h2 className="signup-title-h2">Register</h2>
          <p className="signup-desc">Create your centralized PetLink account</p>

          {error && (
            <div className="signup-alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="signup-alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon-left" size={18} />
                <input 
                  type="text" 
                  id="name"
                  className="form-control signup-input"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon-left" size={18} />
                <input 
                  type="email" 
                  id="email"
                  className="form-control signup-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {/* Phone & Address row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon-left" size={18} />
                  <input 
                    type="tel" 
                    id="phone"
                    className="form-control signup-input"
                    placeholder="03xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
              <div style={{ flex: 1.2 }}>
                <label className="form-label" htmlFor="address">City/Address</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon-left" size={18} />
                  <input 
                    type="text" 
                    id="address"
                    className="form-control signup-input"
                    placeholder="e.g. Lahore, PK"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role Select Grid */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Select Your Role</label>
              <div className="signup-role-grid">
                {roles.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`signup-role-btn ${role === item.value ? 'active' : ''}`}
                    onClick={() => setRole(item.value)}
                    disabled={submitting}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  className="form-control signup-input-password"
                  style={{ paddingRight: '46px' }}
                  placeholder="At least 6 characters"
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
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 20px' }}
              disabled={submitting}
            >
              {submitting ? 'Registering Account...' : 'Create Account'}
            </button>
          </form>

          <p className="signup-footer-link">
            Already have an account? 
            <span className="signup-link" onClick={onNavigateToLogin}>
              Sign In Here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
