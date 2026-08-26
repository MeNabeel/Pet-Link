import API_URL from '@/config';
import React, { useState } from 'react';
import { Mail, Lock, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import './ForgotPassword.css';

export default function ForgotPassword({ onNavigateToLogin }) {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP dispatch failed');
      }

      setSuccess('Verification OTP code sent to your email! (Please check backend console log if local)');
      setTimeout(() => {
        setStep(2);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification dispatch failed. Make sure backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || !newPassword) {
      setError('Please enter the OTP verification code and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset operation failed');
      }

      setSuccess('Password updated successfully! Redirecting to login portal...');
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Reset request failed. Please check your verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card fade-in">
        <div className="forgot-header">
          <img src="/logo/logo.jpeg" alt="PetLink Logo" className="forgot-logo" />
          <h2 className="forgot-title">Reset Password</h2>
          <p className="forgot-subtitle">
            {step === 1 
              ? 'Enter your registered email address to receive a 6-digit verification code.'
              : 'Enter the 6-digit verification code received in your email and your new password.'
            }
          </p>
        </div>

        {error && (
          <div className="forgot-alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="forgot-alert-success">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Send OTP Form */
          <form onSubmit={handleSendOtp} noValidate>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="forgot-email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon-left" size={18} />
                <input 
                  type="email" 
                  id="forgot-email"
                  className="form-control signup-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 20px' }}
              disabled={submitting}
            >
              {submitting ? 'Sending Code...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          /* Step 2: Reset Password Form */
          <form onSubmit={handleResetPassword} noValidate>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="otp">Verification Code</label>
              <div className="input-wrapper">
                <KeyRound className="input-icon-left" size={18} />
                <input 
                  type="text" 
                  id="otp"
                  className="form-control signup-input"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="new-password">New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon-left" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="new-password"
                  className="form-control signup-input-password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 20px' }}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="forgot-footer-link">
          Remember credentials?
          <span className="forgot-link" onClick={onNavigateToLogin}>
            Sign In Here
          </span>
        </p>
      </div>
    </div>
  );
}
