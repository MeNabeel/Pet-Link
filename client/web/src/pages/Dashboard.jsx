import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, PawPrint, Store, CalendarClock, 
  MessageSquareCode, MapPin, LogOut, ChevronRight, 
  HeartHandshake, Activity, Users 
} from 'lucide-react';
import './Dashboard.css';
import Profile from './Profile';
import AccountSettings from './AccountSettings';

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser);
      setUser({
        ...parsed,
        username: parsed.username || parsed.email.split('@')[0],
        recoveryEmail: parsed.recoveryEmail || 'recovery@petlink.com',
        gender: parsed.gender || 'male',
        dob: parsed.dob || '1998-05-12',
        city: parsed.city || 'Lahore',
        province: parsed.province || 'Punjab',
        country: parsed.country || 'Pakistan',
        bio: parsed.bio || 'Pet lover and active supporter of shelters.',
        createdAt: parsed.createdAt || new Date().toISOString()
      });
    }
  }, []);

  const handleActionClick = (moduleName) => {
    alert(`Navigating to the ${moduleName} module... This is part of the Sprint deliverables mapped in your SDS.`);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading session profile...</p>
      </div>
    );
  }

  // Role display formatter
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
    <div className="dash-container">
      {/* Header bar */}
      <header className="dash-header">
        <div className="dash-brand" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
          <img src="/logo/logo.jpeg" alt="PetLink Logo" className="dash-logo" />
          <h1 className="dash-brand-name">PetLink Workspace</h1>
        </div>
        
        <div className="dash-user-nav">
          <div className="dash-profile-badge" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
            <img 
              src={user.profilePic || "/logo/logo.jpeg"} 
              alt="Avatar" 
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', marginRight: '6px' }} 
            />
            <span className="dash-profile-name">{user.name}</span>
            <span className="dash-profile-role">{formatRole(user.role)}</span>
          </div>
          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', gap: '6px', fontSize: '13px' }}
            onClick={onLogout}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="dash-body">
        {/* Sidebar Nav */}
        <aside className="dash-sidebar">
          <span 
            className={`dash-side-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </span>
          <span 
            className={`dash-side-link ${activeTab === 'profile' || activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Users size={18} />
            My Profile
          </span>
          <span 
            className={`dash-side-link ${activeTab === 'pets' ? 'active' : ''}`}
            onClick={() => handleActionClick('Pet Profile')}
          >
            <PawPrint size={18} />
            My Pets
          </span>
          <span 
            className={`dash-side-link ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => handleActionClick('Marketplace Feed')}
          >
            <HeartHandshake size={18} />
            Marketplace
          </span>
          <span 
            className={`dash-side-link ${activeTab === 'shelter' ? 'active' : ''}`}
            onClick={() => handleActionClick('Shelter Boarding')}
          >
            <CalendarClock size={18} />
            Shelter Booking
          </span>
          <span 
            className={`dash-side-link ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => handleActionClick('E-Commerce Shop')}
          >
            <Store size={18} />
            Shop Products
          </span>
          <span 
            className={`dash-side-link ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => handleActionClick('AI Chatbot Advisor')}
          >
            <MessageSquareCode size={18} />
            AI Assistant
          </span>
        </aside>

        {/* Content Area */}
        <main className="dash-content fade-in">
          {activeTab === 'overview' && (
            <>
              {/* Welcome Card */}
              <div className="dash-welcome-card">
                <div>
                  <h2 className="dash-welcome-title">Welcome back, {user.name}!</h2>
                  <p className="dash-welcome-text">
                    Your PetLink profile is secure. Explore available services in Pakistan's growing pet ecosystem.
                  </p>
                  <div className="dash-welcome-address">
                    <MapPin size={14} />
                    <span>{user.address} | Contact: {user.phone}</span>
                  </div>
                </div>
              </div>

              {/* System Metrics Grid */}
              <div className="dash-metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon-box">
                    <PawPrint size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Registered Pets</span>
                    <span className="metric-value">2</span>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon-box" style={{ color: '#16A34A', backgroundColor: 'rgba(22, 163, 74, 0.08)' }}>
                    <HeartHandshake size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Active Listings</span>
                    <span className="metric-value">3</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-box" style={{ color: '#EAB308', backgroundColor: 'rgba(234, 179, 8, 0.08)' }}>
                    <Activity size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Vaccines Tracked</span>
                    <span className="metric-value">1</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-box" style={{ color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.08)' }}>
                    <Users size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Support Sessions</span>
                    <span className="metric-value">12</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Title */}
              <h3 className="dash-actions-title">PetLink Active Modules</h3>

              {/* Quick Actions Grid */}
              <div className="dash-actions-grid">
                <div className="action-card" onClick={() => handleActionClick('Pet Profile Manager')}>
                  <PawPrint size={26} color="var(--color-primary)" />
                  <h4 className="action-title">Manage Pet Profiles</h4>
                  <p className="action-desc">
                    Log vaccines, update weights, and export health records seamlessly.
                  </p>
                </div>

                <div className="action-card" onClick={() => handleActionClick('Marketplace Lister')}>
                  <HeartHandshake size={26} color="#16A34A" />
                  <h4 className="action-title">Adoption & Marketplace</h4>
                  <p className="action-desc">
                    Buy, sell, or adopt verified pets locally inside Pakistan.
                  </p>
                </div>

                <div className="action-card" onClick={() => handleActionClick('Shelter Bookings Board')}>
                  <CalendarClock size={26} color="#EAB308" />
                  <h4 className="action-title">Temporary Shelter Board</h4>
                  <p className="action-desc">
                    Secure temporary boarding services while you travel.
                  </p>
                </div>

                <div className="action-card" onClick={() => handleActionClick('AI Diagnostic Chatbot')}>
                  <MessageSquareCode size={26} color="#8B5CF6" />
                  <h4 className="action-title">AI PetCare Assistant</h4>
                  <p className="action-desc">
                    Ask our AI chatbot for immediate guidance on pet care and nutrition.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <Profile 
              user={user}
              onNavigateToSettings={() => setActiveTab('settings')}
              onLogout={onLogout}
              onUpdateUser={handleUpdateUser}
            />
          )}

          {activeTab === 'settings' && (
            <AccountSettings 
              user={user}
              onSave={(updated) => {
                handleUpdateUser(updated);
                setActiveTab('profile');
              }}
              onCancel={() => setActiveTab('profile')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
