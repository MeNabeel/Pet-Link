import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Shield, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
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

    // Pakistani phone validation (e.g. 03xx xxxxxxx or +923xx xxxxxxx)
    const pkPhoneRegex = /^((\+92)|(0092))?\s?3\d{2}\s?\d{7}$|^03\d{9}$/;
    if (!pkPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return 'Please enter a valid Pakistani mobile number (e.g., 03001234567).';
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

    // Simulate signup interaction
    setSuccess('Registration successful! Salting and hashing password with Bcrypt in backend...');
    console.log('Signup form submitted:', { name, email, phone, address, role, password });

    if (onSignupSuccess) {
      setTimeout(() => {
        onSignupSuccess();
      }, 2000);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card fade-in">
        <div className="signup-header">
          <img src="/logo/logo.jpeg" alt="PetLink Logo" className="signup-logo" />
          <h2 className="signup-title">Register</h2>
          <p className="signup-subtitle">Create a centralized PetLink account</p>
        </div>

        {error && (
          <div className="signup-alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="signup-alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
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
                required
              />
            </div>
          </div>

          <div className="form-group">
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
                required
              />
            </div>
          </div>

          <div className="form-group">
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
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Physical Address</label>
            <div className="input-wrapper">
              <MapPin className="input-icon-left" size={18} />
              <input 
                type="text" 
                id="address"
                className="form-control signup-input"
                placeholder="Street address, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Platform Role</label>
            <div className="input-wrapper">
              <Shield className="input-icon-left" size={18} />
              <select 
                id="role"
                className="form-control signup-input role-selector"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="buyer">Pet Adopter / Buyer</option>
                <option value="seller">Pet Owner / Seller</option>
                <option value="shelter_provider">Shelter Service Provider</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                className="form-control signup-input-password"
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
            Create Account
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
  );
}
