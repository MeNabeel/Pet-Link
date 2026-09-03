import React, { useRef } from 'react';
import { 
  Settings, ShoppingBag, LogOut, ChevronRight, Mail, Phone, Camera, MapPin, 
  Calendar, BadgeCheck, PawPrint, Heart, Bookmark, Bell, Shield,
  ShieldCheck, HeartHandshake, Sliders, LifeBuoy
} from 'lucide-react';
import './Profile.css';

export default function Profile({ user, onNavigateToSettings, onLogout, onUpdateUser, onNavigateToAddresses }) {
  const profileInputRef = useRef(null);

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
        
        {/* COMPACT SINGLE HORIZONTAL PROFILE CARD / HEADER */}
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
                <Camera size={13} />
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
                <BadgeCheck size={18} className="profile-verified-badge" fill="#0066CC" color="#FFFFFF" />
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
              <Mail size={15} className="profile-contact-icon" />
              <span>{user.email}</span>
            </div>
            
            <div className="profile-contact-item">
              <Phone size={15} className="profile-contact-icon" />
              <span>{user.phone || '0345 9422999'}</span>
            </div>

            <div className="profile-contact-item">
              <MapPin size={15} className="profile-contact-icon" />
              <span>{user.address || `${user.city || 'Lahore'}, ${user.province || 'Punjab'}`}</span>
            </div>
          </div>

          {/* Vertical Divider 2 */}
          <div className="profile-v-divider" />

          {/* Right Section: Member Since Soft Card */}
          <div className="profile-header-right">
            <div className="profile-member-since-card">
              <div className="profile-member-icon-box">
                <Calendar size={18} />
              </div>
              <div className="profile-member-info">
                <span className="profile-member-label">Member Since</span>
                <span className="profile-member-date">{formattedDate}</span>
                <span className="profile-member-status">Active Member</span>
              </div>
            </div>
          </div>

        </div>

        {/* TOP 4 STATS ROW */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(0, 102, 204, 0.08)', color: 'var(--color-primary)' }}>
              <PawPrint size={18} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">REGISTERED PETS</span>
              <span className="profile-stat-value">1</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)', color: '#16A34A' }}>
              <ShoppingBag size={18} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">ORDERS TRACKED</span>
              <span className="profile-stat-value">0</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
              <Heart size={18} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">WISHLIST</span>
              <span className="profile-stat-value">0</span>
            </div>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
              <Bookmark size={18} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">SAVED ITEMS</span>
              <span className="profile-stat-value">0</span>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN LARGE CARDS LAYOUT */}
        <div className="profile-two-cards-grid">
          
          {/* LEFT CARD — ACCOUNT & PREFERENCES */}
          <div className="profile-large-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">Account & Preferences</h3>
              <span className="profile-card-sub">Manage your account settings and preferences</span>
            </div>

            <div className="profile-pref-list">
              {/* Account Settings */}
              <div className="profile-pref-item" onClick={onNavigateToSettings}>
                <div className="profile-pref-left">
                  <div className="profile-pref-icon-box" style={{ backgroundColor: 'rgba(0, 102, 204, 0.08)', color: 'var(--color-primary)' }}>
                    <Settings size={18} />
                  </div>
                  <div className="profile-pref-text-group">
                    <span className="profile-pref-title">Account Settings</span>
                    <span className="profile-pref-desc">Update your personal information</span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--color-muted)" />
              </div>

              {/* Addresses */}
              <div className="profile-pref-item" onClick={onNavigateToAddresses || (() => handleMenuClick('Addresses'))}>
                <div className="profile-pref-left">
                  <div className="profile-pref-icon-box" style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)', color: '#16A34A' }}>
                    <MapPin size={18} />
                  </div>
                  <div className="profile-pref-text-group">
                    <span className="profile-pref-title">Addresses</span>
                    <span className="profile-pref-desc">Manage your saved addresses</span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--color-muted)" />
              </div>

              {/* Notification Preferences */}
              <div className="profile-pref-item" onClick={() => handleMenuClick('Notification Preferences')}>
                <div className="profile-pref-left">
                  <div className="profile-pref-icon-box" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', color: '#EAB308' }}>
                    <Bell size={18} />
                  </div>
                  <div className="profile-pref-text-group">
                    <span className="profile-pref-title">Notification Preferences</span>
                    <span className="profile-pref-desc">Choose how you want to be notified</span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--color-muted)" />
              </div>

              {/* Privacy & Security */}
              <div className="profile-pref-item" onClick={() => handleMenuClick('Privacy & Security')}>
                <div className="profile-pref-left">
                  <div className="profile-pref-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
                    <Shield size={18} />
                  </div>
                  <div className="profile-pref-text-group">
                    <span className="profile-pref-title">Privacy & Security</span>
                    <span className="profile-pref-desc">Manage your privacy and security settings</span>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--color-muted)" />
              </div>
            </div>
          </div>

          {/* RIGHT CARD — QUICK ACTIONS */}
          <div className="profile-large-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">Quick Actions</h3>
              <span className="profile-card-sub">Frequently used actions</span>
            </div>

            <div className="profile-quick-actions-grid">
              {/* My Orders */}
              <div className="profile-quick-action-card" onClick={() => handleMenuClick('My Orders')}>
                <div className="profile-quick-icon-box" style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)', color: '#16A34A' }}>
                  <ShoppingBag size={17} />
                </div>
                <div className="profile-quick-text-group">
                  <span className="profile-quick-title">My Orders</span>
                  <span className="profile-quick-desc">View order history</span>
                </div>
              </div>

              {/* My Pets */}
              <div className="profile-quick-action-card" onClick={() => handleMenuClick('My Pets')}>
                <div className="profile-quick-icon-box" style={{ backgroundColor: 'rgba(0, 102, 204, 0.08)', color: 'var(--color-primary)' }}>
                  <PawPrint size={17} />
                </div>
                <div className="profile-quick-text-group">
                  <span className="profile-quick-title">My Pets</span>
                  <span className="profile-quick-desc">Manage your pets</span>
                </div>
              </div>

              {/* Favorites */}
              <div className="profile-quick-action-card" onClick={() => handleMenuClick('Favorites')}>
                <div className="profile-quick-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
                  <Heart size={17} />
                </div>
                <div className="profile-quick-text-group">
                  <span className="profile-quick-title">Favorites</span>
                  <span className="profile-quick-desc">View favorite pets</span>
                </div>
              </div>

              {/* Saved */}
              <div className="profile-quick-action-card" onClick={() => handleMenuClick('Saved')}>
                <div className="profile-quick-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
                  <Bookmark size={17} />
                </div>
                <div className="profile-quick-text-group">
                  <span className="profile-quick-title">Saved</span>
                  <span className="profile-quick-desc">Saved products</span>
                </div>
              </div>
            </div>

            {/* FULL-WIDTH LOG OUT ACTION */}
            <div className="profile-logout-bar" onClick={onLogout}>
              <div className="profile-logout-left">
                <div className="profile-logout-icon-box">
                  <LogOut size={17} />
                </div>
                <span className="profile-logout-text">Log Out Session</span>
              </div>
              <ChevronRight size={16} color="#EF4444" />
            </div>
          </div>

        </div>

        {/* PLATFORM TRUST HIGHLIGHTS BAR */}
        <div className="profile-trust-highlights-bar">
          <div className="profile-trust-item">
            <div className="profile-trust-icon-box">
              <ShieldCheck size={16} />
            </div>
            <div className="profile-trust-text">
              <span className="profile-trust-title">Secure & Private</span>
              <span className="profile-trust-desc">Protected account data</span>
            </div>
          </div>

          <div className="profile-trust-item">
            <div className="profile-trust-icon-box">
              <HeartHandshake size={16} />
            </div>
            <div className="profile-trust-text">
              <span className="profile-trust-title">Trusted Pet Care</span>
              <span className="profile-trust-desc">Clinics & services unified</span>
            </div>
          </div>

          <div className="profile-trust-item">
            <div className="profile-trust-icon-box">
              <Sliders size={16} />
            </div>
            <div className="profile-trust-text">
              <span className="profile-trust-title">Easy to Manage</span>
              <span className="profile-trust-desc">Organized pet records</span>
            </div>
          </div>

          <div className="profile-trust-item">
            <div className="profile-trust-icon-box">
              <LifeBuoy size={16} />
            </div>
            <div className="profile-trust-text">
              <span className="profile-trust-title">PetLink Support</span>
              <span className="profile-trust-desc">Reliable help desk</span>
            </div>
          </div>
        </div>

        {/* SUBTLE FOOTER STRIP */}
        <div className="profile-footer-strip">
          <span className="profile-footer-brand">PetLink — Better care for every pet</span>
          <div className="profile-footer-links">
            <span className="profile-footer-link" onClick={() => handleMenuClick('Privacy Policy')}>Privacy</span>
            <span>•</span>
            <span className="profile-footer-link" onClick={() => handleMenuClick('Terms of Service')}>Terms</span>
            <span>•</span>
            <span className="profile-footer-link" onClick={() => handleMenuClick('Helpdesk')}>Support</span>
          </div>
        </div>

      </div>
    </div>
  );
}
