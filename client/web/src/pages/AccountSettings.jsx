import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, Shield, User, Mail, Phone, MapPin, Globe, Calendar, 
  AtSign, Trash2, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, X
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
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  // Calendar Popover state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const initialYear = dob ? parseInt(dob.split('-')[0]) : 2000;
  const initialMonth = dob ? parseInt(dob.split('-')[1]) - 1 : 0;
  const [calYear, setCalYear] = useState(isNaN(initialYear) ? 2000 : initialYear);
  const [calMonth, setCalMonth] = useState(isNaN(initialMonth) ? 0 : initialMonth);

  // Sync form inputs when user prop updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setRecoveryEmail(user.recoveryEmail || '');
      setPhone(user.phone || '');
      setGender(user.gender || 'male');
      setDob(user.dob || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setProvince(user.province || '');
      setCountry(user.country || '');
      setBio(user.bio || '');
    }
  }, [user]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleSelectDate = (day) => {
    const formattedMonth = String(calMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    setDob(`${calYear}-${formattedMonth}-${formattedDay}`);
    setIsCalendarOpen(false);
  };

  // Immediate Cancel reset - NO popup, NO API request
  const handleCancelClick = () => {
    setName(user.name || '');
    setUsername(user.username || '');
    setRecoveryEmail(user.recoveryEmail || '');
    setPhone(user.phone || '');
    setGender(user.gender || 'male');
    setDob(user.dob || '');
    setAddress(user.address || '');
    setCity(user.city || '');
    setProvince(user.province || '');
    setCountry(user.country || '');
    setBio(user.bio || '');
    setError('');
    setIsCalendarOpen(false);
    onCancel();
  };

  // Validate form first, then trigger Save confirmation modal
  const handlePreSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
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

    // Open Shadcn Save Confirmation Modal
    setIsSaveConfirmOpen(true);
  };

  // Execute actual database update call after user confirms
  const proceedSaveDetails = async () => {
    setIsSaveConfirmOpen(false);
    setSaving(true);
    try {
      await onSave({
        ...user,
        name: name.trim(),
        username,
        recoveryEmail: recoveryEmail.trim(),
        phone: phone.trim(),
        gender,
        dob,
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        country: country.trim(),
        bio: bio.trim()
      });
    } catch (err) {
      setError(err.message || 'Failed to save account details.');
    } finally {
      setSaving(false);
    }
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

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 90 }, (_, i) => currentYear - i);

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

        <form onSubmit={handlePreSubmit}>
          
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

            {/* Row 4: Date of Birth (Shadcn Calendar Popover) | City */}
            <div className="form-group-compact" style={{ position: 'relative' }} ref={calendarRef}>
              <label className="form-label-compact">Date of Birth</label>
              <div className="input-wrapper-compact" onClick={() => !saving && setIsCalendarOpen(!isCalendarOpen)}>
                <Calendar className="input-icon-compact" size={15} />
                <input
                  type="text"
                  className="form-input-compact"
                  placeholder="YYYY-MM-DD"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={saving}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              {/* SHADCN CALENDAR POPOVER DROPDOWN */}
              {isCalendarOpen && (
                <div className="shadcn-calendar-popover fade-in">
                  <div className="calendar-popover-header">
                    <button 
                      type="button" 
                      className="cal-nav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (calMonth === 0) {
                          setCalMonth(11);
                          setCalYear(calYear - 1);
                        } else {
                          setCalMonth(calMonth - 1);
                        }
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="cal-title-selects">
                      <select 
                        value={calMonth} 
                        onChange={(e) => setCalMonth(parseInt(e.target.value))}
                        className="cal-month-select"
                      >
                        {monthNames.map((m, idx) => (
                          <option key={m} value={idx}>{m}</option>
                        ))}
                      </select>

                      <select 
                        value={calYear} 
                        onChange={(e) => setCalYear(parseInt(e.target.value))}
                        className="cal-year-select"
                      >
                        {yearsList.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="button" 
                      className="cal-nav-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (calMonth === 11) {
                          setCalMonth(0);
                          setCalYear(calYear + 1);
                        } else {
                          setCalMonth(calMonth + 1);
                        }
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Calendar Grid Header */}
                  <div className="calendar-grid-header">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>

                  {/* Calendar Days */}
                  <div className="calendar-days-grid">
                    {Array.from({ length: getFirstDayOfMonth(calMonth, calYear) }).map((_, i) => (
                      <div key={`empty-${i}`} className="cal-day empty" />
                    ))}

                    {Array.from({ length: getDaysInMonth(calMonth, calYear) }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isSelected = dob === dateStr;

                      return (
                        <button
                          key={dayNum}
                          type="button"
                          className={`cal-day-btn ${isSelected ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDate(dayNum);
                          }}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
            <button type="button" className="settings-btn-cancel" onClick={handleCancelClick} disabled={saving}>
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

      {/* SAVE CHANGES CONFIRMATION MODAL */}
      <AlertDialog open={isSaveConfirmOpen} onOpenChange={setIsSaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have updated your account information. Do you want to save these changes to your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsSaveConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={proceedSaveDetails}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={proceedDeleteAccount}>Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
