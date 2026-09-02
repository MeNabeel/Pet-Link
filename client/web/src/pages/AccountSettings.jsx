import React, { useState } from 'react';
import { 
  Settings, Shield, User, Mail, Phone, MapPin, Globe, Calendar, 
  AtSign, Trash2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import './AccountSettings.css';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
    if (phone && !pkPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
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
    }, 800);
  };

  const handleDeleteAccount = () => {
    setIsDeleteOpen(true);
  };

  const proceedDeleteAccount = () => {
    alert("Account deletion request submitted.");
    setIsDeleteOpen(false);
  };

  const formatRole = (roleKey) => {
    switch(roleKey) {
      case 'admin': return 'System Administrator';
      case 'shelter_provider': return 'Shelter Provider';
      case 'user':
      case 'buyer':
      case 'seller':
      default: return 'User';
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card fade-in">
        
        {/* SETTINGS HEADER */}
        <div className="settings-header">
          <Settings size={20} color="var(--color-primary)" />
          <h2 className="settings-title">Account Settings</h2>
        </div>

        {error && (
          <div className="settings-alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={validateAndSubmit}>
          
          {/* RESPONSIVE 2-COLUMN FORM GRID */}
          <div className="settings-form-grid">
            
            {/* Row 1: Full Name | Username (Read-Only) */}
            <div className="form-group-compact">
              <label className="form-label-compact">Full Name</label>
              <div className="input-wrapper-compact">
                <User className="input-icon-compact" size={15} />
                <input
                  type="text"
                  className="form-input-compact"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
            </div>

            <div className="form-group-compact">
              <label className="form-label-compact">Username (Read-Only)</label>
              <div className="input-wrapper-compact">
                <AtSign className="input-icon-compact" size={15} />
                <input
                  type="text"
                  className="form-input-compact read-only"
                  placeholder="Username"
                  value={username || user.email.split('@')[0]}
                  disabled
                />
              </div>
            </div>

            {/* Row 2: Registered Email (Read-Only) | Recovery Email */}
            <div className="form-group-compact">
              <label className="form-label-compact">Registered Email (Read-Only)</label>
              <div className="input-wrapper-compact">
                <Mail className="input-icon-compact" size={15} />
                <input
                  type="email"
                  className="form-input-compact read-only"
                  value={user.email}
                  disabled
                />
              </div>
            </div>

            <div className="form-group-compact">
              <label className="form-label-compact">Recovery Email</label>
              <div className="input-wrapper-compact">
                <Mail className="input-icon-compact" size={15} />
                <input
                  type="email"
                  className="form-input-compact"
                  placeholder="recovery@example.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Row 3: Phone Number | Gender */}
            <div className="form-group-compact">
              <label className="form-label-compact">Phone Number</label>
              <div className="input-wrapper-compact">
                <Phone className="input-icon-compact" size={15} />
                <input
                  type="tel"
                  className="form-input-compact"
                  placeholder="03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-group-compact">
              <label className="form-label-compact">Gender</label>
              <div className="gender-selector-group">
                <button
                  type="button"
                  className={`gender-select-btn ${gender === 'male' ? 'active' : ''}`}
                  onClick={() => setGender('male')}
                  disabled={saving}
                >
                  Male
                </button>
                <button
                  type="button"
                  className={`gender-select-btn ${gender === 'female' ? 'active' : ''}`}
                  onClick={() => setGender('female')}
                  disabled={saving}
                >
                  Female
                </button>
                <button
                  type="button"
                  className={`gender-select-btn ${gender === 'other' ? 'active' : ''}`}
                  onClick={() => setGender('other')}
                  disabled={saving}
                >
                  Other
                </button>
              </div>
            </div>

            {/* Row 4: Date of Birth | City */}
            <div className="form-group-compact">
              <label className="form-label-compact">Date of Birth</label>
              <div className="input-wrapper-compact">
                <Calendar className="input-icon-compact" size={15} />
                <input
                  type="text"
                  className="form-input-compact"
                  placeholder="YYYY-MM-DD"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-group-compact">
              <label className="form-label-compact">City</label>
              <div className="input-wrapper-compact">
                <MapPin className="input-icon-compact" size={15} />
                <input
                  type="text"
                  className="form-input-compact"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Row 5: Province | Country */}
            <div className="form-group-compact">
              <label className="form-label-compact">Province</label>
              <div className="input-wrapper-compact">
                <Globe className="input-icon-compact" size={15} />
                <input
                  type="text"
                  className="form-input-compact"
                  placeholder="Province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-group-compact">
              <label className="form-label-compact">Country</label>
              <div className="input-wrapper-compact">
                <Globe className="input-icon-compact" size={15} />
                <input
                  type="text"
                  className="form-input-compact"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Row 6: Street Address (Full Width) */}
            <div className="form-group-compact settings-field-full">
              <label className="form-label-compact">Street Address</label>
              <div className="input-wrapper-compact">
                <MapPin className="input-icon-compact" size={15} />
                <input
                  type="text"
                  className="form-input-compact"
                  placeholder="Street Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Row 7: Biography / About (Full Width) */}
            <div className="form-group-compact settings-field-full">
              <label className="form-label-compact">Biography / About</label>
              <textarea
                className="form-textarea-compact"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={saving}
              />
            </div>

          </div>

          {/* COMPACT SYSTEM ACCOUNT DETAILS (4-ITEM GRID) */}
          <div className="settings-system-card">
            <div className="settings-system-header">
              <Shield size={15} color="var(--color-primary)" />
              <span>System Account Details</span>
            </div>
            
            <div className="settings-system-grid">
              <div className="settings-system-col">
                <span className="settings-system-label">User ID</span>
                <span className="settings-system-value settings-system-mono" title={user._id || user.id}>
                  {user._id || user.id || 'N/A'}
                </span>
              </div>

              <div className="settings-system-col">
                <span className="settings-system-label">Role</span>
                <span className="settings-system-value">{formatRole(user.role)}</span>
              </div>

              <div className="settings-system-col">
                <span className="settings-system-label">Account Created</span>
                <span className="settings-system-value">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 26, 2026'}
                </span>
              </div>

              <div className="settings-system-col">
                <span className="settings-system-label">Account Status</span>
                <span className="settings-system-value" style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} color="#16A34A" /> Active • Verified
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="settings-actions-row">
            <button type="button" className="settings-btn-cancel" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="settings-btn-save" disabled={saving}>
              {saving ? 'Saving Details...' : 'Save Details'}
            </button>
          </div>

        </form>

        {/* DANGER ZONE */}
        <div className="settings-danger-card">
          <div className="settings-danger-info">
            <span className="settings-danger-title">Danger Zone</span>
            <span className="settings-danger-desc">Delete User Account — Permanently remove your account and associated data.</span>
          </div>

          <button type="button" className="settings-btn-delete" onClick={handleDeleteAccount} disabled={saving}>
            <Trash2 size={14} />
            <span>Delete Account</span>
          </button>
        </div>

      </div>

      {/* CONFIRMATION MODAL */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={proceedDeleteAccount}>Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
