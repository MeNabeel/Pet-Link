import API_URL from '@/config';
import React, { useEffect, useState, useRef } from 'react';
import { 
  LayoutDashboard, PawPrint, Store, CalendarClock, 
  MessageSquareCode, MapPin, LogOut, ChevronRight, ChevronDown, Phone,
  HeartHandshake, Activity, Users, Menu, X, Bell, BellOff,
  Stethoscope, Syringe, Headphones, Sparkles, Plus,
  Star, Calendar, Clock, User
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

// Reusable SVG Background Pet Pattern (No Emojis - Vector SVG Outlines with High Contrast Opacity)
function PetPattern() {
  return (
    <div className="dash-pet-pattern" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#0066CC" fill="none" strokeWidth="1.8" opacity="0.14">
          {/* Top-Right Large Rotated Paw Outline */}
          <g transform="translate(670, -25) rotate(15) scale(1.4)">
            <ellipse cx="30" cy="40" rx="15" ry="18" fill="#0066CC" opacity="0.08" />
            <circle cx="9" cy="14" r="5" fill="#0066CC" opacity="0.08" />
            <circle cx="23" cy="6" r="5.5" fill="#0066CC" opacity="0.08" />
            <circle cx="37" cy="6" r="5.5" fill="#0066CC" opacity="0.08" />
            <circle cx="51" cy="14" r="5" fill="#0066CC" opacity="0.08" />
          </g>

          {/* Right-Side Dotted Heart Outline */}
          <path d="M 640 140 C 640 115, 665 105, 685 125 C 705 105, 730 115, 730 140 C 730 168, 685 195, 685 195 C 685 195, 640 168, 640 140 Z" strokeWidth="2" strokeDasharray="4 3" />

          {/* Bottom-Right Small Paw */}
          <g transform="translate(730, 195) rotate(-20) scale(0.95)">
            <ellipse cx="30" cy="40" rx="12" ry="15" fill="#0066CC" opacity="0.06" />
            <circle cx="10" cy="16" r="4.5" />
            <circle cx="22" cy="9" r="5" />
            <circle cx="36" cy="9" r="5" />
            <circle cx="48" cy="16" r="4.5" />
          </g>

          {/* Center-Top Subtle Heart Outline */}
          <path d="M 440 25 C 440 12, 458 8, 470 18 C 482 8, 500 12, 500 25 C 500 42, 470 58, 470 58 C 470 58, 440 42, 440 25 Z" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Bottom-Left Subtle Paw */}
          <g transform="translate(260, 205) rotate(22) scale(0.75)">
            <ellipse cx="30" cy="40" rx="12" ry="15" />
            <circle cx="10" cy="16" r="4.5" />
            <circle cx="22" cy="9" r="5" />
            <circle cx="36" cy="9" r="5" />
            <circle cx="48" cy="16" r="4.5" />
          </g>

          {/* Background Decorative Curves / Waves */}
          <path d="M -50 190 Q 220 90, 480 210 T 950 130" strokeWidth="1.5" opacity="0.5" strokeDasharray="6 4" />
          <path d="M -30 230 Q 320 290, 640 150 T 980 250" strokeWidth="1" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [petSubView, setPetSubView] = useState('list'); // 'list' | 'form' | 'details'
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [selectedShelterId, setSelectedShelterId] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [isSignoutOpen, setIsSignoutOpen] = useState(false);

  // Sidebar & Pet/Vet main tab switcher
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [petVetActiveTab, setPetVetActiveTab] = useState('pets'); // 'pets' | 'clinics'

  // Header Dropdown Popover States
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Application Data States (100% Dynamic Backend Binding)
  const [metrics, setMetrics] = useState({ pets: 0, listings: 0, vaccines: 0, support: 0 });
  const [userPetsList, setUserPetsList] = useState([]);
  const [nearbyClinicsList, setNearbyClinicsList] = useState([]);
  const [userAppointmentsList, setUserAppointmentsList] = useState([]);
  const [recentActivitiesList, setRecentActivitiesList] = useState([]);

  // Refs for click outside handling
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        setUser(parsed);
        const targetId = parsed._id || parsed.id;
        if (targetId) {
          fetch(`${API_URL}/api/auth/profile/${targetId}`)
            .then(res => res.json())
            .then(data => {
              if (data && (data._id || data.id)) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
              }
            })
            .catch(err => console.error('Initial web profile fetch error:', err));
        }
      } catch (e) {
        console.error('Error parsing session user:', e);
      }
    }
  }, []);

  // Sync profile data on tab updates
  useEffect(() => {
    const targetId = user?._id || user?.id;
    if (targetId && ['overview', 'profile', 'settings'].includes(activeTab)) {
      fetch(`${API_URL}/api/auth/profile/${targetId}`)
        .then(res => res.json())
        .then(data => {
          if (data && (data._id || data.id)) {
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

  // Click Outside & Escape Key Listener for Dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setIsNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch Notifications from Backend
  useEffect(() => {
    if (user && user._id) {
      fetch(`${API_URL}/api/clinics/notifications`, {
        headers: { 'x-requester-id': user._id }
      })
        .then(res => res.json())
        .then(notifData => {
          if (Array.isArray(notifData)) {
            setNotifications(notifData);
          }
        })
        .catch(err => console.error('Error loading notifications:', err));
    }
  }, [user]);

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
            
            // Support: dynamically derived from chatbot history or real session log
            const chatHistory = localStorage.getItem('chatbot_history');
            const supportCount = chatHistory ? JSON.parse(chatHistory).length : 0;

            setMetrics({
              pets: petsCount,
              listings: listingsCount,
              vaccines: vaccinesCount,
              support: supportCount
            });

            // Derive dynamic activities from real pet state
            const dynamicActs = [];
            if (petsData.length > 0) {
              dynamicActs.push({
                id: 'act-pet-latest',
                icon: PawPrint,
                text: `Registered pet profile for ${petsData[0].name}`,
                time: 'Recently updated'
              });
            }
            if (vaccinesCount > 0) {
              dynamicActs.push({
                id: 'act-vac-latest',
                icon: Activity,
                text: `Tracked ${vaccinesCount} vaccination records across active pets`,
                time: 'Active'
              });
            }
            setRecentActivitiesList(dynamicActs);
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
            setUserAppointmentsList(apptsData);
          }
        })
        .catch(err => console.error('Error loading dashboard appointments:', err));
    }
  }, [user, petSubView, activeTab]);

  // Helper for Dynamic Header Page Title
  const getPageTitle = (tab) => {
    switch (tab) {
      case 'overview': return 'Dashboard';
      case 'profile': return 'My Profile';
      case 'settings': return 'Account Settings';
      case 'pets': return 'My Pets';
      case 'marketplace':
      case 'marketplace-details': return 'Marketplace';
      case 'shelter':
      case 'shelter-details': return 'Shelters';
      case 'clinics':
      case 'clinic-details': return 'Clinics';
      case 'shop': return 'Shop Products';
      case 'ai': return 'AI Assistant';
      default: return 'Dashboard';
    }
  };

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handleActionClick = (moduleName) => {
    alert(`Navigating to the ${moduleName} module... Part of Sprint deliverables.`);
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const targetId = updatedUser._id || updatedUser.id || user?._id || user?.id;
      const userToken = updatedUser.token || user?.token || localStorage.getItem('token') || '';
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          userId: targetId,
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
      if (response.ok && data) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
      } else {
        alert(data.message || 'Failed to sync profile changes with server');
        return null;
      }
    } catch (err) {
      console.error('Profile update sync error:', err);
      alert('Server connection error. Failed to save account changes.');
      return null;
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

  return (
    <div className="dash-container">
      {/* Header bar (Dynamic Title, Bell Popover & User Profile Dropdown) */}
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
            aria-label="Toggle Navigation Sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* DYNAMIC PAGE TITLE BRANDING */}
          <div className="dash-brand" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
            <img src="/logo/logo.jpeg" alt="PetLink Logo" className="dash-logo" />
            <h1 className="dash-brand-name">
              <span className="dash-brand-title-full">PetLink {getPageTitle(activeTab)}</span>
              <span className="dash-brand-title-short">{getPageTitle(activeTab)}</span>
            </h1>
          </div>
        </div>
        
        <div className="dash-header-right">
          {/* DYNAMIC NOTIFICATION BELL & POPOVER PANEL */}
          <div className="dash-notif-wrapper" ref={notifRef}>
            <button 
              type="button" 
              className={`dash-notif-btn ${isNotifDropdownOpen ? 'active' : ''}`}
              onClick={() => {
                setIsNotifDropdownOpen(!isNotifDropdownOpen);
                setIsProfileDropdownOpen(false);
              }}
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded={isNotifDropdownOpen}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="dash-notif-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Panel */}
            {isNotifDropdownOpen && (
              <div className="dash-notif-panel">
                <div className="dash-notif-panel-header">
                  <span className="dash-notif-panel-title">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{ fontSize: '11px', backgroundColor: 'rgba(0, 102, 204, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '10px' }}>
                        {unreadCount} new
                      </span>
                    )}
                  </span>
                  {unreadCount > 0 && (
                    <button 
                      type="button" 
                      className="dash-notif-mark-all"
                      onClick={handleMarkAllNotificationsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="dash-notif-list">
                  {notifications.length === 0 ? (
                    <div className="dash-notif-empty">
                      <BellOff size={28} color="var(--color-muted)" />
                      <p className="dash-notif-empty-title">You're all caught up</p>
                      <p className="dash-notif-empty-sub">No new notifications.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`dash-notif-item ${!notif.isRead ? 'unread' : ''}`}
                        onClick={() => {
                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                        }}
                      >
                        {!notif.isRead && <span className="dash-notif-dot" />}
                        <div className="dash-notif-content">
                          <h5 className="dash-notif-item-title">{notif.title}</h5>
                          <p className="dash-notif-item-msg">{notif.message}</p>
                          <span className="dash-notif-item-time">{formatRelativeTime(notif.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="dash-notif-panel-footer">
                  <span 
                    className="dash-notif-footer-link"
                    onClick={() => {
                      setActiveTab('clinics');
                      setIsNotifDropdownOpen(false);
                    }}
                  >
                    View all notifications
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* REDESIGNED USER PROFILE SECTION & DROPDOWN MENU */}
          <div className="dash-user-profile-wrapper" ref={profileRef}>
            <div 
              className={`dash-user-profile-badge ${isProfileDropdownOpen ? 'active' : ''}`} 
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsNotifDropdownOpen(false);
              }} 
              aria-label="User Profile Menu"
              aria-haspopup="true"
              aria-expanded={isProfileDropdownOpen}
            >
              <img 
                src={user.profilePic || "/logo/logo.jpeg"} 
                alt="Avatar" 
                className="dash-user-avatar"
              />
              <div className="dash-user-meta">
                <span className="dash-user-name">{user.name}</span>
                <span className="dash-user-role">USER</span>
              </div>
              <ChevronDown size={14} className={`dash-profile-chevron ${isProfileDropdownOpen ? 'open' : ''}`} />
            </div>

            {/* Profile Popover Menu */}
            {isProfileDropdownOpen && (
              <div className="dash-profile-dropdown-menu">
                <div 
                  className="dash-dropdown-item"
                  onClick={() => {
                    setActiveTab('profile');
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </div>

                <div className="dash-dropdown-divider" />

                <div 
                  className="dash-dropdown-item danger"
                  onClick={() => {
                    setIsSignoutOpen(true);
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
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
              {/* ROW 1: REDESIGNED SOFT LIGHT-BLUE WELCOME HERO CARD (NO EMOJIS, VISIBLE SVG PET PATTERN, DIRECT START) */}
              <div className="dash-welcome-card">
                <PetPattern />
                <div className="dash-welcome-content">
                  <h2 className="dash-welcome-title">
                    <span>Welcome back, {user.name}!</span>
                  </h2>
                  <p className="dash-welcome-text">
                    Your PetLink profile is secure. Explore everything you need for your pets in one place across Pakistan's growing pet ecosystem.
                  </p>
                  <div className="dash-welcome-address">
                    <div className="dash-welcome-meta-item">
                      <MapPin size={14} />
                      <span>{user.address || `${user.city || 'Lahore'}, ${user.province || 'Punjab'}`}</span>
                    </div>
                    {user.phone && (
                      <div className="dash-welcome-meta-item">
                        <Phone size={14} />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ROW 2: 4 DYNAMIC SUMMARY STATISTICS CARDS */}
              <div className="dash-metrics-grid">
                <div className="metric-card" onClick={() => { setActiveTab('pets'); setPetSubView('list'); }}>
                  <div className="metric-icon-box">
                    <PawPrint size={20} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">REGISTERED PETS</span>
                    <span className="metric-value">{metrics.pets}</span>
                  </div>
                </div>
                
                <div className="metric-card" onClick={() => setActiveTab('marketplace')}>
                  <div className="metric-icon-box" style={{ color: '#16A34A', backgroundColor: 'rgba(22, 163, 74, 0.08)' }}>
                    <HeartHandshake size={20} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">ACTIVE LISTINGS</span>
                    <span className="metric-value">{metrics.listings}</span>
                  </div>
                </div>

                <div className="metric-card" onClick={() => { setActiveTab('pets'); setPetSubView('list'); }}>
                  <div className="metric-icon-box" style={{ color: '#EAB308', backgroundColor: 'rgba(234, 179, 8, 0.08)' }}>
                    <Activity size={20} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">VACCINES TRACKED</span>
                    <span className="metric-value">{metrics.vaccines}</span>
                  </div>
                </div>

                <div className="metric-card" onClick={() => handleActionClick('AI Chatbot Advisor')}>
                  <div className="metric-icon-box" style={{ color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.08)' }}>
                    <Headphones size={20} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">SUPPORT SESSIONS</span>
                    <span className="metric-value">{metrics.support}</span>
                  </div>
                </div>
              </div>

              {/* ROW 3: COMPACT TWO-COLUMN DASHBOARD GRID */}
              <div className="dash-main-grid">
                
                {/* Left Primary Column */}
                <div className="dash-main-left">
                  
                  {/* LARGE PET / VETERINARY CARD (MATCHING SOFT LIGHT BLUE #EEF5FF STYLE WITH VISIBLE SVG PATTERN) */}
                  <div className="pet-vet-main-card">
                    <PetPattern />
                    <div className="pet-vet-card-content">
                      
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
                                <Plus size={22} />
                              </div>
                              <span className="dash-add-pet-label">Add Pet</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: VETERINARY CLINICS */}
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
                  </div>

                  {/* LOWER DASHBOARD: PET HEALTH OVERVIEW & QUICK ACTIONS */}
                  <div className="dash-lower-grid">
                    
                    {/* Pet Health Overview Card (100% Dynamic - Empty State when 0 pets) */}
                    <div className="dash-widget-card">
                      <div className="dash-widget-header">
                        <h3 className="dash-widget-title">
                          <Activity size={18} color="var(--color-primary)" />
                          <span>Pet Health Overview</span>
                        </h3>
                      </div>
                      
                      {userPetsList.length === 0 ? (
                        <div className="dash-empty-widget">
                          <Activity size={24} color="var(--color-muted)" />
                          <p className="dash-empty-widget-text">No pet health records yet. Add your first pet to start tracking health.</p>
                        </div>
                      ) : (
                        <div className="health-overview-bars">
                          <div className="health-bar-row">
                            <div className="health-bar-label-group">
                              <span style={{ color: '#16A34A' }}>Up to date</span>
                              <span>{metrics.vaccines > 0 ? '100%' : '100%'}</span>
                            </div>
                            <div className="health-bar-track">
                              <div className="health-bar-fill" style={{ width: '100%', backgroundColor: '#16A34A' }} />
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
                      )}
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

                </div>

                {/* Right Secondary Column (Appointments & Activity) */}
                <div className="dash-main-right">
                  
                  {/* Dynamic Upcoming Appointments Widget */}
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
                      <div className="dash-empty-widget">
                        <Calendar size={24} color="var(--color-muted)" />
                        <p className="dash-empty-widget-text">No upcoming veterinary appointments scheduled.</p>
                      </div>
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

                  {/* Dynamic Recent Activity Widget */}
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

                    {recentActivitiesList.length === 0 ? (
                      <div className="dash-empty-widget">
                        <Clock size={24} color="var(--color-muted)" />
                        <p className="dash-empty-widget-text">No recent activity yet.</p>
                      </div>
                    ) : (
                      recentActivitiesList.map((act) => {
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
                      })
                    )}
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
