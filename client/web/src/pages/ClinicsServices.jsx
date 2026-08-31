import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, Truck, Calendar, Activity, 
  Clock, ShieldAlert, Heart, Eye, AlertCircle, X, Check,
  MessageSquare, User, Filter, RefreshCw, Phone, Globe
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ClinicsServices({ user, onViewDetails }) {
  const [activeTab, setActiveTab] = useState('discovery');
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // User location states
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locPermission, setLocPermission] = useState('prompt');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [emergencyFilter, setEmergencyFilter] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('');
  const [distanceLimit, setDistanceLimit] = useState(25);
  const [selectedService, setSelectedService] = useState('');

  // Chat window state for appointments
  const [activeApptChat, setActiveApptChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocPermission('granted');
      },
      (error) => {
        setLocPermission('denied');
        console.log('Geolocation permission denied or error:', error.message);
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Fetch clinics
  const fetchClinics = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/clinics/nearby?`;
      if (latitude && longitude) {
        url += `lat=${latitude}&lng=${longitude}&distanceLimit=${distanceLimit}&`;
      }
      if (cityFilter) {
        url += `city=${encodeURIComponent(cityFilter)}&`;
      }
      if (emergencyFilter) {
        url += `providesEmergency=true&`;
      }
      if (ratingFilter) {
        url += `rating=${ratingFilter}&`;
      }
      if (selectedService) {
        url += `service=${encodeURIComponent(selectedService)}&`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        let filtered = data;
        if (searchTerm) {
          filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.formattedAddress.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setClinics(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user appointments
  const fetchAppointments = async () => {
    if (!user || !user._id) return;
    try {
      const res = await fetch(`${API_URL}/api/clinics/appointments/user`, {
        headers: { 'x-requester-id': user._id }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch saved clinics
  const fetchWishlist = async () => {
    if (!user || !user._id) return;
    try {
      const res = await fetch(`${API_URL}/api/clinics/wishlist`, {
        headers: { 'x-requester-id': user._id }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistIds(data.map(c => c.googlePlaceId));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [latitude, longitude, cityFilter, emergencyFilter, ratingFilter, distanceLimit, selectedService, searchTerm]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    } else {
      fetchWishlist();
    }
  }, [activeTab]);

  // Toggle clinic wishlist
  const handleToggleWishlist = async (googlePlaceId, e) => {
    e.stopPropagation();
    if (!user || !user._id) return;
    try {
      const res = await fetch(`${API_URL}/api/clinics/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify({ googlePlaceId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.wishlisted) {
          setWishlistIds([...wishlistIds, googlePlaceId]);
        } else {
          setWishlistIds(wishlistIds.filter(id => id !== googlePlaceId));
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this veterinary appointment?')) return;
    try {
      const res = await fetch(`${API_URL}/api/clinics/appointments/${apptId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chat window load
  const loadChat = async (appt) => {
    setActiveApptChat(appt);
    try {
      const res = await fetch(`${API_URL}/api/clinics/messages/${appt.id}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeApptChat) return;
    try {
      const res = await fetch(`${API_URL}/api/clinics/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify({
          appointmentId: activeApptChat.id,
          receiverId: activeApptChat.clinicId,
          message: newMessage.trim()
        })
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages([...chatMessages, msg]);
        setNewMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span style={{ fontSize: '11px', color: '#94A3B8' }}>No ratings yet</span>;
    return (
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} fill={i < Math.round(rating) ? '#F59E0B' : 'none'} color="#F59E0B" />
        ))}
      </div>
    );
  };

  return (
    <div className="marketplace-container">
      {/* Top Banner */}
      <div className="market-hero-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="market-hero-content">
          <Badge className="market-hero-badge">Google Places Discovery Engine</Badge>
          <h2 className="market-hero-title">Find Real-World Clinics Near You</h2>
          <p className="market-hero-subtitle">
            Discover real local animal care clinics using real-time Google Places nearby coordinates matching.
          </p>
        </div>
      </div>

      {/* Geolocation permission indicator */}
      {locPermission === 'denied' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: '#FFFBEB', borderLeft: '4px solid #D97706', borderRadius: '8px', marginBottom: '24px' }}>
          <AlertCircle size={20} color="#D97706" />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#B45309' }}>Location access is disabled</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#D97706' }}>
              Using default area queries. Enter your city or area manually to find clinics.
            </p>
          </div>
          <button onClick={requestLocation} style={{ padding: '6px 12px', backgroundColor: '#FFFFFF', border: '1px solid #D97706', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#B45309', cursor: 'pointer' }}>
            Allow GPS
          </button>
        </div>
      )}

      {/* Tab toggle */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '24px', gap: '24px' }}>
        <button 
          onClick={() => { setActiveTab('discovery'); setActiveApptChat(null); }}
          style={{ padding: '12px 4px', border: 'none', background: 'none', borderBottom: activeTab === 'discovery' ? '2px solid var(--color-primary)' : 'none', color: activeTab === 'discovery' ? 'var(--color-primary)' : '#64748B', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
        >
          Find Clinics
        </button>
        <button 
          onClick={() => setActiveTab('appointments')}
          style={{ padding: '12px 4px', border: 'none', background: 'none', borderBottom: activeTab === 'appointments' ? '2px solid var(--color-primary)' : 'none', color: activeTab === 'appointments' ? 'var(--color-primary)' : '#64748B', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
        >
          My Appointments
        </button>
      </div>

      {activeTab === 'discovery' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
          
          {/* Filters sidebar */}
          <aside style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Filter size={16} />
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Filter Criteria</h3>
            </div>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Search by City</label>
            <select 
              value={cityFilter} 
              onChange={(e) => setCityFilter(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '16px', outline: 'none' }}
            >
              <option value="">All Cities</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Islamabad">Islamabad</option>
            </select>

            {latitude && longitude && (
              <>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Max Distance (KM)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    step="5" 
                    value={distanceLimit} 
                    onChange={(e) => setDistanceLimit(parseInt(e.target.value))} 
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '12px', fontWeight: '700' }}>{distanceLimit}km</span>
                </div>
              </>
            )}

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Minimum Rating</label>
            <select 
              value={ratingFilter} 
              onChange={(e) => setRatingFilter(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '16px', outline: 'none' }}
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#334155', fontWeight: '600' }}>
              <input 
                type="checkbox" 
                checked={emergencyFilter} 
                onChange={(e) => setEmergencyFilter(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span>24/7 Emergency Care</span>
            </label>
          </aside>

          {/* Results Area */}
          <div>
            <div className="market-search-box" style={{ marginBottom: '24px' }}>
              <Search size={18} />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search real clinics by hospital name, area..." 
              />
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px' }}>
                <RefreshCw size={32} className="spinner-loader" style={{ color: 'var(--color-primary)' }} />
                <p style={{ marginTop: '16px', color: '#64748B', fontSize: '13px' }}>Discovering real local clinics...</p>
              </div>
            ) : clinics.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', border: '1px dashed #CBD5E1', borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
                <Activity size={36} color="#94A3B8" />
                <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748B' }}>No veterinary clinics discovered near your location.</p>
              </div>
            ) : (
              <div className="market-grid">
                {clinics.map(c => {
                  const saved = wishlistIds.includes(c.googlePlaceId);
                  return (
                    <Card key={c.googlePlaceId} className="pet-card fade-in">
                      <div className="pet-card-image-wrapper">
                        <img 
                          src={c.photo || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=320'} 
                          alt={c.name} 
                          className="pet-card-image"
                        />
                        <button 
                          className="pet-card-fav-btn" 
                          onClick={(e) => handleToggleWishlist(c.googlePlaceId, e)}
                        >
                          <Heart size={16} fill={saved ? '#EF4444' : 'none'} color={saved ? '#EF4444' : '#64748B'} />
                        </button>
                      </div>

                      <CardContent className="pet-card-content" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 className="pet-card-name" style={{ fontSize: '16px', fontWeight: '700', flex: 1 }}>{c.name}</h3>
                          {c.connected ? (
                            <Badge variant="success" style={{ marginLeft: '8px' }}>PetLink Connected</Badge>
                          ) : (
                            <Badge variant="secondary" style={{ marginLeft: '8px' }}>Places Listing</Badge>
                          )}
                        </div>

                        <div className="pet-card-location" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                          <MapPin size={12} />
                          <span>{c.formattedAddress}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                          {renderStars(c.rating)}
                          {c.rating && (
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>({c.reviewCount})</span>
                          )}
                        </div>

                        {c.distance && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: '700', marginTop: '10px' }}>
                            <Activity size={12} />
                            <span>Estimated {parseFloat(c.distance).toFixed(1)} km away</span>
                          </div>
                        )}

                        {c.providesEmergency && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#EF4444', backgroundColor: '#FEF2F2', padding: '4px 8px', borderRadius: '6px', marginTop: '8px', width: 'fit-content', fontWeight: '700' }}>
                            <ShieldAlert size={12} />
                            <span>Emergency Room Available</span>
                          </div>
                        )}

                        <Separator style={{ margin: '14px 0' }} />

                        <div className="pet-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            {c.connected ? (
                              <>
                                <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Consultation Fee</span>
                                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{c.startingFee} PKR</strong>
                              </>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {c.phone && (
                                  <a href={`tel:${c.phone}`} style={{ color: '#64748B' }} title="Call Clinic"><Phone size={16} /></a>
                                )}
                                {c.website && (
                                  <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ color: '#64748B' }} title="Visit Website"><Globe size={16} /></a>
                                )}
                              </div>
                            )}
                          </div>

                          <button 
                            className="btn btn-primary"
                            onClick={() => onViewDetails(c.googlePlaceId)}
                            style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span>{c.connected ? 'View & Book' : 'Details'}</span>
                            <Eye size={12} />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* User Appointments Tab layout */
        <div style={{ display: 'grid', gridTemplateColumns: activeApptChat ? '1.2fr 1fr' : '1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>My Clinic Appointments</h3>
            {appointments.length === 0 ? (
              <div style={{ padding: '48px', border: '1px dashed #CBD5E1', borderRadius: '12px', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
                <Calendar size={32} color="#94A3B8" />
                <p style={{ marginTop: '12px', color: '#64748B' }}>No veterinary appointments scheduled yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {appointments.map(a => (
                  <Card key={a.id} style={{ border: '1px solid #E2E8F0' }}>
                    <CardContent style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700' }}>{a.clinicName}</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{a.clinicAddress}, {a.clinicCity}</p>
                        
                        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                          <span style={{ fontSize: '13px' }}><strong>Pet:</strong> {a.petName}</span>
                          <span style={{ fontSize: '13px' }}><strong>Service:</strong> {a.serviceName}</span>
                          {a.doctorName && <span style={{ fontSize: '13px' }}><strong>Doctor:</strong> {a.doctorName}</span>}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: '#475569' }}>
                          <Clock size={12} />
                          <span>{new Date(a.appointmentDate).toLocaleDateString()} at {a.appointmentTime}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <Badge variant={
                          a.status === 'Confirmed' ? 'success' :
                          a.status === 'Pending' ? 'warning' :
                          a.status === 'Cancelled' ? 'secondary' : 'default'
                        }>
                          {a.status}
                        </Badge>
                        <strong style={{ fontSize: '14px', color: '#0F172A' }}>{a.servicePrice || 1000} PKR</strong>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button 
                            onClick={() => loadChat(a)}
                            style={{ padding: '6px 12px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                          >
                            <MessageSquare size={12} />
                            <span>Message</span>
                          </button>
                          {['Pending', 'Confirmed'].includes(a.status) && (
                            <button 
                              onClick={() => handleCancelAppointment(a.id)}
                              style={{ padding: '6px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Chat Window */}
          {activeApptChat && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', flexDirection: 'column', height: '500px' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>Chat with {activeApptChat.clinicName}</h4>
                  <small style={{ color: '#64748B' }}>Regarding appointment for {activeApptChat.petName}</small>
                </div>
                <button onClick={() => setActiveApptChat(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button>
              </div>

              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatMessages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '12px', marginTop: '24px' }}>No messages exchanged yet.</p>
                ) : (
                  chatMessages.map(m => (
                    <div key={m.id} style={{
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      alignSelf: m.senderId === user._id ? 'flex-end' : 'flex-start',
                      backgroundColor: m.senderId === user._id ? 'var(--color-primary)' : '#FFFFFF',
                      color: m.senderId === user._id ? '#FFFFFF' : '#1E293B',
                      border: m.senderId === user._id ? 'none' : '1px solid #E2E8F0'
                    }}>
                      <p style={{ margin: 0 }}>{m.message}</p>
                      <small style={{ display: 'block', fontSize: '10px', textAlign: 'right', marginTop: '4px', opacity: 0.8 }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Type a message..." 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
                <button onClick={handleSendMessage} style={{ padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
