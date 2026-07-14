import React, { useState } from 'react';
import { Settings, Shield, User, Mail, Phone, MapPin, Globe, Calendar, AtSign, Trash2 } from 'lucide-react';
import './AccountSettings.css';

export default function AccountSettings({ user, onSave, onCancel }) {
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [recoveryEmail, setRecoveryEmail] = useState(user.recoveryEmail || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [gender, setGender] = useState(user.gender || 'male');
  const [dob, setDob] = useState(user.dob || '');
  const [address, setAddress] = useState(user.address || '');
  const [city, setCity] = useState(user.city || '');
  const [province, setProvince] = useState(user.province || '');
  const [country, setCountry] = useState(user.country || '');
  const [bio, setBio] = useState(user.bio || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const validateAndSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Full Name is required.');
      return;
    }

    if (recoveryEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recoveryEmail)) {
        setError('Please enter a valid recovery email address.');
        return;
      }
    }

    const pkPhoneRegex = /^((\+92)|(0092))?\s?3\d{2}\s?\d{7}$|^03\d{9}$/;
    if (!pkPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      setError('Please enter a valid Pakistani mobile number (e.g. 03001234567).');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      onSave({
        ...user,
        name,
        username,
        recoveryEmail,
        phone,
        gender,
        dob,
        address,
        city,
        province,
        country,
        bio
      });
      setSaving(false);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    const confirmation = window.confirm("This action is permanent. Are you sure you want to request account deletion?");
    if (confirmation) {
      alert("Account deletion request submitted.");
    }
  };

  const formatRole = (roleKey) => {
    switch(roleKey) {
      case 'admin': return 'System Administrator';
      case 'buyer': return 'Pet Buyer / Adopter';
      case 'seller': return 'Pet Owner / Seller';
      case 'shelter_provider': return 'Shelter Provider';
      default: return 'User';
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card fade-in">
        <div className="settings-header">
          <Settings size={22} color="var(--color-primary)" />
          <h2 className="settings-title">Account Settings</h2>
        </div>

        {error && (
          <div className="login-alert-error" style={{ marginBottom: '20px' }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={validateAndSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon-left" size={16} />
              <input
                type="text"
                className="form-control login-input"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <AtSign className="input-icon-left" size={16} />
              <input
                type="text"
                className="form-control login-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Email - Read-Only */}
          <div className="form-group">
            <label className="form-label">Registered Email (Read-Only)</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={16} />
              <input
                type="email"
                className="form-control login-input settings-read-only"
                value={user.email}
                disabled
              />
            </div>
          </div>

          {/* Recovery Email */}
          <div className="form-group">
            <label className="form-label">Recovery Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon-left" size={16} />
              <input
                type="email"
                className="form-control login-input"
                placeholder="recovery@example.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon-left" size={16} />
              <input
                type="tel"
                className="form-control login-input"
                placeholder="03xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Gender</label>
            <div className="settings-gender-group">
              <button
                type="button"
                className={`settings-gender-btn ${gender === 'male' ? 'active' : ''}`}
                onClick={() => setGender('male')}
                disabled={saving}
              >
                Male
              </button>
              <button
                type="button"
                className={`settings-gender-btn ${gender === 'female' ? 'active' : ''}`}
                onClick={() => setGender('female')}
                disabled={saving}
              >
                Female
              </button>
              <button
                type="button"
                className={`settings-gender-btn ${gender === 'other' ? 'active' : ''}`}
                onClick={() => setGender('other')}
                disabled={saving}
              >
                Other
              </button>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <div className="input-wrapper">
              <Calendar className="input-icon-left" size={16} />
              <input
                type="text"
                className="form-control login-input"
                placeholder="YYYY-MM-DD"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Biography */}
          <div className="form-group">
            <label className="form-label">Biography / About</label>
            <textarea
              className="form-control"
              style={{ height: '70px', paddingLeft: '14px', resize: 'none' }}
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <div className="input-wrapper">
              <MapPin className="input-icon-left" size={16} />
              <input
                type="text"
                className="form-control login-input"
                placeholder="Street Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* City & Province row */}
          <div className="settings-form-row">
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '14px' }}
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <label className="form-label">Province</label>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '14px' }}
                placeholder="Province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Country */}
          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Country</label>
            <div className="input-wrapper">
              <Globe className="input-icon-left" size={16} />
              <input
                type="text"
                className="form-control login-input"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* System info read only card */}
          <div className="settings-system-card">
            <div className="settings-system-header">
              <Shield size={16} color="var(--color-primary)" />
              <span>System Account Details</span>
            </div>
            <div className="settings-system-row">
              <span className="settings-system-label">User ID</span>
              <span className="settings-system-value settings-system-mono">{user._id || 'N/A'}</span>
            </div>
            <div className="settings-system-row">
              <span className="settings-system-label">Role</span>
              <span className="settings-system-value">{formatRole(user.role)}</span>
            </div>
            <div className="settings-system-row">
              <span className="settings-system-label">Account Created</span>
              <span className="settings-system-value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="settings-system-row">
              <span className="settings-system-label">Account Status</span>
              <span className="settings-system-value" style={{ color: '#16A34A' }}>Active | Verified</span>
            </div>
          </div>

          {/* Actions */}
          <div className="settings-actions">
            <button type="button" className="settings-btn-cancel" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="settings-btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </form>

        <button type="button" className="settings-btn-delete" onClick={handleDeleteAccount} disabled={saving}>
          <Trash2 size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Delete User Account
        </button>
      </div>
    </div>
  );
}
