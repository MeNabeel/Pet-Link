import React, { useRef } from 'react';
import { 
  Settings, ShoppingBag, CreditCard, HelpCircle, LogOut, 
  ChevronRight, Mail, Phone, Camera, MapPin, Calendar, 
  User, PawPrint, Heart, MessageSquare, Pencil, Shield
} from 'lucide-react';
import './Profile.css';

export default function Profile({ user, onNavigateToSettings, onLogout, onUpdateUser }) {
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  if (!user) return null;

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ ...user, coverPhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuClick = (title) => {
    alert(`Navigating to the web ${title} page... Part of Sprint deliverables.`);
  };

  const formattedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  }) : 'May 2024';

  return (
    <div className="profile-container">
      <div className="profile-card-wrapper fade-in">
        
        {/* HERO & COVER BANNER (NO WELCOME BACK TEXT) */}
        <div className="profile-hero-card">
          <div className="profile-cover-banner">
            {user.coverPhoto ? (
              <img src={user.coverPhoto} alt="Profile Cover" className="profile-cover-img" />
            ) : (
              <div className="profile-cover-placeholder" />
            )}
            
            <button 
              type="button" 
              className="profile-cover-edit-btn" 
              onClick={() => coverInputRef.current.click()}
              aria-label="Change Cover Photo"
            >
              <Camera size={14} />
              <span>Change Cover Photo</span>
            </button>
            <input 
              type="file" 
              ref={coverInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleCoverPhotoChange}
            />
          </div>

          {/* PROFILE HEADER OVERLAY & USER DETAILS */}
          <div className="profile-header-body">
            
            {/* Avatar & Edit Settings Row */}
            <div className="profile-avatar-row">
              <div className="profile-avatar-wrapper">
                <img 
                  src={user.profilePic || "/logo/logo.jpeg"} 
                  alt={user.name} 
                  className="profile-avatar-img" 
                />
                <button 
                  type="button" 
                  className="profile-avatar-upload-btn" 
                  onClick={() => profileInputRef.current.click()}
                  title="Upload Profile Picture"
                  aria-label="Upload Profile Picture"
                >
                  <Camera size={15} />
                </button>
                <input 
                  type="file" 
                  ref={profileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleProfilePicChange}
                />
              </div>

              <button 
                type="button" 
                className="profile-edit-settings-btn"
                onClick={onNavigateToSettings}
              >
                <Pencil size={15} />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* User Identity Details */}
            <div className="profile-user-identity">
              <h2 className="profile-user-name">{user.name}</h2>
              
              <div className="profile-user-sub-row">
                <span className="profile-username-tag">@{user.username || user.email.split('@')[0]}</span>
                <span className="profile-role-badge">USER</span>
              </div>

              {user.bio && <p className="profile-user-bio">{user.bio}</p>}
            </div>

            {/* Metadata Strip */}
            <div className="profile-meta-strip">
              <div className="profile-meta-item">
                <Mail size={15} color="var(--color-primary)" />
                <span>{user.email}</span>
              </div>

              {user.phone && (
                <div className="profile-meta-item">
                  <Phone size={15} color="var(--color-primary)" />
                  <span>{user.phone}</span>
                </div>
              )}

              <div className="profile-meta-item">
                <MapPin size={15} color="var(--color-primary)" />
                <span>{user.address || `${user.city || 'Lahore'}, ${user.province || 'Punjab'}`}</span>
              </div>

              <div className="profile-meta-item">
                <Calendar size={15} color="var(--color-primary)" />
                <span>Joined {formattedDate}</span>
              </div>
            </div>

          </div>
        </div>

        {/* QUICK ACCOUNT STATS GRID */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(0, 102, 204, 0.08)', color: 'var(--color-primary)' }}>
              <PawPrint size={20} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">REGISTERED PETS</span>
              <span className="profile-stat-value">1</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)', color: '#16A34A' }}>
              <ShoppingBag size={20} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">ORDERS TRACKED</span>
              <span className="profile-stat-value">0</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
              <Heart size={20} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">SAVED ITEMS</span>
              <span className="profile-stat-value">0</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
              <MessageSquare size={20} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">SUPPORT TICKETS</span>
              <span className="profile-stat-value">0</span>
            </div>
          </div>
        </div>

        {/* ACCOUNT OPTIONS CARDS */}
        <div className="profile-options-section">
          <h3 className="profile-section-title">Account Options</h3>

          <div className="profile-options-grid">
            
            {/* Account Settings */}
            <div className="profile-option-card" onClick={onNavigateToSettings}>
              <div className="profile-option-left">
                <div className="profile-option-icon-box" style={{ backgroundColor: 'rgba(0, 102, 204, 0.08)', color: 'var(--color-primary)' }}>
                  <Settings size={20} />
                </div>
                <div className="profile-option-text-group">
                  <span className="profile-option-title">Account Settings</span>
                  <span className="profile-option-desc">Manage personal info, security & preferences</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-muted)" />
            </div>

            {/* My Orders */}
            <div className="profile-option-card" onClick={() => handleMenuClick('My Orders')}>
              <div className="profile-option-left">
                <div className="profile-option-icon-box" style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)', color: '#16A34A' }}>
                  <ShoppingBag size={20} />
                </div>
                <div className="profile-option-text-group">
                  <span className="profile-option-title">My Orders</span>
                  <span className="profile-option-desc">View order history and delivery dispatch status</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-muted)" />
            </div>

            {/* Transaction History */}
            <div className="profile-option-card" onClick={() => handleMenuClick('Transaction History')}>
              <div className="profile-option-left">
                <div className="profile-option-icon-box" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', color: '#EAB308' }}>
                  <CreditCard size={20} />
                </div>
                <div className="profile-option-text-group">
                  <span className="profile-option-title">Transaction History</span>
                  <span className="profile-option-desc">View payment logs and financial statements</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-muted)" />
            </div>

            {/* Support & Helpdesk */}
            <div className="profile-option-card" onClick={() => handleMenuClick('Support Helpdesk')}>
              <div className="profile-option-left">
                <div className="profile-option-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
                  <HelpCircle size={20} />
                </div>
                <div className="profile-option-text-group">
                  <span className="profile-option-title">Support & Helpdesk</span>
                  <span className="profile-option-desc">Get instant support and view open tickets</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-muted)" />
            </div>

            {/* Log Out */}
            <div className="profile-option-card danger" onClick={onLogout} style={{ gridColumn: '1 / -1' }}>
              <div className="profile-option-left">
                <div className="profile-option-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
                  <LogOut size={20} />
                </div>
                <div className="profile-option-text-group">
                  <span className="profile-option-title" style={{ color: '#EF4444' }}>Log Out Session</span>
                  <span className="profile-option-desc">Safely end your active PetLink workspace session</span>
                </div>
              </div>
              <ChevronRight size={18} color="#EF4444" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
