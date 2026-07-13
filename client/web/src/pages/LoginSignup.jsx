import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Shield, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import './LoginSignup.css';

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('buyer');

  // Input Toggles
  const handleTabChange = (loginState) => {
    setIsLogin(loginState);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setRole('buyer');
  };

  // Form Validations
  const validateForm = () => {
    if (!email || !password) {
      return 'Please fill in all required credentials.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (!isLogin) {
      if (!name || !phone || !address || !role) {
        return 'All fields are required for registration.';
      }

      // Pakistani phone format validator (e.g. 03xx xxxxxxx or +923xx xxxxxxx)
      const pkPhoneRegex = /^((\+92)|(0092))?\s?3\d{2}\s?\d{7}$|^03\d{9}$/;
      if (!pkPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        return 'Please enter a valid Pakistani mobile number (e.g., 03001234567).';
      }
    }

    return null;
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isLogin) {
      // Simulate Login Success
      setSuccess(`Welcome back! Authenticating secure token via JWT...`);
      console.log('Login credentials:', { email, password });
    } else {
      // Simulate Signup Success
      setSuccess(`Registration successful! Password hashed via Bcrypt. You can now Log In.`);
      console.log('Signup details:', { name, email, password, phone, address, role });
      
      // Auto-toggle to Login tab after delay
      setTimeout(() => {
        setIsLogin(true);
        setSuccess('Account created! Please sign in with your credentials.');
        setError('');
        setPassword('');
      }, 2500);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <img src="/logo/logo.jpeg" alt="PetLink Logo" className="auth-logo" />
          <h2 className="auth-title">PetLink Portal</h2>
          <p className="auth-subtitle">Centralized Pet Management Ecosystem</p>
        </div>

        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => handleTabChange(true)}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => handleTabChange(false)}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon-left" size={18} />
                <input 
                  type="text" 
                  id="name"
                  className="form-control auth-input"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={18} />
              <input 
                type="email" 
                id="email"
                className="form-control auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <Phone className="input-icon-left" size={18} />
                <input 
                  type="tel" 
                  id="phone"
                  className="form-control auth-input"
                  placeholder="03xxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="address">Physical Address</label>
              <div className="input-wrapper">
                <MapPin className="input-icon-left" size={18} />
                <input 
                  type="text" 
                  id="address"
                  className="form-control auth-input"
                  placeholder="Street address, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="role">Platform Role</label>
              <div className="input-wrapper">
                <Shield className="input-icon-left" size={18} />
                <select 
                  id="role"
                  className="form-control auth-input role-selector"
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
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                className="form-control auth-input-password"
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
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
