import React, { useRef } from 'react';
import { Settings, ShoppingBag, CreditCard, HelpCircle, LogOut, ChevronRight, Mail, Phone, Camera } from 'lucide-react';
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
    alert(`Navigating to the web ${title} page... This is part of the Sprint deliverables.`);
  };

  return (
    <div className="profile-container">
      <div className="profile-card-wrapper fade-in">
        
        {/* Cover Photo */}
        <div className="profile-cover-wrapper">
          {user.coverPhoto ? (
            <img src={user.coverPhoto} alt="Cover" className="profile-cover-img" />
          ) : (
            <div className="profile-cover-placeholder" style={{ width: '100%', height: '100%' }}></div>
          )}
          <button className="profile-cover-edit-btn" onClick={() => coverInputRef.current.click()}>
            <Camera size={14} />
            Change Cover Photo
          </button>
          <input 
            type="file" 
            ref={coverInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleCoverPhotoChange}
          />
        </div>

        {/* Cover and Profile Header */}
        <div className="profile-header-card">
          <div className="profile-pic-container">
            <img 
              src={user.profilePic || "/logo/logo.jpeg"} 
              alt="Profile" 
              className="profile-pic" 
            />
            <button className="profile-pic-edit-btn" onClick={() => profileInputRef.current.click()}>
              <Camera size={14} />
            </button>
            <input 
              type="file" 
              ref={profileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleProfilePicChange}
            />
          </div>
          <div className="profile-header-info">
            <h2 className="profile-name">{user.name}</h2>
            <span className="profile-username">@{user.username || user.email.split('@')[0]}</span>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
        </div>

        {/* Contact info strip */}
        <div className="profile-contact-row">
          <div className="profile-contact-item" style={{ flex: 1 }}>
            <Mail size={16} color="var(--color-muted)" />
            <span>{user.email}</span>
          </div>
          <div className="profile-contact-item" style={{ flex: 1, borderLeft: '1px solid var(--color-border)', paddingLeft: '24px' }}>
            <Phone size={16} color="var(--color-muted)" />
            <span>{user.phone}</span>
          </div>
        </div>

        {/* Menu Navigation Rows */}
        <h3 className="profile-section-title">Profile Options</h3>

        <div className="profile-menu-card">
          {/* Row 1: Account Settings */}
          <div className="profile-menu-row" onClick={onNavigateToSettings}>
            <div className="profile-menu-label-group">
              <div className="profile-menu-icon-box" style={{ backgroundColor: 'rgba(0, 102, 204, 0.08)' }}>
                <Settings size={18} color="var(--color-primary)" />
              </div>
              <span className="profile-menu-title">Account Settings</span>
            </div>
            <ChevronRight size={16} color="var(--color-muted)" />
          </div>

          {/* Row 2: My Orders */}
          <div className="profile-menu-row" onClick={() => handleMenuClick('My Orders')}>
            <div className="profile-menu-label-group">
              <div className="profile-menu-icon-box" style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)' }}>
                <ShoppingBag size={18} color="#16A34A" />
              </div>
              <span className="profile-menu-title">My Orders</span>
            </div>
            <ChevronRight size={16} color="var(--color-muted)" />
          </div>

          {/* Row 3: Transaction History */}
          <div className="profile-menu-row" onClick={() => handleMenuClick('Transaction History')}>
            <div className="profile-menu-label-group">
              <div className="profile-menu-icon-box" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)' }}>
                <CreditCard size={18} color="#EAB308" />
              </div>
              <span className="profile-menu-title">Transaction History</span>
            </div>
            <ChevronRight size={16} color="var(--color-muted)" />
          </div>

          {/* Row 4: Support & Helpdesk */}
          <div className="profile-menu-row" onClick={() => handleMenuClick('Support Helpdesk')}>
            <div className="profile-menu-label-group">
              <div className="profile-menu-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }}>
                <HelpCircle size={18} color="#8B5CF6" />
              </div>
              <span className="profile-menu-title">Support & Helpdesk</span>
            </div>
            <ChevronRight size={16} color="var(--color-muted)" />
          </div>

          {/* Row 5: Log Out */}
          <div className="profile-menu-row" onClick={onLogout}>
            <div className="profile-menu-label-group">
              <div className="profile-menu-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
                <LogOut size={18} color="#EF4444" />
              </div>
              <span className="profile-menu-title" style={{ color: '#EF4444' }}>Log Out Session</span>
            </div>
            <ChevronRight size={16} color="#EF4444" />
          </div>
        </div>
      </div>
    </div>
  );
}
