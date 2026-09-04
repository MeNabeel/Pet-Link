import API_URL from '@/config';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Settings, ShoppingBag, LogOut, ChevronRight, Mail, Phone, Camera, MapPin, 
  Calendar, BadgeCheck, PawPrint, Heart, Bookmark, Bell, Shield,
  ShieldCheck, HeartHandshake, Sliders, LifeBuoy, X, Eye, Sparkles, Trash2
} from 'lucide-react';
import PetImage from '../components/PetImage';
import './Profile.css';

export default function Profile({ 
  user, 
  onNavigateToSettings, 
  onLogout, 
  onUpdateUser, 
  onNavigateToAddresses,
  onViewPetDetails
}) {
  const profileInputRef = useRef(null);

  // Favorites & Saved Data State
  const [favoritesList, setFavoritesList] = useState([]);
  const [savedList, setSavedList] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Active Overlay Modal ('none' | 'favorites' | 'saved')
  const [activeModal, setActiveModal] = useState('none');
  const [quickViewPet, setQuickViewPet] = useState(null);

  const userId = user && (user._id || user.id);

  // Fetch User Favorites & Saved Items
  const loadUserData = useCallback(async () => {
    if (!userId) return;
    setLoadingItems(true);
    try {
      // 1. Fetch Wishlist / Favorites
      const favRes = await fetch(`${API_URL}/api/wishlist/owner/${userId}`);
      if (favRes.ok) {
        const favData = await favRes.json();
        setFavoritesList(favData.wishlist || []);
      }

      // 2. Load Saved Pet IDs from localStorage
      const savedStored = localStorage.getItem(`petlink_saved_pets_${userId}`);
      const savedIds = savedStored ? JSON.parse(savedStored) : [];

      if (savedIds.length > 0) {
        // Fetch marketplace listings to populate saved pet details
        const mpRes = await fetch(`${API_URL}/api/marketplace?limit=50`);
        if (mpRes.ok) {
          const mpData = await mpRes.json();
          const allPets = mpData.pets || [];
          const matchedSaved = allPets.filter(p => savedIds.includes(p._id || p.id));
          setSavedList(matchedSaved);
        }
      } else {
        setSavedList([]);
      }
    } catch (err) {
      console.error('Error fetching user profile stats data:', err);
    } finally {
      setLoadingItems(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

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
    alert(`Navigating to ${title}... Available in upcoming Sprint release.`);
  };

  // Remove Favorite
  const handleRemoveFavorite = async (e, petId) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/wishlist/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, petId })
      });
      if (res.ok) {
        setFavoritesList(prev => prev.filter(p => (p._id || p.id) !== petId));
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  // Remove Saved
  const handleRemoveSaved = (e, petId) => {
    e.stopPropagation();
    if (!userId) return;
    const updated = savedList.filter(p => (p._id || p.id) !== petId);
    setSavedList(updated);
    const updatedIds = updated.map(p => p._id || p.id);
    localStorage.setItem(`petlink_saved_pets_${userId}`, JSON.stringify(updatedIds));
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

          {/* DYNAMIC FAVORITES STAT CARD */}
          <div className="profile-stat-card clickable" onClick={() => setActiveModal('favorites')}>
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
              <Heart size={18} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">FAVORITES</span>
              <span className="profile-stat-value">{favoritesList.length}</span>
            </div>
          </div>

          {/* DYNAMIC SAVED ITEMS STAT CARD */}
          <div className="profile-stat-card clickable" onClick={() => setActiveModal('saved')}>
            <div className="profile-stat-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
              <Bookmark size={18} />
            </div>
            <div className="profile-stat-info">
              <span className="profile-stat-label">SAVED ITEMS</span>
              <span className="profile-stat-value">{savedList.length}</span>
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
              <div className="profile-quick-action-card" onClick={() => handleMenuClick('My Orders')}>
                <div className="profile-quick-icon-box" style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)', color: '#16A34A' }}>
                  <ShoppingBag size={17} />
                </div>
                <div className="profile-quick-text-group">
                  <span className="profile-quick-title">My Orders</span>
                  <span className="profile-quick-desc">View order history</span>
                </div>
              </div>

              <div className="profile-quick-action-card" onClick={() => handleMenuClick('My Pets')}>
                <div className="profile-quick-icon-box" style={{ backgroundColor: 'rgba(0, 102, 204, 0.08)', color: 'var(--color-primary)' }}>
                  <PawPrint size={17} />
                </div>
                <div className="profile-quick-text-group">
                  <span className="profile-quick-title">My Pets</span>
                  <span className="profile-quick-desc">Manage your pets</span>
                </div>
              </div>

              {/* FAVORITES QUICK ACTION */}
              <div className="profile-quick-action-card" onClick={() => setActiveModal('favorites')}>
                <div className="profile-quick-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
                  <Heart size={17} />
                </div>
                <div className="profile-quick-text-group">
                  <span className="profile-quick-title">Favorites</span>
                  <span className="profile-quick-desc">View favorite pets ({favoritesList.length})</span>
                </div>
              </div>

              {/* SAVED QUICK ACTION */}
              <div className="profile-quick-action-card" onClick={() => setActiveModal('saved')}>
                <div className="profile-quick-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
                  <Bookmark size={17} />
                </div>
                <div className="profile-quick-text-group">
                  <span className="profile-quick-title">Saved</span>
                  <span className="profile-quick-desc">View saved items ({savedList.length})</span>
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

      {/* FAVORITES OR SAVED OVERLAY MODAL */}
      {activeModal !== 'none' && (
        <div className="pet-details-drawer-overlay" onClick={() => setActiveModal('none')}>
          <div className="pet-details-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', maxHeight: '85vh' }}>
            <div className="pet-drawer-header">
              <h3 className="pet-drawer-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeModal === 'favorites' ? (
                  <>
                    <Heart size={20} color="#EF4444" fill="#EF4444" />
                    <span>My Favorite Companions ({favoritesList.length})</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={20} color="#8B5CF6" fill="#8B5CF6" />
                    <span>My Saved Items ({savedList.length})</span>
                  </>
                )}
              </h3>
              <button type="button" className="pet-drawer-close-btn" onClick={() => setActiveModal('none')}>
                <X size={20} />
              </button>
            </div>

            <div className="profile-items-scroll-grid">
              {(activeModal === 'favorites' ? favoritesList : savedList).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>
                    {activeModal === 'favorites' 
                      ? 'No favorite companions saved yet.' 
                      : 'No saved items found.'}
                  </p>
                  <span style={{ fontSize: '12px' }}>
                    {activeModal === 'favorites'
                      ? 'Click the heart icon on any marketplace pet listing to add it to your favorites.'
                      : 'Click the bookmark icon on any marketplace pet listing to save it for later.'}
                  </span>
                </div>
              ) : (
                <div className="profile-pets-grid">
                  {(activeModal === 'favorites' ? favoritesList : savedList).map((pet) => {
                    const petId = pet._id || pet.id;
                    return (
                      <div key={petId} className="profile-mini-pet-card">
                        <div className="profile-mini-pet-img-box">
                          <PetImage src={pet.image} imageSettings={pet.imageSettings} type="card" style={{ height: '100%' }} />
                          <button 
                            type="button" 
                            className="profile-mini-remove-btn"
                            onClick={(e) => activeModal === 'favorites' ? handleRemoveFavorite(e, petId) : handleRemoveSaved(e, petId)}
                            title="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="profile-mini-pet-info">
                          <h4 className="profile-mini-pet-name">{pet.name}</h4>
                          <span className="profile-mini-pet-sub">{pet.breed} • {pet.species}</span>
                          <div className="profile-mini-pet-price-row">
                            <span className="profile-mini-price">
                              {pet.activeStatus === 'FOR_SALE'
                                ? (pet.price ? `${pet.price.toLocaleString()} PKR` : 'Call for Price')
                                : 'Free Adoption'}
                            </span>
                            <div className="profile-mini-actions">
                              <button 
                                type="button"
                                className="profile-mini-action-icon"
                                onClick={() => setQuickViewPet(pet)}
                                title="Quick View"
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pet-modal-actions">
              <button type="button" className="pet-modal-btn-cancel" onClick={() => setActiveModal('none')}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW SUB-MODAL */}
      {quickViewPet && (
        <div className="pet-details-drawer-overlay" onClick={() => setQuickViewPet(null)} style={{ zIndex: 10050 }}>
          <div className="pet-details-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', borderRadius: '20px', zIndex: 10051 }}>
            <div className="pet-drawer-header">
              <h3 className="pet-drawer-title">{quickViewPet.name} Quick Overview</h3>
              <button type="button" className="pet-drawer-close-btn" onClick={() => setQuickViewPet(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '130px', height: '130px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                <PetImage src={quickViewPet.image} imageSettings={quickViewPet.imageSettings} type="card" style={{ height: '100%' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>{quickViewPet.name}</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{quickViewPet.breed} • {quickViewPet.species}</p>
                <div style={{ marginTop: '4px' }}>
                  {quickViewPet.activeStatus === 'FOR_SALE' ? (
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#10B981' }}>
                      {quickViewPet.price ? `${quickViewPet.price.toLocaleString()} PKR` : 'Call for Price'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#EA580C', backgroundColor: '#FFEDD5', padding: '3px 8px', borderRadius: '6px' }}>
                      Free Adoption
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#334155', margin: '4px 0 0 0' }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {quickViewPet.city}, {quickViewPet.province}
                </p>
              </div>
            </div>

            <div className="pet-card-rows-list" style={{ marginBottom: '20px' }}>
              <div className="pet-row-item">
                <span className="pet-row-label">Age</span>
                <span className="pet-row-val">{quickViewPet.age}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Gender</span>
                <span className="pet-row-val">{quickViewPet.gender}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Vaccination</span>
                <span className="pet-row-val">{quickViewPet.isVaccinated ? 'Vaccinated' : 'Not Vaccinated'}</span>
              </div>
            </div>

            <div className="pet-modal-actions">
              <button type="button" className="pet-modal-btn-cancel" onClick={() => setQuickViewPet(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
