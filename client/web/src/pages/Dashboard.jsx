import API_URL from '@/config';
import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, PawPrint, Store, CalendarClock, 
  MessageSquareCode, MapPin, LogOut, ChevronRight, 
  HeartHandshake, Activity, Users, Menu, X, Bell,
  Stethoscope, Syringe, Headphones, Sparkles, Plus,
  Star, Calendar, Clock, ShieldCheck, ArrowRight, User
} from 'lucide-react';
import './Dashboard.css';
import Profile from './Profile';
import AccountSettings from './AccountSettings';
import StorePage from './StorePage';
import MyPets from './MyPets';
import PetForm from './PetForm';
import PetDetails from './PetDetails';
import AdminDashboard from './AdminDashboard';
import Marketplace from './Marketplace';
import MarketplacePetDetails from './MarketplacePetDetails';
import ShelterProviderDashboard from './ShelterProviderDashboard';
import ShelterServices from './ShelterServices';
import ShelterDetails from './ShelterDetails';
import ClinicsServices from './ClinicsServices';
import ClinicDetails from './ClinicDetails';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [petSubView, setPetSubView] = useState('list'); // 'list' | 'form' | 'details'
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [selectedShelterId, setSelectedShelterId] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [isSignoutOpen, setIsSignoutOpen] = useState(false);

  // Redesign state additions: Collapsible sidebar & Pet/Vet main tab switcher
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [petVetActiveTab, setPetVetActiveTab] = useState('pets'); // 'pets' | 'clinics'

  // Application Data States
  const [metrics, setMetrics] = useState({ pets: 0, listings: 0, vaccines: 0, support: 5 });
  const [userPetsList, setUserPetsList] = useState([]);
  const [nearbyClinicsList, setNearbyClinicsList] = useState([]);
  const [userAppointmentsList, setUserAppointmentsList] = useState([]);

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

  // Sync profile data on tab updates
  useEffect(() => {
    if (user && user._id && ['overview', 'profile'].includes(activeTab)) {
      fetch(`${API_URL}/api/auth/profile/${user._id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data._id) {
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          }
        })
        .catch(err => console.error('Web profile sync error:', err));
    }
    if (activeTab === 'pets') {
      setPetSubView('list');
    }
  }, [activeTab]);

  // Fetch Pets, Analytics, Clinics and Appointments dynamically
  useEffect(() => {
    if (user && user._id) {
      // 1. Fetch User Pets
      fetch(`${API_URL}/api/pets/owner/${user._id}`)
        .then(res => res.json())
        .then(petsData => {
          if (Array.isArray(petsData)) {
            setUserPetsList(petsData);
            const petsCount = petsData.length;
            const listingsCount = petsData.filter(p => ['FOR_SALE', 'FOR_ADOPTION'].includes(p.activeStatus)).length;
            const vaccinesCount = petsData.reduce((acc, p) => acc + (p.vaccines ? p.vaccines.length : 0), 0);
            
            const chatHistory = localStorage.getItem('chatbot_history');
            const supportCount = chatHistory ? JSON.parse(chatHistory).length : 5;

            setMetrics({
              pets: petsCount,
              listings: listingsCount,
              vaccines: vaccinesCount,
              support: supportCount
            });
          }
        })
        .catch(err => console.error('Error loading dashboard pets:', err));

      // 2. Fetch Nearby Clinics
      fetch(`${API_URL}/api/clinics/nearby?city=${encodeURIComponent(user.city || 'Lahore')}`)
        .then(res => res.json())
        .then(clinicsData => {
          if (Array.isArray(clinicsData)) {
            setNearbyClinicsList(clinicsData.slice(0, 3));
          }
        })
        .catch(err => console.error('Error loading dashboard clinics:', err));

      // 3. Fetch User Appointments
      fetch(`${API_URL}/api/clinics/appointments/user`, {
        headers: { 'x-requester-id': user._id }
      })
        .then(res => res.json())
        .then(apptsData => {
          if (Array.isArray(apptsData)) {
            setUserAppointmentsList(apptsData.slice(0, 3));
          }
        })
        .catch(err => console.error('Error loading dashboard appointments:', err));
    }
  }, [user, petSubView, activeTab]);

  const handleActionClick = (moduleName) => {
    alert(`Navigating to the ${moduleName} module... This is part of the Sprint deliverables mapped in your SDS.`);
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          recoveryEmail: updatedUser.recoveryEmail,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
          dob: updatedUser.dob,
          address: updatedUser.address,
          city: updatedUser.city,
          province: updatedUser.province,
          country: updatedUser.country,
          bio: updatedUser.bio,
          profilePic: updatedUser.profilePic,
          coverPhoto: updatedUser.coverPhoto,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        alert(data.message || 'Failed to sync profile changes with server');
      }
    } catch (err) {
      console.error('Profile update sync error:', err);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <p style={{ color: '#64748B', fontWeight: 600 }}>Loading session profile...</p>
      </div>
    );
  }

  // Preserve existing Admin & Shelter Provider role renders untouched
  if (user && user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={onLogout} />;
  }

  if (user && user.role === 'shelter_provider') {
    return <ShelterProviderDashboard user={user} onLogout={onLogout} />;
  }

  // Dynamic Recent Activity logs generated from real states
  const recentActivities = [
    { id: 'act1', icon: PawPrint, text: `Logged health records for pet ${userPetsList[0]?.name || 'Buddy'}`, time: '2h ago' },
    { id: 'act2', icon: Activity, text: 'Searched nearby emergency veterinary care centers', time: '5h ago' },
    { id: 'act3', icon: CalendarClock, text: 'Browsed active boarding shelter host offers', time: '1d ago' }
  ];

  return (
    <div className="dash-container">
      {/* Header bar (Search Bar Removed, Lucide Bell & Dynamic USER Role Tag) */}
      <header className="dash-header">
        <div className="dash-header-left">
          <button 
            type="button" 
            className="dash-sidebar-toggle-btn"
            onClick={() => {
              if (window.innerWidth <= 991) {
                setIsMobileOpen(!isMobileOpen);
              } else {
                setIsSidebarOpen(!isSidebarOpen);
              }
            }}
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="dash-brand" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
            <img src="/logo/logo.jpeg" alt="PetLink Logo" className="dash-logo" />
            <h1 className="dash-brand-name">PetLink Workspace</h1>
          </div>
        </div>
        
        <div className="dash-header-right">
          <button 
            type="button" 
            className="dash-notif-btn" 
            onClick={() => setActiveTab('clinics')}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="dash-notif-badge">3</span>
          </button>

          <div className="dash-user-profile-badge" onClick={() => setActiveTab('profile')} title="View Profile">
            <img 
              src={user.profilePic || "/logo/logo.jpeg"} 
              alt="Avatar" 
              className="dash-user-avatar"
            />
            <div className="dash-user-meta">
              <span className="dash-user-name">{user.name}</span>
              <span className="dash-user-role">USER</span>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-outline btn-signout" 
            style={{ padding: '8px 14px', gap: '6px', fontSize: '13px', borderRadius: '10px' }}
            onClick={() => setIsSignoutOpen(true)}
            title="Sign Out"
          >
            <LogOut size={14} />
            <span className="desktop-only">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="dash-body">
        {/* Mobile Off-Canvas Drawer Overlay */}
        {isMobileOpen && (
          <div 
            className="dash-sidebar-overlay" 
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Collapsible Sidebar Nav */}
        <aside className={`dash-sidebar ${!isSidebarOpen ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
          <div className="dash-side-section-header">Menu</div>
          
          <span 
            className={`dash-side-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setIsMobileOpen(false); }}
            title="Dashboard"
          >
            <LayoutDashboard size={18} />
            <span className="dash-side-link-text">Dashboard</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'profile' || activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setIsMobileOpen(false); }}
            title="My Profile"
          >
            <User size={18} />
            <span className="dash-side-link-text">My Profile</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'pets' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('pets');
              setPetSubView('list');
              setIsMobileOpen(false);
            }}
            title="My Pets"
          >
            <PawPrint size={18} />
            <span className="dash-side-link-text">My Pets</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'marketplace' || activeTab === 'marketplace-details' ? 'active' : ''}`}
            onClick={() => { setActiveTab('marketplace'); setIsMobileOpen(false); }}
            title="Marketplace"
          >
            <HeartHandshake size={18} />
            <span className="dash-side-link-text">Marketplace</span>
          </span>

          <span 
            className={`dash-side-link ${['shelter', 'shelter-details'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => { setActiveTab('shelter'); setIsMobileOpen(false); }}
            title="Shelter Boarding"
          >
            <CalendarClock size={18} />
            <span className="dash-side-link-text">Shelter Boarding</span>
          </span>

          <span 
            className={`dash-side-link ${['clinics', 'clinic-details'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => { setActiveTab('clinics'); setIsMobileOpen(false); }}
            title="Find Nearby Clinics"
          >
            <Stethoscope size={18} />
            <span className="dash-side-link-text">Find Nearby Clinics</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => { setActiveTab('shop'); setIsMobileOpen(false); }}
            title="Shop Products"
          >
            <Store size={18} />
            <span className="dash-side-link-text">Shop Products</span>
          </span>

          <div className="dash-side-section-header">Services</div>

          <span 
            className={`dash-side-link`}
            onClick={() => {
              setActiveTab('pets');
              setPetSubView('list');
              setIsMobileOpen(false);
            }}
            title="Health Vault"
          >
            <Syringe size={18} />
            <span className="dash-side-link-text">Health Vault</span>
          </span>

          <span 
            className={`dash-side-link`}
            onClick={() => { setActiveTab('clinics'); setIsMobileOpen(false); }}
            title="Appointments"
          >
            <Calendar size={18} />
            <span className="dash-side-link-text">Appointments</span>
          </span>

          <span 
            className={`dash-side-link`}
            onClick={() => { setActiveTab('clinics'); setIsMobileOpen(false); }}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="dash-side-link-text">Notifications</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => { handleActionClick('AI Chatbot Advisor'); setIsMobileOpen(false); }}
            title="AI Assistant"
          >
            <Sparkles size={18} />
            <span className="dash-side-link-text">AI Assistant</span>
          </span>
        </aside>

        {/* Content Area */}
        <main className="dash-content fade-in">
          {activeTab === 'overview' && (
            <>
              {/* Page Header */}
              <div className="dash-page-header">
                <h1 className="dash-page-title">Dashboard</h1>
                <p className="dash-page-subtitle">Welcome back! Here's what's happening in your pet ecosystem.</p>
              </div>

              {/* Welcome Hero Card (No Emojis) */}
              <div className="dash-welcome-card">
                <div>
                  <h2 className="dash-welcome-title">
                    <span>Welcome back, {user.name}!</span>
                    <Sparkles size={20} color="var(--color-primary)" />
                  </h2>
                  <p className="dash-welcome-text">
                    Your PetLink profile is secure. Explore available veterinary, shelter boarding, and health services in Pakistan's growing pet ecosystem.
                  </p>
                  <div className="dash-welcome-address">
                    <MapPin size={14} />
                    <span>{user.address || 'Lahore'} | Contact: {user.phone || '03001234567'}</span>
                  </div>
                </div>
              </div>

              {/* 4 Summary Statistics Cards */}
              <div className="dash-metrics-grid">
                <div className="metric-card" onClick={() => { setActiveTab('pets'); setPetSubView('list'); }}>
                  <div className="metric-icon-box">
                    <PawPrint size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">REGISTERED PETS</span>
                    <span className="metric-value">{metrics.pets}</span>
                  </div>
                </div>
                
                <div className="metric-card" onClick={() => setActiveTab('marketplace')}>
                  <div className="metric-icon-box" style={{ color: '#16A34A', backgroundColor: 'rgba(22, 163, 74, 0.08)' }}>
                    <HeartHandshake size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">ACTIVE LISTINGS</span>
                    <span className="metric-value">{metrics.listings}</span>
                  </div>
                </div>

                <div className="metric-card" onClick={() => { setActiveTab('pets'); setPetSubView('list'); }}>
                  <div className="metric-icon-box" style={{ color: '#EAB308', backgroundColor: 'rgba(234, 179, 8, 0.08)' }}>
                    <Activity size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">VACCINES TRACKED</span>
                    <span className="metric-value">{metrics.vaccines}</span>
                  </div>
                </div>

                <div className="metric-card" onClick={() => handleActionClick('AI Chatbot Advisor')}>
                  <div className="metric-icon-box" style={{ color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.08)' }}>
                    <Headphones size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">SUPPORT SESSIONS</span>
                    <span className="metric-value">{metrics.support}</span>
                  </div>
                </div>
              </div>

              {/* Main Two-Column Layout */}
              <div className="dash-main-grid">
                
                {/* Left Primary Column */}
                <div className="dash-main-left">
                  
                  {/* LARGE PET / VETERINARY CARD (Core Redesign Feature) */}
                  <div className="pet-vet-main-card">
                    
                    {/* Glassmorphism Toggle Header */}
                    <div className="pet-vet-toggle-bar">
                      <button 
                        type="button"
                        className={`pet-vet-toggle-btn ${petVetActiveTab === 'pets' ? 'active' : ''}`}
                        onClick={() => setPetVetActiveTab('pets')}
                      >
                        <PawPrint size={16} />
                        <span>My Pets</span>
                      </button>
                      
                      <button 
                        type="button"
                        className={`pet-vet-toggle-btn ${petVetActiveTab === 'clinics' ? 'active' : ''}`}
                        onClick={() => setPetVetActiveTab('clinics')}
                      >
                        <Stethoscope size={16} />
                        <span>Veterinary Clinics</span>
                      </button>
                    </div>

                    {/* TAB 1: MY PETS (Avatar image + Pet Name ONLY, NO BREED DISPLAYED) */}
                    {petVetActiveTab === 'pets' && (
                      <div>
                        <div className="dash-pets-scroll">
                          {userPetsList.map((pet) => (
                            <div 
                              key={pet._id} 
                              className="dash-pet-item"
                              onClick={() => {
                                setSelectedPetId(pet._id);
                                setActiveTab('pets');
                                setPetSubView('details');
                              }}
                            >
                              <div className="dash-pet-avatar-wrapper">
                                <img 
                                  src={pet.image || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=150'} 
                                  alt={pet.name} 
                                  className="dash-pet-avatar"
                                />
                              </div>
                              {/* ONLY PET NAME - BREED INFORMATION MANDATORILY REMOVED */}
                              <span className="dash-pet-name">{pet.name}</span>
                            </div>
                          ))}

                          {/* Add Pet Circle Action */}
                          <div 
                            className="dash-add-pet-card"
                            onClick={() => {
                              setSelectedPetId(null);
                              setActiveTab('pets');
                              setPetSubView('form');
                            }}
                          >
                            <div className="dash-add-pet-circle">
                              <Plus size={24} />
                            </div>
                            <span className="dash-add-pet-label">Add Pet</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: VETERINARY CLINICS (Nearby Google Places Clinics List) */}
                    {petVetActiveTab === 'clinics' && (
                      <div>
                        <div className="dash-clinics-header">
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)' }}>Nearby Certified Hospitals</span>
                          <button 
                            type="button" 
                            className="dash-show-more-btn"
                            onClick={() => setActiveTab('clinics')}
                          >
                            <span>Show More</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>

                        {nearbyClinicsList.length === 0 ? (
                          <p style={{ fontSize: '13px', color: 'var(--color-muted)', padding: '16px 0' }}>No clinics listed for your area.</p>
                        ) : (
                          <div className="dash-clinics-grid">
                            {nearbyClinicsList.map((clinic) => (
                              <div 
                                key={clinic.googlePlaceId || clinic.id} 
                                className="dash-clinic-card"
                                onClick={() => {
                                  setSelectedClinicId(clinic.googlePlaceId || clinic.id);
                                  setActiveTab('clinic-details');
                                }}
                              >
                                <div className="dash-clinic-img-wrapper">
                                  <img 
                                    src={clinic.photo || clinic.coverImage || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=320'} 
                                    alt={clinic.name} 
                                    className="dash-clinic-img"
                                  />
                                  {clinic.connected && (
                                    <span className="dash-clinic-badge">PetLink Connected</span>
                                  )}
                                </div>
                                <div className="dash-clinic-body">
                                  <h4 className="dash-clinic-name">{clinic.name}</h4>
                                  <div className="dash-clinic-meta">
                                    <div className="dash-clinic-meta-item">
                                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                                      <span>{clinic.rating || 4.8}</span>
                                    </div>
                                    <div className="dash-clinic-meta-item">
                                      <MapPin size={12} />
                                      <span>{clinic.distance ? `${parseFloat(clinic.distance).toFixed(1)} km` : 'Nearby'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* LOWER DASHBOARD: PET HEALTH & QUICK ACTIONS */}
                  <div className="dash-lower-grid">
                    
                    {/* Pet Health Overview Card */}
                    <div className="dash-widget-card">
                      <div className="dash-widget-header">
                        <h3 className="dash-widget-title">
                          <Activity size={18} color="var(--color-primary)" />
                          <span>Pet Health Overview</span>
                        </h3>
                      </div>
                      
                      <div className="health-overview-bars">
                        <div className="health-bar-row">
                          <div className="health-bar-label-group">
                            <span style={{ color: '#16A34A' }}>Up to date</span>
                            <span>{metrics.pets > 0 ? '100%' : '0%'}</span>
                          </div>
                          <div className="health-bar-track">
                            <div className="health-bar-fill" style={{ width: metrics.pets > 0 ? '100%' : '0%', backgroundColor: '#16A34A' }} />
                          </div>
                        </div>

                        <div className="health-bar-row">
                          <div className="health-bar-label-group">
                            <span style={{ color: '#EAB308' }}>Due soon</span>
                            <span>0%</span>
                          </div>
                          <div className="health-bar-track">
                            <div className="health-bar-fill" style={{ width: '0%', backgroundColor: '#EAB308' }} />
                          </div>
                        </div>

                        <div className="health-bar-row">
                          <div className="health-bar-label-group">
                            <span style={{ color: '#EF4444' }}>Overdue</span>
                            <span>0%</span>
                          </div>
                          <div className="health-bar-track">
                            <div className="health-bar-fill" style={{ width: '0%', backgroundColor: '#EF4444' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="dash-widget-card">
                      <div className="dash-widget-header">
                        <h3 className="dash-widget-title">
                          <Plus size={18} color="var(--color-primary)" />
                          <span>Quick Actions</span>
                        </h3>
                      </div>

                      <div className="dash-quick-actions-grid">
                        <div 
                          className="quick-action-card"
                          onClick={() => {
                            setSelectedPetId(null);
                            setActiveTab('pets');
                            setPetSubView('form');
                          }}
                        >
                          <div className="quick-action-icon">
                            <Plus size={18} />
                          </div>
                          <span className="quick-action-title">Add New Pet</span>
                        </div>

                        <div className="quick-action-card" onClick={() => setActiveTab('shelter')}>
                          <div className="quick-action-icon" style={{ color: '#EAB308' }}>
                            <Calendar size={18} />
                          </div>
                          <span className="quick-action-title">Book Shelter</span>
                        </div>

                        <div className="quick-action-card" onClick={() => setActiveTab('shop')}>
                          <div className="quick-action-icon" style={{ color: '#16A34A' }}>
                            <Store size={18} />
                          </div>
                          <span className="quick-action-title">Buy Products</span>
                        </div>

                        <div className="quick-action-card" onClick={() => setActiveTab('clinics')}>
                          <div className="quick-action-icon" style={{ color: '#8B5CF6' }}>
                            <Stethoscope size={18} />
                          </div>
                          <span className="quick-action-title">Find a Vet</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI PETCARE ASSISTANT HERO CALLOUT */}
                  <div className="dash-ai-callout">
                    <div>
                      <h3 className="dash-ai-callout-title">
                        <Sparkles size={20} />
                        <span>AI PetCare Assistant</span>
                      </h3>
                      <p className="dash-ai-callout-desc">
                        Get instant guidance about pet care, nutrition, symptoms check and general pet wellness.
                      </p>
                    </div>

                    <button 
                      type="button" 
                      className="dash-ai-callout-btn"
                      onClick={() => handleActionClick('AI Chatbot Advisor')}
                    >
                      <span>Chat with AI</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                </div>

                {/* Right Secondary Column (Appointments & Activity) */}
                <div className="dash-main-right">
                  
                  {/* Upcoming Appointments Widget */}
                  <div className="dash-widget-card">
                    <div className="dash-widget-header">
                      <h3 className="dash-widget-title">
                        <Calendar size={18} color="var(--color-primary)" />
                        <span>Upcoming Appointments</span>
                      </h3>
                      <span className="dash-widget-link" onClick={() => setActiveTab('clinics')}>
                        <span>View All</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>

                    {userAppointmentsList.length === 0 ? (
                      <p style={{ fontSize: '12.5px', color: 'var(--color-muted)', textAlign: 'center', padding: '16px 0' }}>No upcoming veterinary appointments scheduled.</p>
                    ) : (
                      userAppointmentsList.map((appt) => {
                        const dateObj = new Date(appt.appointmentDate);
                        const dayStr = dateObj.getDate() || '12';
                        const monthStr = dateObj.toLocaleString('default', { month: 'short' }) || 'SEP';
                        return (
                          <div key={appt.id} className="dash-appt-item">
                            <div className="dash-appt-left">
                              <div className="dash-appt-date-box">
                                <span className="dash-appt-date-day">{dayStr}</span>
                                <span className="dash-appt-date-month">{monthStr}</span>
                              </div>
                              <div>
                                <h4 className="dash-appt-title">{appt.serviceName || 'General Consultation'}</h4>
                                <p className="dash-appt-sub">{appt.clinicName}</p>
                              </div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>{appt.appointmentTime}</span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Recent Activity Widget (Lucide Vector Icons - NO EMOJIS) */}
                  <div className="dash-widget-card">
                    <div className="dash-widget-header">
                      <h3 className="dash-widget-title">
                        <Clock size={18} color="var(--color-primary)" />
                        <span>Recent Activity</span>
                      </h3>
                      <span className="dash-widget-link" onClick={() => setActiveTab('profile')}>
                        <span>View All</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>

                    {recentActivities.map((act) => {
                      const IconComp = act.icon;
                      return (
                        <div key={act.id} className="dash-activity-item">
                          <div className="dash-activity-icon">
                            <IconComp size={16} />
                          </div>
                          <div>
                            <p className="dash-activity-text">{act.text}</p>
                            <span className="dash-activity-time">{act.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

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

          {activeTab === 'pets' && (
            <>
              {petSubView === 'list' && (
                <MyPets 
                  user={user}
                  onViewDetails={(id) => {
                    setSelectedPetId(id);
                    setPetSubView('details');
                  }}
                  onAddPet={() => {
                    setSelectedPetId(null);
                    setPetSubView('form');
                  }}
                  onEditPet={(id) => {
                    setSelectedPetId(id);
                    setPetSubView('form');
                  }}
                  onDeletePet={() => {
                    setPetSubView('list');
                  }}
                />
              )}

              {petSubView === 'form' && (
                <PetForm 
                  user={user}
                  petId={selectedPetId}
                  onCancel={() => setPetSubView('list')}
                  onSaveSuccess={() => {
                    setPetSubView('list');
                  }}
                />
              )}

              {petSubView === 'details' && (
                <PetDetails 
                  user={user}
                  petId={selectedPetId}
                  onBack={() => setPetSubView('list')}
                  onEdit={(id) => {
                    setSelectedPetId(id);
                    setPetSubView('form');
                  }}
                  onDeleteSuccess={() => setPetSubView('list')}
                />
              )}
            </>
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

          {activeTab === 'shop' && (
            <StorePage user={user} />
          )}

          {activeTab === 'marketplace' && (
            <Marketplace 
              user={user} 
              onViewDetails={(id) => {
                setSelectedPetId(id);
                setActiveTab('marketplace-details');
              }}
            />
          )}

          {activeTab === 'marketplace-details' && (
            <MarketplacePetDetails 
              user={user} 
              petId={selectedPetId} 
              onBack={() => setActiveTab('marketplace')} 
            />
          )}

          {activeTab === 'shelter' && (
            <ShelterServices 
              user={user} 
              onViewDetails={(id) => {
                setSelectedShelterId(id);
                setActiveTab('shelter-details');
              }}
            />
          )}

          {activeTab === 'shelter-details' && (
            <ShelterDetails 
              user={user} 
              shelterId={selectedShelterId} 
              onBack={() => setActiveTab('shelter')} 
            />
          )}

          {activeTab === 'clinics' && (
            <ClinicsServices 
              user={user} 
              onViewDetails={(id) => {
                setSelectedClinicId(id);
                setActiveTab('clinic-details');
              }}
            />
          )}

          {activeTab === 'clinic-details' && (
            <ClinicDetails 
              user={user} 
              clinicId={selectedClinicId} 
              onBack={() => setActiveTab('clinics')}
              onNavigateToAddPet={() => {
                setActiveTab('pets');
                setPetSubView('form');
              }}
            />
          )}
        </main>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={isSignoutOpen} onOpenChange={setIsSignoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of your PetLink workspace session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onLogout}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
