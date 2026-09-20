import API_URL from '@/config';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Home, MapPin, ClipboardList, Calendar, 
  MessageSquare, Star, Settings, Plus, Sparkles, Check, 
  AlertCircle, X, ChevronRight, ChevronDown, User, PawPrint, Truck, 
  DollarSign, Clock, ShieldCheck, Heart, AlertTriangle, LayoutDashboard,
  CalendarDays, Bell, BellOff, LogOut, Menu, CheckCircle2, Activity
} from 'lucide-react';
import './ShelterProviderDashboard.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';

// Internal Error Boundary to prevent any blank white screens
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Shelter Provider Dashboard Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', margin: '24px auto', maxWidth: '600px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <AlertTriangle size={28} color="#EF4444" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>Shelter Dashboard Error</h3>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px' }}>{this.state.error?.message || 'An unexpected rendering error occurred.'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })} 
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#0066CC', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Reusable SVG Background Pet Pattern (Matching User Dashboard)
function PetPattern() {
  return (
    <div className="dash-pet-pattern" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#0066CC" fill="none" strokeWidth="1.8" opacity="0.14">
          <g transform="translate(670, -25) rotate(15) scale(1.4)">
            <ellipse cx="30" cy="40" rx="15" ry="18" fill="#0066CC" opacity="0.08" />
            <circle cx="9" cy="14" r="5" fill="#0066CC" opacity="0.08" />
            <circle cx="23" cy="6" r="5.5" fill="#0066CC" opacity="0.08" />
            <circle cx="37" cy="6" r="5.5" fill="#0066CC" opacity="0.08" />
            <circle cx="51" cy="14" r="5" fill="#0066CC" opacity="0.08" />
          </g>
          <path d="M 640 140 C 640 115, 665 105, 685 125 C 705 105, 730 115, 730 140 C 730 168, 685 195, 685 195 C 685 195, 640 168, 640 140 Z" strokeWidth="2" strokeDasharray="4 3" />
          <g transform="translate(730, 195) rotate(-20) scale(0.95)">
            <ellipse cx="30" cy="40" rx="12" ry="15" fill="#0066CC" opacity="0.06" />
            <circle cx="10" cy="16" r="4.5" />
            <circle cx="22" cy="9" r="5" />
            <circle cx="36" cy="9" r="5" />
            <circle cx="48" cy="16" r="4.5" />
          </g>
          <path d="M 440 25 C 440 12, 458 8, 470 18 C 482 8, 500 12, 500 25 C 500 42, 470 58, 470 58 C 470 58, 440 42, 440 25 Z" strokeWidth="1.5" strokeDasharray="3 2" />
          <g transform="translate(260, 205) rotate(22) scale(0.75)">
            <ellipse cx="30" cy="40" rx="12" ry="15" />
            <circle cx="10" cy="16" r="4.5" />
            <circle cx="22" cy="9" r="5" />
            <circle cx="36" cy="9" r="5" />
            <circle cx="48" cy="16" r="4.5" />
          </g>
          <path d="M -50 190 Q 220 90, 480 210 T 950 130" strokeWidth="1.5" opacity="0.5" strokeDasharray="6 4" />
          <path d="M -30 230 Q 320 290, 640 150 T 980 250" strokeWidth="1" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}

function ShelterProviderContent({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('overview');
  const [isEditingSetup, setIsEditingSetup] = useState(false);

  // Layout UI navigation & dropdown popover states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isSignoutOpen, setIsSignoutOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Stepper state for profile creation / editing
  const [stepperStep, setStepperStep] = useState(1);
  const [shelterName, setShelterName] = useState('');
  const [nameAvailable, setNameAvailable] = useState(null);
  const [checkingName, setCheckingName] = useState(false);
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [area, setArea] = useState('');
  const [shelterTypes, setShelterTypes] = useState([]);
  const [acceptedSpecies, setAcceptedSpecies] = useState([]);
  const [acceptedBreeds, setAcceptedBreeds] = useState([]);
  const [capacity, setCapacity] = useState(10);
  const [facilities, setFacilities] = useState([]);
  const [providesPickup, setProvidesPickup] = useState(false);
  const [pickupServiceType, setPickupServiceType] = useState('None');
  const [pickupRadius, setPickupRadius] = useState(15);
  const [pickupFee, setPickupFee] = useState(0);
  const [pickupFeeType, setPickupFeeType] = useState('Free');
  const [pickupFeePerKm, setPickupFeePerKm] = useState(0);
  const [dailyRate, setDailyRate] = useState(1000);
  const [weeklyRate, setWeeklyRate] = useState(6000);
  const [monthlyRate, setMonthlyRate] = useState(22000);
  const [dayCareRate, setDayCareRate] = useState(600);
  const [overnightRate, setOvernightRate] = useState(1200);
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('18:00');
  const [daysOpen, setDaysOpen] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [rules, setRules] = useState([]);

  // Shelter operational states
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Dialogs
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceRate, setServiceRate] = useState(1000);
  const [serviceCapacity, setServiceCapacity] = useState(5);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Availability issue');

  // Helper date/time formatters
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
    } catch (e) {
      return 'N/A';
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'N/A';
    }
  };

  // Dismiss dropdown popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserId = () => user?._id || user?.id || '';
  const getAuthHeaders = () => {
    const userId = getUserId();
    const headers = {
      'Content-Type': 'application/json',
      'x-requester-id': userId,
      'x-user-id': userId
    };
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
  };

  // Fetch shelter profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/api/shelter/profile`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data && typeof data === 'object') {
          setShelterName(data.name || '');
          setLogo(data.logo || '');
          setCoverImage(data.logo || '');
          setDescription(data.description || '');
          setPhone(data.phone || '');
          setEmail(data.email || '');
          setAddress(data.address || '');
          setCity(data.city || '');
          setProvince(data.province || '');
          setShelterTypes(Array.isArray(data.shelterTypes) ? data.shelterTypes : []);
          setAcceptedSpecies(Array.isArray(data.acceptedSpecies) ? data.acceptedSpecies : []);
          setAcceptedBreeds(Array.isArray(data.acceptedBreeds) ? data.acceptedBreeds : []);
          setCapacity(data.capacity || 10);
          setFacilities(Array.isArray(data.facilities) ? data.facilities : []);
          setProvidesPickup(data.providesPickup || false);
          setPickupServiceType(data.pickupServiceType || 'None');
          setPickupRadius(data.pickupRadius || 15);
          setPickupFee(data.pickupFee || 0);
          setPickupFeeType(data.pickupFeeType || 'Free');
          setPickupFeePerKm(data.pickupFeePerKm || 0);
          setDailyRate(data.dailyRate || 1000);
          setOpeningTime(data.openingTime || '09:00');
          setClosingTime(data.closingTime || '18:00');
          setRules(Array.isArray(data.rules) ? data.rules : []);
        }
      }
    } catch (err) {
      console.error('Error fetching shelter profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Load operational data when overview tab is loaded
  useEffect(() => {
    if (profile) {
      fetchServices();
      fetchBookings();
      fetchReviews();
    }
  }, [profile, activeMenu]);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/shelter/services`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/shelter/bookings`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
    }
  };

  const fetchReviews = async () => {
    try {
      const shelterId = profile?.id || profile?._id;
      if (!shelterId) return;
      const res = await fetch(`${API_URL}/api/shelter/reviews?shelterId=${shelterId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    }
  };

  // Realtime name check
  const checkNameAvailability = async (name) => {
    if (!name.trim()) {
      setNameAvailable(null);
      return;
    }
    setCheckingName(true);
    try {
      const res = await fetch(`${API_URL}/api/shelter/check-name?name=${encodeURIComponent(name.trim())}`);
      const data = await res.json();
      setNameAvailable(data.available);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingName(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (stepperStep === 1 && shelterName) {
        checkNameAvailability(shelterName);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [shelterName, stepperStep]);

  // Stepper steps submit / creation
  const handleSaveShelter = async (statusOverride = 'Pending Approval') => {
    try {
      const payload = {
        name: shelterName,
        logo: logo || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=150',
        description,
        phone,
        email,
        address,
        city,
        province,
        area,
        shelterTypes: Array.isArray(shelterTypes) ? shelterTypes : [],
        acceptedSpecies: Array.isArray(acceptedSpecies) ? acceptedSpecies : [],
        acceptedBreeds: Array.isArray(acceptedBreeds) ? acceptedBreeds : [],
        capacity: parseInt(capacity) || 10,
        facilities: Array.isArray(facilities) ? facilities : [],
        providesPickup,
        pickupServiceType,
        pickupRadius: parseFloat(pickupRadius) || 15,
        pickupFee: parseFloat(pickupFee) || 0,
        pickupFeeType,
        pickupFeePerKm: parseFloat(pickupFeePerKm) || 0,
        dailyRate: parseFloat(dailyRate) || 1000,
        weeklyRate: parseFloat(weeklyRate) || 6000,
        monthlyRate: parseFloat(monthlyRate) || 22000,
        dayCareRate: parseFloat(dayCareRate) || 600,
        overnightRate: parseFloat(overnightRate) || 1200,
        openingTime,
        closingTime,
        daysOpen: Array.isArray(daysOpen) ? daysOpen : [],
        rules: Array.isArray(rules) ? rules : [],
        status: statusOverride
      };

      const res = await fetch(`${API_URL}/api/shelter/profile`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsEditingSetup(false);
        alert(`Shelter profile successfully published!`);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to save shelter profile');
      }
    } catch (err) {
      alert('Error updating shelter setup: ' + err.message);
    }
  };

  // Service creations
  const handleAddService = async () => {
    if (!serviceName.trim() || !serviceRate) {
      alert('Service Name and Daily Rate are required.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/shelter/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': getUserId()
        },
        body: JSON.stringify({
          name: serviceName,
          description: serviceDesc,
          dailyRate: parseFloat(serviceRate),
          maxCapacity: parseInt(serviceCapacity),
          acceptedPetTypes: Array.isArray(acceptedSpecies) ? acceptedSpecies : [],
          status: 'Active'
        })
      });
      if (res.ok) {
        fetchServices();
        setIsAddServiceOpen(false);
        setServiceName('');
        setServiceDesc('');
      }
    } catch (err) {
      alert('Error creating shelter service.');
    }
  };

  // Booking confirm/rejections
  const handleUpdateBooking = async (id, status, reason = '') => {
    try {
      const res = await fetch(`${API_URL}/api/shelter/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': getUserId()
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });
      if (res.ok) {
        fetchBookings();
        fetchProfile();
        setIsRejectOpen(false);
      }
    } catch (err) {
      alert('Error transitioning booking status.');
    }
  };

  // Messages chat implementation
  const loadChat = async (booking) => {
    if (!booking || !booking.id) return;
    setActiveChatBooking(booking);
    try {
      const res = await fetch(`${API_URL}/api/shelter/messages/${booking.id}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(Array.isArray(data) ? data : []);
      } else {
        setChatMessages([]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatBooking) return;
    try {
      const res = await fetch(`${API_URL}/api/shelter/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': getUserId()
        },
        body: JSON.stringify({
          bookingId: activeChatBooking.id,
          receiverId: activeChatBooking.ownerId,
          message: newMessage.trim()
        })
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages(prev => [...(Array.isArray(prev) ? prev : []), msg]);
        setNewMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Review reply logic
  async function handleRespondToReview(id, replyText) {
    try {
      const res = await fetch(`${API_URL}/api/shelter/reviews/${id}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': getUserId()
        },
        body: JSON.stringify({ response: replyText })
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Deactivate service helper
  async function handleUpdateServiceStatus(id, status) {
    try {
      const res = await fetch(`${API_URL}/api/shelter/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': getUserId()
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Safe arrays for calculation and mapping
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeServices = Array.isArray(services) ? services : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeChatMessages = Array.isArray(chatMessages) ? chatMessages : [];

  const pendingCount = safeBookings.filter(b => b && b.status === 'Pending').length;
  const activeCount = safeBookings.filter(b => b && b.status === 'Active').length;
  const completedCount = safeBookings.filter(b => b && b.status === 'Completed').length;
  const upcomingCount = safeBookings.filter(b => b && b.status === 'Accepted').length;

  // Stepper rendering helper
  const renderSetupStepper = () => {
    return (
      <div className="stepper-container">
        <div className="stepper-header">
          <Building2 size={32} color="var(--color-primary)" />
          <h2>Create Your Shelter Profile</h2>
          <p>Complete Pakistan's premier boarding and shelter setup guidelines.</p>
          <div className="stepper-progress">
            <div className="progress-bar" style={{ width: `${(stepperStep / 12) * 100}%` }}></div>
          </div>
          <span className="step-counter">Step {stepperStep} of 12</span>
        </div>

        <div className="stepper-body">
          {stepperStep === 1 && (
            <div className="step-card">
              <h3>Basic Shelter Info</h3>
              <label>Shelter Name (Must be unique)</label>
              <input 
                type="text" 
                value={shelterName} 
                onChange={(e) => setShelterName(e.target.value)} 
                placeholder="e.g. Happy Paws Shelter DHA"
              />
              {checkingName && <p className="status-checking">Checking availability...</p>}
              {nameAvailable === true && <p className="status-success">✓ Shelter name available</p>}
              {nameAvailable === false && <p className="status-error">That shelter name is already in use.</p>}

              <label style={{ marginTop: '16px' }}>Shelter Logo URL</label>
              <input 
                type="text" 
                value={logo} 
                onChange={(e) => setLogo(e.target.value)} 
                placeholder="https://..."
              />
            </div>
          )}

          {stepperStep === 2 && (
            <div className="step-card">
              <h3>Description & Contacts</h3>
              <label>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Tell pet owners about your shelter values..."
              />

              <label style={{ marginTop: '16px' }}>Contact Phone</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="e.g. 03001234567"
              />

              <label style={{ marginTop: '16px' }}>Contact Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="shelter@email.com"
              />
            </div>
          )}

          {stepperStep === 3 && (
            <div className="step-card">
              <h3>Shelter Location</h3>
              <label>Complete Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="e.g. Phase 5, DHA, Lahore"
              />

              <label style={{ marginTop: '16px' }}>City</label>
              <input 
                type="text" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                placeholder="e.g. Lahore"
              />

              <label style={{ marginTop: '16px' }}>Province</label>
              <input 
                type="text" 
                value={province} 
                onChange={(e) => setProvince(e.target.value)} 
                placeholder="e.g. Punjab"
              />
            </div>
          )}

          {stepperStep === 4 && (
            <div className="step-card">
              <h3>Shelter Services Provided</h3>
              <p className="step-subtitle">Select all that apply:</p>
              {['Pet Boarding', 'Temporary Shelter', 'Day Care', 'Overnight Boarding'].map(t => (
                <label key={t} className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={(Array.isArray(shelterTypes) ? shelterTypes : []).includes(t)}
                    onChange={(e) => {
                      const cur = Array.isArray(shelterTypes) ? shelterTypes : [];
                      if (e.target.checked) setShelterTypes([...cur, t]);
                      else setShelterTypes(cur.filter(x => x !== t));
                    }}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          )}

          {stepperStep === 5 && (
            <div className="step-card">
              <h3>Accepted Species</h3>
              <p className="step-subtitle">Select species you accommodate:</p>
              {['Dog', 'Cat', 'Bird', 'Rabbit'].map(s => (
                <label key={s} className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={(Array.isArray(acceptedSpecies) ? acceptedSpecies : []).includes(s)}
                    onChange={(e) => {
                      const cur = Array.isArray(acceptedSpecies) ? acceptedSpecies : [];
                      if (e.target.checked) setAcceptedSpecies([...cur, s]);
                      else setAcceptedSpecies(cur.filter(x => x !== s));
                    }}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          )}

          {stepperStep === 6 && (
            <div className="step-card">
              <h3>Capacity Management</h3>
              <label>Maximum Shelter Capacity (Total spaces available)</label>
              <input 
                type="number" 
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
              />
            </div>
          )}

          {stepperStep === 7 && (
            <div className="step-card">
              <h3>Facilities Available</h3>
              <p className="step-subtitle">Check facilities offered:</p>
              {['Indoor Area', 'Outdoor Play Space', 'Food Provided', 'Air Conditioning', 'CCTV Monitoring', '24/7 Veterinary Supervision'].map(f => (
                <label key={f} className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={(Array.isArray(facilities) ? facilities : []).includes(f)}
                    onChange={(e) => {
                      const cur = Array.isArray(facilities) ? facilities : [];
                      if (e.target.checked) setFacilities([...cur, f]);
                      else setFacilities(cur.filter(x => x !== f));
                    }}
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          )}

          {stepperStep === 8 && (
            <div className="step-card">
              <h3>Home Pickup Service</h3>
              <label className="checkbox-row">
                <input 
                  type="checkbox" 
                  checked={providesPickup} 
                  onChange={(e) => setProvidesPickup(e.target.checked)}
                />
                <span>We provide pet pickup from home</span>
              </label>

              {providesPickup && (
                <>
                  <label style={{ marginTop: '16px' }}>Pickup Service Type</label>
                  <select value={pickupServiceType} onChange={(e) => setPickupServiceType(e.target.value)}>
                    <option value="None">None</option>
                    <option value="Home Pickup">Home Pickup Only</option>
                    <option value="Home Drop-off">Home Drop-off Only</option>
                    <option value="Both">Both Pickup & Drop-off</option>
                  </select>

                  <label style={{ marginTop: '16px' }}>Pickup Radius (in KM)</label>
                  <input 
                    type="number" 
                    value={pickupRadius} 
                    onChange={(e) => setPickupRadius(e.target.value)} 
                  />

                  <label style={{ marginTop: '16px' }}>Pickup Fee Type</label>
                  <select value={pickupFeeType} onChange={(e) => setPickupFeeType(e.target.value)}>
                    <option value="Free">Free</option>
                    <option value="Paid">Flat Rate</option>
                    <option value="PerKM">Rate per KM</option>
                  </select>

                  {pickupFeeType === 'Paid' && (
                    <>
                      <label style={{ marginTop: '16px' }}>Flat Pickup Fee (PKR)</label>
                      <input type="number" value={pickupFee} onChange={(e) => setPickupFee(e.target.value)} />
                    </>
                  )}

                  {pickupFeeType === 'PerKM' && (
                    <>
                      <label style={{ marginTop: '16px' }}>Fee per KM (PKR)</label>
                      <input type="number" value={pickupFeePerKm} onChange={(e) => setPickupFeePerKm(e.target.value)} />
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {stepperStep === 9 && (
            <div className="step-card">
              <h3>General Pricing & Rates</h3>
              <label>Daily Boarding Rate (PKR)</label>
              <input 
                type="number" 
                value={dailyRate} 
                onChange={(e) => setDailyRate(e.target.value)} 
              />
            </div>
          )}

          {stepperStep === 10 && (
            <div className="step-card">
              <h3>Operating Hours</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label>Opening Time</label>
                  <input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Closing Time</label>
                  <input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {stepperStep === 11 && (
            <div className="step-card">
              <h3>Rules & Guidelines</h3>
              <p className="step-subtitle">Check standard guidelines enforced:</p>
              {['Vaccination Certificate Required', 'Aggressive Animals Not Accepted', 'Owner Must Provide Medication'].map(r => (
                <label key={r} className="checkbox-row">
                  <input 
                    type="checkbox" 
                    checked={(Array.isArray(rules) ? rules : []).includes(r)}
                    onChange={(e) => {
                      const cur = Array.isArray(rules) ? rules : [];
                      if (e.target.checked) setRules([...cur, r]);
                      else setRules(cur.filter(x => x !== r));
                    }}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          )}

          {stepperStep === 12 && (
            <div className="step-card">
              <h3>Publish & Preview</h3>
              <div className="preview-box">
                <h4>{shelterName || 'Unnamed Shelter'}</h4>
                <p>{address}, {city}</p>
                <Separator style={{ margin: '8px 0' }} />
                <p><strong>Capacity:</strong> {capacity} spaces</p>
                <p><strong>Accepted Species:</strong> {(Array.isArray(acceptedSpecies) ? acceptedSpecies : []).join(', ') || 'None'}</p>
                <p><strong>Pickup Service:</strong> {providesPickup ? `Yes (${pickupServiceType})` : 'No'}</p>
                <p><strong>Daily Rate:</strong> {dailyRate} PKR</p>
              </div>
            </div>
          )}
        </div>

        <div className="stepper-footer">
          {stepperStep > 1 && (
            <button className="stepper-btn-back" onClick={() => setStepperStep(stepperStep - 1)}>
              Back
            </button>
          )}
          {stepperStep < 12 ? (
            <button 
              className="stepper-btn-next" 
              onClick={() => setStepperStep(stepperStep + 1)}
              disabled={stepperStep === 1 && nameAvailable === false}
            >
              Next
            </button>
          ) : (
            <button className="stepper-btn-publish" onClick={() => handleSaveShelter('Published')}>
              Publish Shelter
            </button>
          )}
        </div>
      </div>
    );
  };

  // Main Loading State Skeleton / Spinner
  if (loading) {
    return (
      <div className="dash-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner-loader" style={{ borderColor: 'var(--color-primary)' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--color-muted)', fontWeight: 600 }}>Loading shelter dashboard...</p>
      </div>
    );
  }

  // Mandatory 12-Step Setup / Editing Render
  if (!profile || isEditingSetup) {
    return (
      <div className="dash-container">
        {/* Header Bar */}
        <header className="dash-header">
          <div className="dash-header-left">
            <div className="dash-brand">
              <img src="/logo/logo.jpeg" alt="PetLink Logo" className="dash-logo" />
              <h1 className="dash-brand-name">
                <span className="dash-brand-title-full">PetLink Shelter Setup</span>
              </h1>
            </div>
          </div>
          {isEditingSetup && (
            <div className="dash-header-right">
              <button 
                onClick={() => setIsEditingSetup(false)}
                style={{ padding: '8px 16px', backgroundColor: 'var(--color-bg-light)', color: 'var(--color-dark)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Cancel Editing
              </button>
            </div>
          )}
        </header>

        <div className="setup-wrapper" style={{ padding: '24px 32px' }}>
          {renderSetupStepper()}
        </div>
      </div>
    );
  }

  // Unified PetLink Dashboard Presentation
  return (
    <div className="dash-container">
      {/* HEADER BAR */}
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

          <div className="dash-brand" onClick={() => setActiveMenu('overview')} style={{ cursor: 'pointer' }}>
            <img src="/logo/logo.jpeg" alt="PetLink Logo" className="dash-logo" />
            <h1 className="dash-brand-name">
              <span className="dash-brand-title-full">PetLink Shelter Panel</span>
              <span className="dash-brand-title-short">Shelter Panel</span>
            </h1>
          </div>
        </div>

        <div className="dash-header-right">
          {/* Notification Bell & Popover Panel */}
          <div className="dash-notif-wrapper" ref={notifRef}>
            <button 
              type="button" 
              className={`dash-notif-btn ${isNotifDropdownOpen ? 'active' : ''}`}
              onClick={() => {
                setIsNotifDropdownOpen(!isNotifDropdownOpen);
                setIsProfileDropdownOpen(false);
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="dash-notif-badge">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </button>

            {isNotifDropdownOpen && (
              <div className="dash-notif-panel">
                <div className="dash-notif-panel-header">
                  <span className="dash-notif-panel-title">
                    <span>Booking Notifications</span>
                    {pendingCount > 0 && (
                      <span style={{ fontSize: '11px', backgroundColor: 'rgba(0, 102, 204, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '10px' }}>
                        {pendingCount} new
                      </span>
                    )}
                  </span>
                </div>

                <div className="dash-notif-list">
                  {pendingCount === 0 ? (
                    <div className="dash-notif-empty">
                      <BellOff size={28} color="var(--color-muted)" />
                      <p className="dash-notif-empty-title">All caught up</p>
                      <p className="dash-notif-empty-sub">No pending booking requests.</p>
                    </div>
                  ) : (
                    safeBookings.filter(b => b && b.status === 'Pending').map((b) => (
                      <div 
                        key={b.id || b._id} 
                        className="dash-notif-item unread"
                        onClick={() => {
                          setActiveMenu('bookings');
                          setIsNotifDropdownOpen(false);
                        }}
                      >
                        <span className="dash-notif-dot" />
                        <div className="dash-notif-content">
                          <h5 className="dash-notif-item-title">New Booking Request</h5>
                          <p className="dash-notif-item-msg">{b.owner?.name || 'Client'} requested {b.service?.name || 'Boarding'} for {b.pet?.name || 'Pet'}.</p>
                          <span className="dash-notif-item-time">{formatDate(b.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="dash-notif-panel-footer">
                  <span 
                    className="dash-notif-footer-link"
                    onClick={() => {
                      setActiveMenu('bookings');
                      setIsNotifDropdownOpen(false);
                    }}
                  >
                    View all booking requests
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge & Dropdown Menu */}
          <div className="dash-user-profile-wrapper" ref={profileRef}>
            <div 
              className={`dash-user-profile-badge ${isProfileDropdownOpen ? 'active' : ''}`} 
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsNotifDropdownOpen(false);
              }} 
            >
              <img 
                src={profile?.logo || user?.profilePic || "/logo/logo.jpeg"} 
                alt="Avatar" 
                className="dash-user-avatar"
              />
              <div className="dash-user-meta">
                <span className="dash-user-name">{user?.name || profile?.name || 'Shelter Owner'}</span>
                <span className="dash-user-role">SHELTER PROVIDER</span>
              </div>
              <ChevronDown size={14} className={`dash-profile-chevron ${isProfileDropdownOpen ? 'open' : ''}`} />
            </div>

            {isProfileDropdownOpen && (
              <div className="dash-profile-dropdown-menu">
                <div 
                  className="dash-dropdown-item"
                  onClick={() => {
                    setActiveMenu('settings');
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  <Building size={16} />
                  <span>Shelter Profile</span>
                </div>

                <div 
                  className="dash-dropdown-item"
                  onClick={() => {
                    setIsEditingSetup(true);
                    setStepperStep(1);
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  <ClipboardList size={16} />
                  <span>12-Step Setup</span>
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

      {/* BODY & SIDEBAR NAVIGATION */}
      <div className="dash-body">
        {isMobileOpen && (
          <div 
            className="dash-sidebar-overlay" 
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <aside className={`dash-sidebar ${!isSidebarOpen ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
          <div className="dash-side-section-header">Menu</div>

          <span 
            className={`dash-side-link ${activeMenu === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('overview'); setIsMobileOpen(false); }}
            title="Overview"
          >
            <LayoutDashboard size={18} />
            <span className="dash-side-link-text">Dashboard</span>
          </span>

          <span 
            className={`dash-side-link ${activeMenu === 'services' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('services'); setIsMobileOpen(false); }}
            title="Shelter Services"
          >
            <Building2 size={18} />
            <span className="dash-side-link-text">Shelter Services</span>
          </span>

          <span 
            className={`dash-side-link ${activeMenu === 'bookings' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('bookings'); setIsMobileOpen(false); }}
            title="Booking Requests"
          >
            <CalendarDays size={18} />
            <span className="dash-side-link-text">Booking Requests</span>
            {pendingCount > 0 && <span className="dash-side-badge">{pendingCount}</span>}
          </span>

          <span 
            className={`dash-side-link ${activeMenu === 'messages' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('messages'); setIsMobileOpen(false); }}
            title="Client Messages"
          >
            <MessageSquare size={18} />
            <span className="dash-side-link-text">Client Messages</span>
          </span>

          <span 
            className={`dash-side-link ${activeMenu === 'reviews' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('reviews'); setIsMobileOpen(false); }}
            title="Reviews"
          >
            <Star size={18} />
            <span className="dash-side-link-text">Reviews</span>
          </span>

          <div className="dash-side-section-header" style={{ marginTop: '12px' }}>Services</div>

          <span 
            className={`dash-side-link ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveMenu('settings'); setIsMobileOpen(false); }}
            title="Shelter Profile"
          >
            <Building size={18} />
            <span className="dash-side-link-text">Shelter Profile</span>
          </span>

          <span 
            className="dash-side-link danger-link"
            onClick={() => setIsSignoutOpen(true)}
            title="Sign Out"
            style={{ marginTop: 'auto', color: '#EF4444' }}
          >
            <LogOut size={18} />
            <span className="dash-side-link-text">Sign Out</span>
          </span>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="dash-content">
          {/* Welcome Hero Card */}
          <div className="dash-welcome-card">
            <PetPattern />
            <div className="dash-welcome-content">
              <h2 className="dash-welcome-title">Welcome back, {profile?.name || user?.name || 'Shelter Provider'}!</h2>
              <p className="dash-welcome-text">
                Manage your shelter services, bookings, availability and hosted pets.
              </p>
              <div className="dash-welcome-address">
                <div className="dash-welcome-meta-item">
                  <Badge variant="success">{profile?.status || 'Published'}</Badge>
                </div>
                {profile?.address && (
                  <div className="dash-welcome-meta-item">
                    <MapPin size={14} />
                    <span>{profile.address}, {profile.city}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="dash-welcome-meta-item">
                    <ShieldCheck size={14} />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DYNAMIC TAB CONTROLS */}
          {activeMenu === 'overview' && (
            <div className="dash-tab-pane">
              {/* Metric Cards Grid */}
              <div className="dash-metrics-grid">
                <div className="metric-card" onClick={() => setActiveMenu('settings')}>
                  <div className="metric-icon-box" style={{ backgroundColor: 'rgba(0, 102, 204, 0.08)', color: 'var(--color-primary)' }}>
                    <Building2 size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Total Capacity</span>
                    <span className="metric-value">{profile?.capacity || 0}</span>
                  </div>
                </div>

                <div className="metric-card" onClick={() => setActiveMenu('overview')}>
                  <div className="metric-icon-box" style={{ backgroundColor: 'rgba(22, 163, 74, 0.08)', color: '#16A34A' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Available Spaces</span>
                    <span className="metric-value">{Math.max(0, (profile?.capacity || 0) - (profile?.occupiedSpaces || 0))}</span>
                  </div>
                </div>

                <div className="metric-card" onClick={() => setActiveMenu('overview')}>
                  <div className="metric-icon-box" style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', color: '#D97706' }}>
                    <PawPrint size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Occupied Spaces</span>
                    <span className="metric-value">{profile?.occupiedSpaces || 0}</span>
                  </div>
                </div>

                <div className="metric-card" onClick={() => setActiveMenu('bookings')}>
                  <div className="metric-icon-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
                    <Clock size={22} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">Pending Requests</span>
                    <span className="metric-value">{pendingCount}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <h3 className="section-title">Quick Actions</h3>
              <div className="dash-quick-grid">
                <div className="dash-quick-card" onClick={() => setIsAddServiceOpen(true)}>
                  <div className="dash-quick-icon">
                    <Plus size={20} />
                  </div>
                  <div className="dash-quick-text">
                    <h4>Add Shelter Service</h4>
                    <p>Create a new boarding package or service listing</p>
                  </div>
                </div>

                <div className="dash-quick-card" onClick={() => setActiveMenu('services')}>
                  <div className="dash-quick-icon">
                    <ClipboardList size={20} />
                  </div>
                  <div className="dash-quick-text">
                    <h4>Manage Services</h4>
                    <p>Edit pricing, capacity, and active status</p>
                  </div>
                </div>

                <div className="dash-quick-card" onClick={() => setActiveMenu('bookings')}>
                  <div className="dash-quick-icon">
                    <Calendar size={20} />
                  </div>
                  <div className="dash-quick-text">
                    <h4>View Booking Requests</h4>
                    <p>Accept, reject or check-in pet stay reservations</p>
                  </div>
                </div>

                <div className="dash-quick-card" onClick={() => setActiveMenu('messages')}>
                  <div className="dash-quick-icon">
                    <MessageSquare size={20} />
                  </div>
                  <div className="dash-quick-text">
                    <h4>Open Messages</h4>
                    <p>Communicate directly with pet owners</p>
                  </div>
                </div>
              </div>

              {/* Pets Currently in Shelter */}
              <h3 className="section-title" style={{ marginTop: '28px' }}>Pets Currently in Shelter</h3>
              <Card className="dash-card">
                <CardContent className="stay-list-wrapper">
                  {safeBookings.filter(b => b && b.status === 'Active').length === 0 ? (
                    <div className="dash-empty-state">
                      <PawPrint size={36} color="var(--color-muted)" />
                      <h4>No pets currently staying at your shelter.</h4>
                      <p>When pets check in for active boarding, they will be listed here.</p>
                    </div>
                  ) : (
                    <div className="dash-table-wrapper">
                      <table className="dash-table">
                        <thead>
                          <tr>
                            <th>Pet Details</th>
                            <th>Owner Info</th>
                            <th>Service</th>
                            <th>Stay Period</th>
                            <th>Care Notes</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {safeBookings.filter(b => b && b.status === 'Active').map(b => (
                            <tr key={b.id || b._id}>
                              <td>
                                <div className="pet-cell">
                                  <img src={b.pet?.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=150'} alt="Pet" className="pet-avatar" />
                                  <div>
                                    <span className="pet-name">{b.pet?.name || 'Pet'}</span>
                                    <span className="pet-breed">{b.pet?.breed || 'Unknown breed'}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="owner-cell">
                                  <span className="owner-name">{b.owner?.name || 'Owner'}</span>
                                  <span className="owner-phone">{b.owner?.phone || 'N/A'}</span>
                                </div>
                              </td>
                              <td>{b.service?.name || 'Boarding'}</td>
                              <td>
                                <span className="stay-dates">{formatDate(b.checkInDate)} - {formatDate(b.checkOutDate)}</span>
                              </td>
                              <td>{b.specialInstructions || 'None'}</td>
                              <td>
                                <button className="dash-btn-primary" onClick={() => handleUpdateBooking(b.id || b._id, 'Completed')}>
                                  Complete Stay
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Shelter Services Menu View */}
          {activeMenu === 'services' && (
            <div className="dash-tab-pane">
              <div className="dash-pane-header">
                <div>
                  <h3 className="section-title" style={{ margin: 0 }}>My Shelter Services</h3>
                  <p className="dash-pane-sub">Manage service offerings listed on PetLink discovery boards.</p>
                </div>
                <button className="dash-btn-primary" onClick={() => setIsAddServiceOpen(true)}>
                  <Plus size={16} />
                  <span>Create Service</span>
                </button>
              </div>

              <div className="services-grid">
                {safeServices.length === 0 ? (
                  <div className="dash-empty-state">
                    <ClipboardList size={36} color="var(--color-muted)" />
                    <h4>No services registered yet.</h4>
                    <p>Create a service to make your shelter discoverable for pet owners.</p>
                  </div>
                ) : (
                  safeServices.map(s => (
                    <Card key={s.id || s._id} className="dash-card service-card">
                      <CardHeader style={{ paddingBottom: '8px' }}>
                        <div className="service-title-row">
                          <CardTitle style={{ fontSize: '16px', fontWeight: 700 }}>{s.name}</CardTitle>
                          <Badge variant={s.status === 'Active' ? 'success' : 'secondary'}>{s.status || 'Active'}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="service-desc">{s.description || 'No description provided.'}</p>
                        <Separator style={{ margin: '12px 0' }} />
                        <div className="service-meta">
                          <span><strong>Rate:</strong> {s.dailyRate} PKR/day</span>
                          <span><strong>Capacity:</strong> {s.maxCapacity} pets</span>
                        </div>
                        <div className="service-card-actions" style={{ marginTop: '14px' }}>
                          <button 
                            className="dash-btn-outline danger"
                            onClick={() => handleUpdateServiceStatus(s.id || s._id, s.status === 'Active' ? 'Inactive' : 'Active')}
                          >
                            {s.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Booking Requests Board */}
          {activeMenu === 'bookings' && (
            <div className="dash-tab-pane">
              <div className="dash-pane-header">
                <div>
                  <h3 className="section-title" style={{ margin: 0 }}>Booking Requests</h3>
                  <p className="dash-pane-sub">Review, accept, or reject incoming pet boarding reservations.</p>
                </div>
              </div>

              <div className="bookings-list">
                {safeBookings.length === 0 ? (
                  <div className="dash-empty-state">
                    <Calendar size={36} color="var(--color-muted)" />
                    <h4>No booking requests found.</h4>
                    <p>Pending requests from pet owners will appear here.</p>
                  </div>
                ) : (
                  safeBookings.map(b => (
                    <Card key={b.id || b._id} className="dash-card booking-req-card">
                      <CardContent className="booking-card-inner">
                        <div className="booking-pet-profile">
                          <img src={b.pet?.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=150'} alt="Pet" className="booking-pet-avatar" />
                          <div>
                            <h4 className="booking-pet-name">{b.pet?.name || 'Pet'}</h4>
                            <span className="breed-badge">{b.pet?.breed || 'Pet'}</span>
                            <p className="owner-desc">Owner: {b.owner?.name || 'Owner'} | {b.owner?.phone || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="booking-stay-details">
                          <p><strong>Service:</strong> {b.service?.name || 'Boarding'}</p>
                          <p><strong>Dates:</strong> {formatDate(b.checkInDate)} - {formatDate(b.checkOutDate)}</p>
                          <p><strong>Duration:</strong> {b.duration || 1} Days</p>
                          {b.pickupOption && b.pickupOption !== 'No Pickup' && (
                            <p className="pickup-tag">
                              <Truck size={14} />
                              <span>Pickup: {b.pickupOption} | {b.pickupAddress || 'Address specified'}</span>
                            </p>
                          )}
                          {b.specialInstructions && (
                            <p className="care-notes-warn">
                              <AlertTriangle size={14} />
                              <span>Care notes: {b.specialInstructions}</span>
                            </p>
                          )}
                        </div>

                        <div className="booking-total-price">
                          <span className="price-label">Total Amount</span>
                          <span className="price-val">{b.totalAmount || 0} PKR</span>
                          <Badge variant={b.status === 'Accepted' ? 'success' : b.status === 'Pending' ? 'warning' : 'secondary'}>
                            {b.status || 'Pending'}
                          </Badge>
                        </div>

                        <div className="booking-req-actions">
                          {b.status === 'Pending' && (
                            <>
                              <button className="dash-btn-primary" onClick={() => handleUpdateBooking(b.id || b._id, 'Accepted')}>
                                Accept
                              </button>
                              <button className="dash-btn-outline danger" onClick={() => {
                                setSelectedBookingId(b.id || b._id);
                                setIsRejectOpen(true);
                              }}>
                                Reject
                              </button>
                            </>
                          )}
                          {b.status === 'Accepted' && (
                            <button className="dash-btn-primary" onClick={() => handleUpdateBooking(b.id || b._id, 'Active')}>
                              Check-In Pet
                            </button>
                          )}
                          {b.status === 'Active' && (
                            <button className="dash-btn-primary" onClick={() => handleUpdateBooking(b.id || b._id, 'Completed')}>
                              Complete Stay
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Client Messages Page */}
          {activeMenu === 'messages' && (
            <div className="dash-tab-pane">
              <div className="dash-pane-header">
                <div>
                  <h3 className="section-title" style={{ margin: 0 }}>Client Messages</h3>
                  <p className="dash-pane-sub">Chat directly with owners who have active booking reservations.</p>
                </div>
              </div>

              <div className="message-client-wrapper">
                <div className="conversation-sidebar">
                  <h4>Active Bookings</h4>
                  <Separator style={{ margin: '8px 0' }} />
                  <div className="conv-list">
                    {safeBookings.length === 0 ? (
                      <p className="no-msgs" style={{ padding: '12px' }}>No booking conversations available.</p>
                    ) : (
                      safeBookings.map(b => (
                        <div 
                          key={b.id || b._id} 
                          className={`conv-item ${activeChatBooking?.id === b.id || activeChatBooking?._id === b._id ? 'active' : ''}`}
                          onClick={() => loadChat(b)}
                        >
                          <span className="conv-title">{b.pet?.name || 'Pet'} ({b.owner?.name || 'Owner'})</span>
                          <small className="conv-sub">{b.service?.name || 'Boarding'}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="chat-window">
                  {activeChatBooking ? (
                    <>
                      <div className="chat-header">
                        <h4>Chat with {activeChatBooking.owner?.name || 'Owner'} regarding {activeChatBooking.pet?.name || 'Pet'}</h4>
                      </div>
                      <div className="chat-messages-area">
                        {safeChatMessages.length === 0 ? (
                          <div className="dash-empty-state" style={{ padding: '24px' }}>
                            <MessageSquare size={28} color="var(--color-muted)" />
                            <p>No messages sent yet. Say hello to the pet owner!</p>
                          </div>
                        ) : (
                          safeChatMessages.map(m => (
                            <div key={m.id || m._id} className={`message-bubble ${m.senderId === getUserId() ? 'sender' : 'receiver'}`}>
                              <p>{m.message}</p>
                              <small>{formatTime(m.createdAt)}</small>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="chat-input-row">
                        <input 
                          type="text" 
                          value={newMessage} 
                          onChange={(e) => setNewMessage(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..." 
                        />
                        <button className="dash-btn-primary" onClick={handleSendMessage}>Send</button>
                      </div>
                    </>
                  ) : (
                    <div className="dash-empty-state">
                      <MessageSquare size={36} color="var(--color-muted)" />
                      <h4>Select a Conversation</h4>
                      <p>Select an active booking reservation from the list to message pet owners.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Client Reviews Page */}
          {activeMenu === 'reviews' && (
            <div className="dash-tab-pane">
              <div className="dash-pane-header">
                <div>
                  <h3 className="section-title" style={{ margin: 0 }}>Client Reviews</h3>
                  <p className="dash-pane-sub">Read feedback from pet owners and respond to reviews.</p>
                </div>
              </div>

              <div className="reviews-list">
                {safeReviews.length === 0 ? (
                  <div className="dash-empty-state">
                    <Star size={36} color="var(--color-muted)" />
                    <h4>No reviews received yet.</h4>
                    <p>Reviews submitted by pet owners after stays will appear here.</p>
                  </div>
                ) : (
                  safeReviews.map(r => (
                    <Card key={r.id || r._id} className="dash-card review-card-box">
                      <CardContent style={{ padding: '18px' }}>
                        <div className="review-header-row">
                          <div className="reviewer-info">
                            <span className="reviewer-name">{r.user?.name || 'Reviewer'}</span>
                            <div className="stars-row">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < (r.rating || 5) ? '#F59E0B' : 'none'} color="#F59E0B" />
                              ))}
                            </div>
                          </div>
                          <span className="review-date">{formatDate(r.createdAt)}</span>
                        </div>
                        <p className="review-comment">{r.comment}</p>
                        
                        {r.response ? (
                          <div className="provider-response-box">
                            <strong>Your response:</strong>
                            <p>{r.response}</p>
                          </div>
                        ) : (
                          <div className="reply-input-box">
                            <input 
                              type="text" 
                              placeholder="Write a response..." 
                              id={`reply-input-${r.id || r._id}`}
                            />
                            <button 
                              className="dash-btn-primary"
                              onClick={() => {
                                const inputEl = document.getElementById(`reply-input-${r.id || r._id}`);
                                const val = inputEl ? inputEl.value : '';
                                if (val.trim()) {
                                  handleRespondToReview(r.id || r._id, val.trim());
                                }
                              }}
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Shelter Profile Management Page */}
          {activeMenu === 'settings' && (
            <div className="dash-tab-pane">
              <div className="dash-pane-header">
                <div>
                  <h3 className="section-title" style={{ margin: 0 }}>Shelter Profile Management</h3>
                  <p className="dash-pane-sub">View and modify your public shelter profile details.</p>
                </div>
                <button 
                  className="dash-btn-primary"
                  onClick={() => {
                    if (profile) {
                      setShelterName(profile.name || '');
                      setLogo(profile.logo || '');
                      setCoverImage(profile.logo || '');
                      setDescription(profile.description || '');
                      setPhone(profile.phone || '');
                      setEmail(profile.email || '');
                      setAddress(profile.address || '');
                      setCity(profile.city || '');
                      setProvince(profile.province || '');
                      setArea(profile.area || '');
                      setShelterTypes(Array.isArray(profile.shelterTypes) ? profile.shelterTypes : []);
                      setAcceptedSpecies(Array.isArray(profile.acceptedSpecies) ? profile.acceptedSpecies : []);
                      setAcceptedBreeds(Array.isArray(profile.acceptedBreeds) ? profile.acceptedBreeds : []);
                      setCapacity(profile.capacity || 10);
                      setFacilities(Array.isArray(profile.facilities) ? profile.facilities : []);
                      setProvidesPickup(profile.providesPickup || false);
                      setPickupServiceType(profile.pickupServiceType || 'None');
                      setPickupRadius(profile.pickupRadius || 15);
                      setPickupFee(profile.pickupFee || 0);
                      setPickupFeeType(profile.pickupFeeType || 'Free');
                      setPickupFeePerKm(profile.pickupFeePerKm || 0);
                      setDailyRate(profile.dailyRate || 1000);
                      setOpeningTime(profile.openingTime || '09:00');
                      setClosingTime(profile.closingTime || '18:00');
                      setRules(Array.isArray(profile.rules) ? profile.rules : []);
                    }
                    setIsEditingSetup(true);
                    setStepperStep(1);
                  }}
                >
                  <ClipboardList size={16} />
                  <span>Edit Shelter (12 Steps)</span>
                </button>
              </div>

              <Card className="dash-card" style={{ padding: '24px' }}>
                <div className="profile-hero-row">
                  <img 
                    src={profile?.logo || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=150'} 
                    alt="Logo" 
                    className="profile-logo-img" 
                  />
                  <div>
                    <h2 className="profile-title">{profile?.name || 'Shelter'}</h2>
                    <p className="profile-subtitle">{profile?.address || ''}, {profile?.city || ''}, {profile?.province || ''}</p>
                    <div className="profile-badges-row">
                      <Badge variant="success">{profile?.status || 'Published'}</Badge>
                      <Badge>{profile?.providesPickup ? 'Pickup Available' : 'No Pickup'}</Badge>
                    </div>
                  </div>
                </div>

                <Separator style={{ margin: '20px 0' }} />

                <div className="profile-info-grid">
                  <div>
                    <span className="info-label">Contact Phone</span>
                    <p className="info-val">{profile?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="info-label">Contact Email</span>
                    <p className="info-val">{profile?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="info-label">Total Capacity</span>
                    <p className="info-val">{profile?.capacity || 0} Spaces</p>
                  </div>
                  <div>
                    <span className="info-label">Daily Boarding Rate</span>
                    <p className="info-val">{profile?.dailyRate || 0} PKR</p>
                  </div>
                </div>

                <Separator style={{ margin: '20px 0' }} />

                <div>
                  <span className="info-label">Accepted Species</span>
                  <div className="chips-row">
                    {(Array.isArray(profile?.acceptedSpecies) ? profile.acceptedSpecies : []).map(sp => (
                      <Badge key={sp} variant="secondary">{sp}</Badge>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <span className="info-label">Facilities</span>
                  <div className="chips-row">
                    {(Array.isArray(profile?.facilities) ? profile.facilities : []).map(f => (
                      <Badge key={f} variant="outline" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>{f}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Dialog for Add Service */}
      {isAddServiceOpen && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="dialog-header">
              <h3>Create Shelter Service</h3>
              <button onClick={() => setIsAddServiceOpen(false)}><X size={16} /></button>
            </div>
            <div className="dialog-body">
              <label>Service Name</label>
              <input type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="e.g. Daily Boarding Care" />

              <label style={{ marginTop: '12px' }}>Description</label>
              <textarea value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} placeholder="Detail the care, exercise, and diet included..." />

              <label style={{ marginTop: '12px' }}>Daily Rate (PKR)</label>
              <input type="number" value={serviceRate} onChange={(e) => setServiceRate(e.target.value)} />

              <label style={{ marginTop: '12px' }}>Maximum Capacity</label>
              <input type="number" value={serviceCapacity} onChange={(e) => setServiceCapacity(e.target.value)} />
            </div>
            <div className="dialog-footer">
              <button className="dash-btn-outline" onClick={() => setIsAddServiceOpen(false)}>Cancel</button>
              <button className="dash-btn-primary" onClick={handleAddService}>Add Service</button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for Rejection Reason */}
      {isRejectOpen && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <div className="dialog-header">
              <h3>Reject Booking Request</h3>
              <button onClick={() => setIsRejectOpen(false)}><X size={16} /></button>
            </div>
            <div className="dialog-body">
              <label>Specify Reason for Rejection</label>
              <select value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}>
                <option value="Availability issue">Availability issue</option>
                <option value="Service unavailable">Service unavailable</option>
                <option value="Date unavailable">Date unavailable</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="dialog-footer">
              <button className="dash-btn-outline" onClick={() => setIsRejectOpen(false)}>Cancel</button>
              <button className="dash-btn-primary danger" onClick={() => handleUpdateBooking(selectedBookingId, 'Rejected', rejectionReason)}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      <AlertDialog open={isSignoutOpen} onOpenChange={setIsSignoutOpen}>
        <AlertDialogContent style={{ borderRadius: '16px', maxWidth: '400px' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontSize: '18px', fontWeight: '800' }}>Confirm Sign Out</AlertDialogTitle>
            <AlertDialogDescription style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
              Are you sure you want to log out of your Shelter Provider session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter style={{ marginTop: '16px' }}>
            <AlertDialogCancel className="dash-btn-outline" style={{ borderRadius: '8px' }}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onLogout}
              className="dash-btn-primary danger"
              style={{ borderRadius: '8px', backgroundColor: '#EF4444', color: '#FFFFFF' }}
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ShelterProviderDashboard({ user, onLogout }) {
  return (
    <DashboardErrorBoundary>
      <ShelterProviderContent user={user} onLogout={onLogout} />
    </DashboardErrorBoundary>
  );
}
