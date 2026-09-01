import React, { useRef } from 'react';
import { 
  Settings, ShoppingBag, CreditCard, HelpCircle, LogOut, 
  ChevronRight, Mail, Phone, Camera, MapPin, Calendar, 
  BadgeCheck, PawPrint, Heart, MessageSquare, Pencil
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
        
        {/* COMPACT SINGLE HORIZONTAL PROFILE CARD / HEADER (MATCHES REFERENCE DESIGN) */}
        <div className="profile-horizontal-header-card">
          
          {/* Left Section: Avatar, Name, Verified Badge, Username, Bio */}
          <div className="profile-header-left">
            <div className="profile-avatar-container">
              <img 
                src={user.profilePic || "/logo/logo.jpeg"} 
                alt={user.name} 
                className="profile-avatar-img" 
              />
              <button 
                type="button" 
                className="profile-avatar-camera-btn" 
                onClick={() => profileInputRef.current.click()}
                title="Upload Profile Picture"
                aria-label="Upload Profile Picture"
              >
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

            <div className="profile-user-info">
              <div className="profile-name-badge-row">
                <h2 className="profile-user-name">{user.name}</h2>
                <BadgeCheck size={20} className="profile-verified-badge" fill="#0066CC" color="#FFFFFF" />
              </div>
              <span className="profile-username-tag">@{user.username || user.email.split('@')[0]}</span>
              <p className="profile-user-bio">
                {user.bio || 'Pet lover and advocate. Building a better world for our furry friends.'}
              </p>
            </div>
          </div>

          {/* Vertical Divider 1 */}
          <div className="profile-v-divider" />

          {/* Middle Section: Email, Phone, Address */}
          <div className="profile-header-middle">
            <div className="profile-contact-item">
              <Mail size={16} className="profile-contact-icon" />
              <span>{user.email}</span>
            </div>
            
            <div className="profile-contact-item">
              <Phone size={16} className="profile-contact-icon" />
              <span>{user.phone || '0345 9422999'}</span>
            </div>

            <div className="profile-contact-item">
              <MapPin size={16} className="profile-contact-icon" />
              <span>{user.address || `${user.city || 'Lahore'}, ${user.province || 'Punjab'}`}</span>
            </div>
          </div>

          {/* Vertical Divider 2 */}
          <div className="profile-v-divider" />

          {/* Right Section: Member Since Soft Card */}
          <div className="profile-header-right">
            <div className="profile-member-since-card">
              <div className="profile-member-icon-box">
                <Calendar size={20} />
              </div>
              <div className="profile-member-info">
                <span className="profile-member-label">Member Since</span>
                <span className="profile-member-date">{formattedDate}</span>
                <span className="profile-member-status">Active Member</span>
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
