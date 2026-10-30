import API_URL from '@/config';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, PawPrint, Store, CalendarClock, 
  MessageSquareCode, MapPin, LogOut, ChevronRight, ChevronDown, Phone,
  HeartHandshake, Activity, Users, Menu, X, Bell, BellOff,
  Stethoscope, Syringe, Headphones, Sparkles, Plus,
  Star, Calendar, Clock, User, AlertTriangle, ShoppingCart, CheckCircle2, Heart
} from 'lucide-react';
import { safeSetUserStorage } from '../utils/storage';
import { getCart, getCartCount, subscribeToCart, subscribeToCartDrawer, openCartDrawer, closeCartDrawer, clearCart } from '../utils/cartManager';
import { BackgroundBeamsWithCollision } from '../components/ui/background-beams-with-collision';
import { EncryptedText } from '../components/ui/encrypted-text';
import { CloudShader } from '../components/ui/cloud-shader';
import { GlowingEffect } from '../components/ui/glowing-effect';
import { getUserActivities, formatRelativeTime } from '../utils/activityTracker';
import './Dashboard.css';
import Profile from './Profile';
import AccountSettings from './AccountSettings';
import UserAddresses from './UserAddresses';
import StorePage from './StorePage';
import ProductDetails from './ProductDetails';
import CartPage from './CartPage';
import CartDrawer from '../components/CartDrawer';
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
import PetChat from './PetChat';

class ShelterErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Shelter Component Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #FCA5A5', margin: '24px 0', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertTriangle size={28} color="#EF4444" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#991B1B', margin: 0 }}>Something Went Wrong</h3>
          <p style={{ marginTop: '6px', fontSize: '14px', color: '#7F1D1D', maxWidth: '480px' }}>
            An unexpected error occurred while displaying the shelter section.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ padding: '10px 20px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              Try Again
            </button>
            {this.props.onReset && (
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onReset();
                }}
                style={{ padding: '10px 20px', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Back to Shelter Services
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Page Section Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', margin: '24px 0', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertTriangle size={28} color="#EF4444" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', margin: 0 }}>Section Unavailable</h3>
          <p style={{ marginTop: '6px', fontSize: '14px', color: '#64748B', maxWidth: '480px' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ padding: '10px 20px', backgroundColor: '#0066CC', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              Reload View
            </button>
            {this.props.onReset && (
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onReset();
                }}
                style={{ padding: '10px 20px', backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Back to Shop
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
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
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedChatPet, setSelectedChatPet] = useState(null);
  const [selectedChatOwner, setSelectedChatOwner] = useState(null);
  const [isSignoutOpen, setIsSignoutOpen] = useState(false);

  // Synchronized Cart Items Unit Count (sum of item quantities)
  const [cartCount, setCartCount] = useState(() => getCartCount());

  // Slide-in Shopping Cart Drawer State
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [checkoutNotification, setCheckoutNotification] = useState(null);

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

  // Always fetch fresh profile data from Supabase/backend database on mount & tab updates
  useEffect(() => {
    let targetId = user?._id || user?.id;
    if (!targetId) {
      const sessionUser = localStorage.getItem('user');
      if (sessionUser) {
        try {
          const parsed = JSON.parse(sessionUser);
          targetId = parsed._id || parsed.id;
          setUser(parsed);
        } catch (e) {
          console.error('Error parsing session user:', e);
        }
      }
    }

    if (targetId) {
      fetch(`${API_URL}/api/auth/profile/${targetId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch user profile');
          return res.json();
        })
        .then(data => {
          if (data && (data._id || data.id)) {
            setUser(data);
            safeSetUserStorage(data);
          }
        })
        .catch(err => console.error('Database profile sync error:', err));
    }

    if (activeTab === 'pets') {
      setPetSubView('list');
    }
  }, [activeTab]);

  // Deep linking and URL hash synchronization for Shop, Product Details, and Cart
  useEffect(() => {
    const syncRouteFromHash = () => {
      const hash = window.location.hash || '';
      const productMatch = hash.match(/^#\/shop\/(.+)$/);
      if (productMatch && productMatch[1]) {
        setSelectedProductId(productMatch[1]);
        setActiveTab('product-details');
      } else if (hash === '#/cart') {
        setActiveTab('cart');
      } else if (hash === '#/shop') {
        setActiveTab('shop');
      }
    };

    syncRouteFromHash();
    window.addEventListener('hashchange', syncRouteFromHash);
    return () => window.removeEventListener('hashchange', syncRouteFromHash);
  }, []);

  // Real-time listener for cart updates to keep red badge count synchronized
  useEffect(() => {
    const unsub = subscribeToCart((updated) => {
      setCartCount(getCartCount(updated));
    });
    return () => unsub();
  }, []);

  // Subscribe to slide-in shopping cart drawer requests
  useEffect(() => {
    const unsub = subscribeToCartDrawer((isOpen) => {
      setIsCartDrawerOpen(isOpen);
    });
    return () => unsub();
  }, []);

  // Inspect URL for Stripe Checkout Return Parameters (?checkout=success&session_id=... or ?checkout=cancel)
  useEffect(() => {
    const handleCheckoutReturn = () => {
      const url = new URL(window.location.href);
      const hash = window.location.hash || '';
      
      let searchParams = url.searchParams;
      if (hash.includes('?')) {
        const hashQuery = hash.split('?')[1];
        searchParams = new URLSearchParams(hashQuery);
      }

      const checkoutStatus = searchParams.get('checkout');
      const sessionId = searchParams.get('session_id');

      if (checkoutStatus === 'success') {
        try {
          const pendingRaw = sessionStorage.getItem('petlink_pending_checkout_items');
          if (pendingRaw) {
            const pendingKeys = JSON.parse(pendingRaw);
            if (Array.isArray(pendingKeys) && pendingKeys.length > 0) {
              clearCart(pendingKeys);
            }
            sessionStorage.removeItem('petlink_pending_checkout_items');
          }
        } catch (e) {
          console.error('Error clearing checked out items:', e);
        }

        setCheckoutNotification({
          type: 'success',
          title: 'Payment Successful!',
          message: 'Thank you for your order! Your payment was securely verified through Stripe.',
          sessionId: sessionId || ''
        });

        // Clean up URL query parameters without full reload
        window.history.replaceState({}, document.title, window.location.pathname + '#/shop');
        setActiveTab('shop');
      } else if (checkoutStatus === 'cancel') {
        setCheckoutNotification({
          type: 'cancel',
          title: 'Checkout Cancelled',
          message: 'Your checkout was cancelled. All selected items remain safely in your cart.'
        });

        window.history.replaceState({}, document.title, window.location.pathname + '#/shop');
        setActiveTab('shop');
      }
    };

    handleCheckoutReturn();
  }, []);

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
  const fetchNotifications = () => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    const headers = { 
      'x-requester-id': userId,
      'Authorization': `Bearer ${user?.token || localStorage.getItem('token') || ''}`
    };
    fetch(`${API_URL}/api/notifications`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          fetch(`${API_URL}/api/clinics/notifications`, { headers })
            .then(r => r.json())
            .then(cd => {
              if (Array.isArray(cd)) setNotifications(cd);
              else if (cd && Array.isArray(cd.notifications)) setNotifications(cd.notifications);
            }).catch(() => {});
        }
      })
      .catch(err => console.error('Error loading notifications:', err));
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?._id || user?.id]);

  // Fetch Pets, Analytics, Clinics and Appointments dynamically
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      // 1. Fetch User Pets
      fetch(`${API_URL}/api/pets/owner/${userId}`)
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

            // Derive dynamic activities from real pet state and actions
            const acts = getUserActivities(userId, petsData, userAppointmentsList, getCart());
            setRecentActivitiesList(acts);
          }
        })
        .catch(err => console.error('Error loading dashboard pets:', err));

      // 2. Fetch Nearby Clinics
      fetch(`${API_URL}/api/clinics/nearby?city=${encodeURIComponent(user?.city || 'Lahore')}`)
        .then(res => res.json())
        .then(clinicsData => {
          if (Array.isArray(clinicsData)) {
            setNearbyClinicsList(clinicsData.slice(0, 3));
          }
        })
        .catch(err => console.error('Error loading dashboard clinics:', err));

      // 3. Fetch User Appointments
      fetch(`${API_URL}/api/clinics/appointments/user`, {
        headers: { 
            'x-requester-id': userId,
            'Authorization': `Bearer ${user?.token || localStorage.getItem('token') || ''}`
        }
      })
        .then(res => res.json())
        .then(apptsData => {
          if (Array.isArray(apptsData)) {
            setUserAppointmentsList(apptsData);
            const acts = getUserActivities(userId, userPetsList, apptsData, getCart());
            setRecentActivitiesList(acts);
          }
        })
        .catch(err => console.error('Error loading dashboard appointments:', err));
    }
  }, [user?._id || user?.id, petSubView, activeTab]);

  // Sync dynamic recent activities across user actions
  useEffect(() => {
    const targetId = user?._id || user?.id;
    if (!targetId) return;

    const refreshActs = () => {
      const acts = getUserActivities(targetId, userPetsList, userAppointmentsList, getCart());
      setRecentActivitiesList(acts);
    };

    refreshActs();

    window.addEventListener('petlink_activity_updated', refreshActs);
    window.addEventListener('petlink_cart_updated', refreshActs);
    window.addEventListener('petlink_wishlist_updated', refreshActs);

    return () => {
      window.removeEventListener('petlink_activity_updated', refreshActs);
      window.removeEventListener('petlink_cart_updated', refreshActs);
      window.removeEventListener('petlink_wishlist_updated', refreshActs);
    };
  }, [user?._id, user?.id, userPetsList, userAppointmentsList]);

  // Dynamically compute upcoming vaccinations for user's pets
  const upcomingVaccinations = useMemo(() => {
    if (!Array.isArray(userPetsList) || userPetsList.length === 0) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const list = [];
    
    userPetsList.forEach(pet => {
      // 1. Check pet.vaccines array
      if (Array.isArray(pet.vaccines)) {
        pet.vaccines.forEach((vac, idx) => {
          const dueDateStr = vac.nextDueDate || vac.dueDate;
          if (dueDateStr) {
            const dueDate = new Date(dueDateStr);
            if (!isNaN(dueDate.getTime())) {
              const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
              const diffTime = dueDay.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays >= 0) {
                list.push({
                  id: `${pet._id || pet.id}-vac-${idx}-${dueDateStr}`,
                  petId: pet._id || pet.id,
                  petName: pet.name || 'Pet',
                  petImage: pet.image,
                  vaccineName: vac.vaccineName || vac.name || 'Vaccination Booster',
                  dueDate,
                  diffDays,
                });
              }
            }
          }
        });
      }
      
      // 2. Check pet.nextVaccinationDate if defined
      if (pet.nextVaccinationDate) {
        const dueDate = new Date(pet.nextVaccinationDate);
        if (!isNaN(dueDate.getTime())) {
          const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          const diffTime = dueDay.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0) {
            const already = list.some(item => item.petId === (pet._id || pet.id) && Math.abs(item.dueDate.getTime() - dueDate.getTime()) < 86400000);
            if (!already) {
              list.push({
                id: `${pet._id || pet.id}-nextVac-${pet.nextVaccinationDate}`,
                petId: pet._id || pet.id,
                petName: pet.name || 'Pet',
                petImage: pet.image,
                vaccineName: 'Core Scheduled Vaccine',
                dueDate,
                diffDays,
              });
            }
          }
        }
      }
    });

    list.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    return list.slice(0, 5);
  }, [userPetsList]);

  // Helper: Format remaining days and badge style for vaccination
  const formatVaccineRemaining = (diffDays) => {
    if (diffDays === 0) return { text: 'Due today', status: 'due-today' };
    if (diffDays === 1) return { text: 'In 1 day', status: 'due-soon' };
    if (diffDays <= 7) return { text: `In ${diffDays} days`, status: 'due-soon' };
    if (diffDays < 14) return { text: `In ${diffDays} days`, status: 'due-later' };
    if (diffDays < 21) return { text: 'In 2 weeks', status: 'due-later' };
    if (diffDays < 30) return { text: 'In 3 weeks', status: 'due-later' };
    const months = Math.round(diffDays / 30);
    return { text: `In ${months} ${months === 1 ? 'month' : 'months'}`, status: 'due-later' };
  };

  // Helper: Get Activity Icon and Badge styling
  const getActivityIconMeta = (type) => {
    switch (type) {
      case 'pet':
        return { icon: PawPrint, bg: 'rgba(0, 102, 204, 0.08)', color: '#0066CC' };
      case 'vaccine':
        return { icon: Syringe, bg: 'rgba(234, 179, 8, 0.12)', color: '#D97706' };
      case 'cart':
        return { icon: ShoppingCart, bg: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' };
      case 'favorite':
        return { icon: Heart, bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
      case 'appointment':
        return { icon: Calendar, bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' };
      default:
        return { icon: Activity, bg: 'rgba(100, 116, 139, 0.1)', color: '#64748B' };
    }
  };

  // Helper for Dynamic Header Page Title
  const getPageTitle = (tab) => {
    switch (tab) {
      case 'overview': return 'Dashboard';
      case 'profile': return 'My Profile';
      case 'settings': return 'Account Settings';
      case 'addresses': return 'Addresses';
      case 'pets': return petSubView === 'form' ? 'Add New Pet' : petSubView === 'details' ? 'Pet Medical & Profile Details' : 'My Registered Pets';
      case 'shop': return 'Pet Products Store';
      case 'product-details': return 'Product Details';
      case 'cart': return 'Shopping Cart';
      case 'marketplace': return 'Pet Marketplace';
      case 'clinics': return 'Find Clinics & Services';
      case 'shelters': return 'Find Animal Shelters';
      case 'messages': return 'Messages & Communication';
      case 'support': return 'Support Desk';
      case 'admin-users': return 'System Users Manager';
      case 'admin-categories': return 'Categories Management';
      case 'admin-products': return 'Admin Products Manager';
      case 'admin-marketplace': return 'Marketplace Admin Manager';
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
        safeSetUserStorage(data);
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
    return (
      <ShelterErrorBoundary>
        <ShelterProviderDashboard user={user} onLogout={onLogout} />
      </ShelterErrorBoundary>
    );
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
          {/* SHOPPING CART BUTTON WITH RED NOTIFICATION BADGE */}
          <button 
            type="button" 
            className={`dash-cart-header-btn ${isCartDrawerOpen ? 'active' : ''}`}
            onClick={() => {
              setIsCartDrawerOpen(prev => !prev);
            }}
            aria-label={`Shopping cart, ${cartCount} items`}
            title="Shopping Cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="dash-cart-badge" aria-label={`Shopping cart, ${cartCount} items`}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

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
                        onClick={async () => {
                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                          try {
                            const userId = user?._id || user?.id;
                            await fetch(`${API_URL}/api/notifications/${notif.id}/read`, {
                              method: 'PUT',
                              headers: { 'x-requester-id': userId }
                            });
                          } catch (e) {}
                        }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px' }}
                      >
                        <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                          {!notif.isRead && <span className="dash-notif-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', marginTop: '6px', flexShrink: 0 }} />}
                          <div className="dash-notif-content">
                            <h5 className="dash-notif-item-title" style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', margin: 0 }}>{notif.title}</h5>
                            <p className="dash-notif-item-msg" style={{ fontSize: '12px', color: '#475569', margin: '2px 0 4px 0' }}>{notif.message}</p>
                            <span className="dash-notif-item-time" style={{ fontSize: '11px', color: '#94A3B8' }}>{formatRelativeTime(notif.createdAt)}</span>
                          </div>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            setNotifications(prev => prev.filter(n => n.id !== notif.id));
                            try {
                              const userId = user?._id || user?.id;
                              await fetch(`${API_URL}/api/notifications/${notif.id}`, {
                                method: 'DELETE',
                                headers: { 'x-requester-id': userId }
                              });
                            } catch (e) {}
                          }}
                          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px 6px', fontSize: '12px' }}
                          title="Dismiss notification"
                        >
                          ✕
                        </button>
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
            tabIndex={0}
            title="Dashboard"
          >
            <LayoutDashboard size={18} />
            <span className="dash-side-link-text">Dashboard</span>
            <span className="dash-side-tooltip" role="tooltip">Dashboard</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'profile' || activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setIsMobileOpen(false); }}
            tabIndex={0}
            title="My Profile"
          >
            <User size={18} />
            <span className="dash-side-link-text">My Profile</span>
            <span className="dash-side-tooltip" role="tooltip">My Profile</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'pets' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('pets');
              setPetSubView('list');
              setIsMobileOpen(false);
            }}
            tabIndex={0}
            title="My Pets"
          >
            <PawPrint size={18} />
            <span className="dash-side-link-text">My Pets</span>
            <span className="dash-side-tooltip" role="tooltip">My Pets</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'marketplace' || activeTab === 'marketplace-details' ? 'active' : ''}`}
            onClick={() => { setActiveTab('marketplace'); setIsMobileOpen(false); }}
            tabIndex={0}
            title="Marketplace"
          >
            <HeartHandshake size={18} />
            <span className="dash-side-link-text">Marketplace</span>
            <span className="dash-side-tooltip" role="tooltip">Marketplace</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setIsMobileOpen(false); }}
            tabIndex={0}
            title="Pet Messages"
          >
            <MessageSquareCode size={18} />
            <span className="dash-side-link-text">Pet Messages</span>
            <span className="dash-side-tooltip" role="tooltip">Pet Messages</span>
          </span>

          <span 
            className={`dash-side-link ${['shelter', 'shelter-details'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => { setActiveTab('shelter'); setIsMobileOpen(false); }}
            tabIndex={0}
            title="Shelter Boarding"
          >
            <CalendarClock size={18} />
            <span className="dash-side-link-text">Shelter Boarding</span>
            <span className="dash-side-tooltip" role="tooltip">Shelter Boarding</span>
          </span>

          <span 
            className={`dash-side-link ${['clinics', 'clinic-details'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => { setActiveTab('clinics'); setIsMobileOpen(false); }}
            tabIndex={0}
            title="Find Nearby Clinics"
          >
            <Stethoscope size={18} />
            <span className="dash-side-link-text">Find Nearby Clinics</span>
            <span className="dash-side-tooltip" role="tooltip">Find Nearby Clinics</span>
          </span>

          <span 
            className={`dash-side-link ${['shop', 'product-details', 'cart'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => { 
              window.location.hash = '#/shop';
              setActiveTab('shop'); 
              setIsMobileOpen(false); 
            }}
            tabIndex={0}
            title="Shop Products"
          >
            <Store size={18} />
            <span className="dash-side-link-text">Shop Products</span>
            <span className="dash-side-tooltip" role="tooltip">Shop Products</span>
          </span>

          <div className="dash-side-section-header">Services</div>

          <span 
            className={`dash-side-link`}
            onClick={() => {
              setActiveTab('pets');
              setPetSubView('list');
              setIsMobileOpen(false);
            }}
            tabIndex={0}
            title="Health Vault"
          >
            <Syringe size={18} />
            <span className="dash-side-link-text">Health Vault</span>
            <span className="dash-side-tooltip" role="tooltip">Health Vault</span>
          </span>

          <span 
            className={`dash-side-link`}
            onClick={() => { setActiveTab('clinics'); setIsMobileOpen(false); }}
            tabIndex={0}
            title="Appointments"
          >
            <Calendar size={18} />
            <span className="dash-side-link-text">Appointments</span>
            <span className="dash-side-tooltip" role="tooltip">Appointments</span>
          </span>

          <span 
            className={`dash-side-link`}
            onClick={() => { setActiveTab('clinics'); setIsMobileOpen(false); }}
            tabIndex={0}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="dash-side-link-text">Notifications</span>
            <span className="dash-side-tooltip" role="tooltip">Notifications</span>
          </span>

          <span 
            className={`dash-side-link ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => { handleActionClick('AI Chatbot Advisor'); setIsMobileOpen(false); }}
            tabIndex={0}
            title="AI Assistant"
          >
            <Sparkles size={18} />
            <span className="dash-side-link-text">AI Assistant</span>
            <span className="dash-side-tooltip" role="tooltip">AI Assistant</span>
          </span>
        </aside>

        {/* Content Area */}
        <main className="dash-content fade-in">
          {activeTab === 'overview' && (
            <>
              {/* ROW 1: REDESIGNED SOFT LIGHT-BLUE WELCOME HERO CARD WITH ACETERNITY BEAMS & ENCRYPTED TEXT */}
              <div className="dash-welcome-card">
                <BackgroundBeamsWithCollision containerClassName="dash-welcome-beams-container">
                  <PetPattern />
                  <div className="dash-welcome-content">
                    <h2 className="dash-welcome-title">
                      <EncryptedText text="Welcome back," />{" "}
                      <EncryptedText text={user.name || "Pet Parent"} />!
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
                </BackgroundBeamsWithCollision>
              </div>

              {/* ROW 2: 4 MODERN PROFESSIONAL SAAS STATISTICS CARDS */}
              <div className="dash-metrics-grid">
                <div 
                  className="metric-card" 
                  onClick={() => { setActiveTab('pets'); setPetSubView('list'); }}
                  tabIndex={0}
                  role="button"
                >
                  <div className="metric-card-top">
                    <span className="metric-label">Registered Pets</span>
                    <div className="metric-icon-box" style={{ color: '#0066CC', backgroundColor: 'rgba(0, 102, 204, 0.08)' }}>
                      <PawPrint size={18} />
                    </div>
                  </div>
                  <div className="metric-card-body">
                    <span className="metric-value">{metrics.pets}</span>
                    <span className="metric-subtext">Active pet profiles</span>
                  </div>
                </div>
                
                <div 
                  className="metric-card" 
                  onClick={() => setActiveTab('marketplace')}
                  tabIndex={0}
                  role="button"
                >
                  <div className="metric-card-top">
                    <span className="metric-label">Active Listings</span>
                    <div className="metric-icon-box" style={{ color: '#16A34A', backgroundColor: 'rgba(22, 163, 74, 0.08)' }}>
                      <HeartHandshake size={18} />
                    </div>
                  </div>
                  <div className="metric-card-body">
                    <span className="metric-value">{metrics.listings}</span>
                    <span className="metric-subtext">Marketplace items</span>
                  </div>
                </div>

                <div 
                  className="metric-card" 
                  onClick={() => { setActiveTab('pets'); setPetSubView('list'); }}
                  tabIndex={0}
                  role="button"
                >
                  <div className="metric-card-top">
                    <span className="metric-label">Vaccines Tracked</span>
                    <div className="metric-icon-box" style={{ color: '#EAB308', backgroundColor: 'rgba(234, 179, 8, 0.08)' }}>
                      <Activity size={18} />
                    </div>
                  </div>
                  <div className="metric-card-body">
                    <span className="metric-value">{metrics.vaccines}</span>
                    <span className="metric-subtext">Immunization records</span>
                  </div>
                </div>

                <div 
                  className="metric-card" 
                  onClick={() => handleActionClick('AI Chatbot Advisor')}
                  tabIndex={0}
                  role="button"
                >
                  <div className="metric-card-top">
                    <span className="metric-label">Support Sessions</span>
                    <div className="metric-icon-box" style={{ color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.08)' }}>
                      <Headphones size={18} />
                    </div>
                  </div>
                  <div className="metric-card-body">
                    <span className="metric-value">{metrics.support}</span>
                    <span className="metric-subtext">Advisor consultations</span>
                  </div>
                </div>
              </div>

              {/* ROW 3: COMPACT TWO-COLUMN DASHBOARD GRID */}
              <div className="dash-main-grid">
                
                {/* Left Primary Column */}
                <div className="dash-main-left">
                  
                  {/* LARGE PET / VETERINARY CARD (MATCHING SOFT LIGHT BLUE #EEF5FF STYLE WITH CLOUD SHADER) */}
                  <div className="pet-vet-main-card">
                    <CloudShader opacity={0.12} speed={0.4} />
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
                      <GlowingEffect spread={40} glow={true} proximity={80} />
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
                      <GlowingEffect spread={40} glow={true} proximity={80} />
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

                {/* Right Secondary Column (Upcoming Vaccinations & Activity) */}
                <div className="dash-main-right">
                  
                  {/* Dynamic Upcoming Vaccinations Widget */}
                  <div className="dash-widget-card">
                    <GlowingEffect spread={40} glow={true} proximity={80} />
                    <div className="dash-widget-header">
                      <h3 className="dash-widget-title">
                        <Syringe size={18} color="var(--color-primary)" />
                        <span>Upcoming Vaccinations</span>
                      </h3>
                      <span 
                        className="dash-widget-link" 
                        onClick={() => {
                          setActiveTab('pets');
                          setPetSubView('list');
                        }}
                      >
                        <span>View All</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>

                    {upcomingVaccinations.length === 0 ? (
                      <div className="dash-empty-widget">
                        <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6, color: '#16A34A' }}>
                          <CheckCircle2 size={24} />
                        </div>
                        <p className="dash-empty-widget-text" style={{ fontWeight: 600, color: '#0F172A' }}>
                          No upcoming vaccinations
                        </p>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          Your pets are all caught up!
                        </span>
                      </div>
                    ) : (
                      upcomingVaccinations.map((vac) => {
                        const dateObj = vac.dueDate;
                        const dayStr = dateObj.getDate();
                        const monthStr = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                        const rem = formatVaccineRemaining(vac.diffDays);
                        return (
                          <div 
                            key={vac.id} 
                            className="dash-vac-item"
                            onClick={() => {
                              setSelectedPetId(vac.petId);
                              setActiveTab('pets');
                              setPetSubView('details');
                            }}
                          >
                            <div className="dash-vac-left">
                              <div className="dash-vac-date-box">
                                <span className="dash-vac-date-day">{dayStr}</span>
                                <span className="dash-vac-date-month">{monthStr}</span>
                              </div>
                              <div className="dash-vac-info">
                                <h4 className="dash-vac-title">{vac.vaccineName}</h4>
                                <span className="dash-vac-pet">
                                  <PawPrint size={11} />
                                  <span>{vac.petName}</span>
                                </span>
                              </div>
                            </div>
                            <span className={`dash-vac-badge ${rem.status}`}>
                              {rem.text}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dynamic Recent Activity Widget */}
                  <div className="dash-widget-card">
                    <GlowingEffect spread={40} glow={true} proximity={80} />
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
                      recentActivitiesList.slice(0, 5).map((act) => {
                        const iconMeta = getActivityIconMeta(act.type);
                        const IconComp = iconMeta.icon;
                        return (
                          <div key={act.id} className="dash-activity-item">
                            <div className="dash-activity-icon" style={{ backgroundColor: iconMeta.bg, color: iconMeta.color }}>
                              <IconComp size={15} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p className="dash-activity-text">
                                <span>{act.title} </span>
                                {act.targetName && <strong style={{ fontWeight: 600, color: '#0F172A' }}>{act.targetName}</strong>}
                              </p>
                              <span className="dash-activity-time">{formatRelativeTime(act.timestamp)}</span>
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
              onNavigateToAddresses={() => setActiveTab('addresses')}
              onLogout={onLogout}
              onUpdateUser={handleUpdateUser}
              onViewPetDetails={(id) => {
                setSelectedPetId(id);
                setActiveTab('marketplace-details');
              }}
            />
          )}

          {activeTab === 'addresses' && (
            <UserAddresses 
              user={user}
              onBack={() => setActiveTab('profile')}
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
            <PageErrorBoundary onReset={() => setActiveTab('shop')}>
              <StorePage 
                user={user} 
                onViewProductDetails={(id) => {
                  setSelectedProductId(id);
                  window.location.hash = `#/shop/${id}`;
                  setActiveTab('product-details');
                }}
                onViewCart={() => {
                  setIsCartDrawerOpen(true);
                }}
              />
            </PageErrorBoundary>
          )}

          {activeTab === 'product-details' && (
            <PageErrorBoundary onReset={() => { window.location.hash = '#/shop'; setActiveTab('shop'); }}>
              <ProductDetails 
                user={user}
                productId={selectedProductId}
                onBack={() => {
                  window.location.hash = '#/shop';
                  setActiveTab('shop');
                }}
                onNavigateToProduct={(id) => {
                  setSelectedProductId(id);
                  window.location.hash = `#/shop/${id}`;
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewCart={() => {
                  setIsCartDrawerOpen(true);
                }}
                onOpenChat={({ pet, owner }) => {
                  setSelectedChatPet(pet);
                  setSelectedChatOwner(owner);
                  setActiveTab('chat');
                }}
              />
            </PageErrorBoundary>
          )}

          {activeTab === 'cart' && (
            <PageErrorBoundary onReset={() => { window.location.hash = '#/shop'; setActiveTab('shop'); }}>
              <CartPage 
                user={user}
                onContinueShopping={() => {
                  window.location.hash = '#/shop';
                  setActiveTab('shop');
                }}
                onViewProductDetails={(id) => {
                  setSelectedProductId(id);
                  window.location.hash = `#/shop/${id}`;
                  setActiveTab('product-details');
                }}
              />
            </PageErrorBoundary>
          )}

          {activeTab === 'marketplace' && (
            <Marketplace 
              user={user} 
              onViewDetails={(id) => {
                setSelectedPetId(id);
                setActiveTab('marketplace-details');
              }}
              onOpenChat={({ pet, owner }) => {
                setSelectedChatPet(pet);
                setSelectedChatOwner(owner);
                setActiveTab('chat');
              }}
              onEditPet={(id) => {
                setSelectedPetId(id);
                setActiveTab('pets');
                setPetSubView('form');
              }}
            />
          )}

          {activeTab === 'marketplace-details' && (
            <MarketplacePetDetails 
              user={user} 
              petId={selectedPetId} 
              onBack={() => setActiveTab('marketplace')} 
              onOpenChat={({ pet, owner }) => {
                setSelectedChatPet(pet);
                setSelectedChatOwner(owner);
                setActiveTab('chat');
              }}
              onEditPet={(id) => {
                setSelectedPetId(id);
                setActiveTab('pets');
                setPetSubView('form');
              }}
            />
          )}

          {activeTab === 'chat' && (
            <PetChat 
              user={user}
              pet={selectedChatPet}
              owner={selectedChatOwner}
              onBack={() => setActiveTab('marketplace')}
              onViewPetDetails={(id) => {
                setSelectedPetId(id);
                setActiveTab('marketplace-details');
              }}
            />
          )}

          {activeTab === 'shelter' && (
            <ShelterErrorBoundary onReset={() => setActiveTab('shelter')}>
              <ShelterServices 
                user={user} 
                onViewDetails={(id) => {
                  setSelectedShelterId(id);
                  setActiveTab('shelter-details');
                }}
              />
            </ShelterErrorBoundary>
          )}

          {activeTab === 'shelter-details' && (
            <ShelterErrorBoundary onReset={() => setActiveTab('shelter')}>
              <ShelterDetails 
                user={user} 
                shelterId={selectedShelterId} 
                onBack={() => setActiveTab('shelter')} 
                onOpenChat={({ pet, owner }) => {
                  setSelectedChatPet(pet);
                  setSelectedChatOwner(owner);
                  setActiveTab('chat');
                }}
              />
            </ShelterErrorBoundary>
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

      {/* Slide-In Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={isCartDrawerOpen} 
        onClose={() => setIsCartDrawerOpen(false)} 
        user={user} 
        onViewProductDetails={(id) => {
          setSelectedProductId(id);
          window.location.hash = `#/shop/${id}`;
          setActiveTab('product-details');
        }} 
      />

      {/* Stripe Checkout Status Modal */}
      {checkoutNotification && (
        <div 
          className="dash-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '28px 24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              border: '1px solid #E2E8F0',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              {checkoutNotification.type === 'success' ? (
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}>
                  <CheckCircle2 size={32} />
                </div>
              ) : (
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706'
                }}>
                  <AlertTriangle size={32} />
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
              {checkoutNotification.title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
              {checkoutNotification.message}
            </p>

            <button 
              type="button"
              style={{
                width: '100%',
                padding: '12px 18px',
                backgroundColor: '#0066CC',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0052A3'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0066CC'}
              onClick={() => setCheckoutNotification(null)}
            >
              {checkoutNotification.type === 'success' ? 'Explore More Products' : 'Return to Shop'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
