import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Star, 
  Truck, 
  Calendar, 
  Sparkles, 
  Building2, 
  Check, 
  Clock, 
  MessageSquare, 
  AlertTriangle, 
  X, 
  PawPrint, 
  Users, 
  ShieldCheck, 
  Phone, 
  Info, 
  ArrowLeft, 
  ChevronRight, 
  Activity, 
  Zap, 
  Shield, 
  Heart,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ShelterDetails({ user, shelterId, onBack }) {
  const [shelter, setShelter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState([]);

  // Booking Flow Stepper states
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [bookStep, setBookStep] = useState(1);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [pickupOption, setPickupOption] = useState('No Pickup');
  const [pickupAddress, setPickupAddress] = useState(user?.address || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/shelter/public/${shelterId}`);
      if (res.ok) {
        const data = await res.json();
        setShelter(data);
        if (data.services?.length > 0) {
          setSelectedServiceId(data.services[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPets = async () => {
    if (!user || !user._id) return;
    try {
      const res = await fetch(`${API_URL}/api/pets/owner/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setUserPets(data);
        if (data.length > 0) {
          setSelectedPetId(data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchUserPets();
  }, [shelterId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', minHeight: '60vh', justifyContent: 'center' }}>
        <div className="spinner-loader" style={{ borderColor: '#0066CC' }}></div>
        <p style={{ marginTop: '16px', color: '#64748B', fontSize: '14px' }}>Loading shelter information and facilities...</p>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', margin: '24px 0' }}>
        <AlertTriangle size={48} color="#EF4444" />
        <h3 style={{ marginTop: '16px', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>Shelter Details Unavailable</h3>
        <p style={{ marginTop: '4px', fontSize: '14px', color: '#64748B' }}>The requested shelter profile could not be retrieved from the database.</p>
        <button 
          onClick={onBack}
          style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#0066CC', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} />
          Back to Boarding & Temporary Lodging
        </button>
      </div>
    );
  }

  // Calculate pricing
  const service = shelter.services?.find(s => s.id === selectedServiceId) || shelter;
  const pricePerDay = service.dailyRate || shelter.dailyRate || 1000;
  const days = (checkInDate && checkOutDate) 
    ? Math.max(1, Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)))
    : 1;

  const flatPickupFee = shelter.providesPickup && shelter.pickupFeeType === 'Paid' ? (shelter.pickupFee || 0) : 0;
  const pickupFeeText = shelter.providesPickup ? `${shelter.pickupFeeType} (Flat: ${shelter.pickupFee} PKR)` : 'N/A';
  const totalAmount = (pricePerDay * days) + (pickupOption !== 'No Pickup' ? flatPickupFee : 0);

  const spacesAvailable = Math.max(0, (shelter.capacity || 10) - (shelter.occupiedSpaces || 0));

  const handleCreateBooking = async () => {
    setSubmitting(true);
    try {
      const payload = {
        shelterId: shelter.id,
        serviceId: selectedServiceId || null,
        petId: selectedPetId,
        checkInDate: new Date(checkInDate).toISOString(),
        checkOutDate: new Date(checkOutDate).toISOString(),
        duration: days,
        pickupOption,
        pickupAddress: pickupOption !== 'No Pickup' ? pickupAddress : '',
        specialInstructions,
        totalAmount,
        pickupFee: pickupOption !== 'No Pickup' ? flatPickupFee : 0
      };

      const res = await fetch(`${API_URL}/api/shelter/public/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Booking request submitted successfully! The provider has been notified.');
        setIsBookOpen(false);
        setBookStep(1);
        setCheckInDate('');
        setCheckOutDate('');
        setSpecialInstructions('');
        fetchDetails();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit booking request.');
      }
    } catch (err) {
      alert('Error creating booking request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Facility Icon Helper
  const getFacilityIcon = (facility) => {
    const lower = facility.toLowerCase();
    if (lower.includes('kennel') || lower.includes('room') || lower.includes('indoor')) return <Building2 size={15} color="#0066CC" />;
    if (lower.includes('play') || lower.includes('outdoor') || lower.includes('yard')) return <PawPrint size={15} color="#0066CC" />;
    if (lower.includes('vet') || lower.includes('medical') || lower.includes('doctor')) return <Activity size={15} color="#0066CC" />;
    if (lower.includes('supervision') || lower.includes('24/7') || lower.includes('care')) return <Clock size={15} color="#0066CC" />;
    if (lower.includes('cctv') || lower.includes('security') || lower.includes('camera')) return <ShieldCheck size={15} color="#0066CC" />;
    if (lower.includes('grooming') || lower.includes('bath') || lower.includes('wash')) return <Sparkles size={15} color="#0066CC" />;
    if (lower.includes('food') || lower.includes('feed') || lower.includes('diet')) return <Heart size={15} color="#0066CC" />;
    return <Check size={15} color="#0066CC" />;
  };

  const reviewsList = shelter.reviews || [];

  return (
    <div className="marketplace-container fade-in" style={{ padding: '20px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* 5. TOP NAVIGATION */}
      <button 
        onClick={onBack}
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 14px', 
          backgroundColor: '#FFFFFF', 
          border: '1px solid #CBD5E1', 
          borderRadius: '8px', 
          cursor: 'pointer', 
          marginBottom: '16px', 
          fontSize: '13px', 
          fontWeight: '600', 
          color: '#334155',
          transition: 'all 0.15s ease'
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#94A3B8'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
      >
        <ArrowLeft size={16} color="#0066CC" />
        <span>Back to Boarding & Temporary Lodging</span>
      </button>

      {/* 6. HERO SECTION */}
      <div 
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          border: '1px solid #E2E8F0', 
          padding: '20px', 
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 280px',
          gap: '24px',
          alignItems: 'center'
        }}
      >
        {/* Left + Center Hero Content */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* Shelter Image */}
          <div style={{ position: 'relative', width: '160px', height: '130px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <img 
              src={shelter.logo || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800'} 
              alt={shelter.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
              <Badge style={{ backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' }}>
                Boarding & Lodging
              </Badge>
            </div>
          </div>

          {/* Center Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>{shelter.name}</h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '12px', color: '#166534', fontSize: '11px', fontWeight: '700' }}>
                <Check size={12} color="#166534" /> Verified
              </span>
            </div>

            {/* Rating & Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '13px', color: '#64748B', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={15} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontWeight: '700', color: '#0F172A' }}>{shelter.rating || '4.9'}</span>
                <span>({reviewsList.length} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={15} color="#0066CC" />
                <span>{shelter.address || 'Central District'}, {shelter.city || 'City'}</span>
              </div>
            </div>

            {/* Highlights Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              {shelter.providesPickup && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: '#EFF6FF', color: '#1E40AF', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid #DBEAFE' }}>
                  <Truck size={14} color="#0066CC" />
                  <span>Home Pickup Available</span>
                </div>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid #DCFCE7' }}>
                <PawPrint size={14} color="#16A34A" />
                <span>{spacesAvailable} Spaces Available</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: '#F8FAFC', color: '#475569', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: '1px solid #E2E8F0' }}>
                <Clock size={14} color="#64748B" />
                <span>Daily Boarding Rate: {pricePerDay} PKR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Booking Panel */}
        <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '700', marginBottom: '2px' }}>
            Starting Boarding Rate
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
            {pricePerDay.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>PKR/day</span>
          </div>
          <button 
            onClick={() => setIsBookOpen(true)}
            disabled={spacesAvailable === 0}
            style={{ 
              width: '100%', 
              padding: '10px 16px', 
              backgroundColor: spacesAvailable > 0 ? '#0066CC' : '#94A3B8', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '700', 
              fontSize: '13px', 
              cursor: spacesAvailable > 0 ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Calendar size={16} />
            <span>{spacesAvailable > 0 ? 'Book Shelter' : 'Fully Booked'}</span>
          </button>
          {shelter.phone && (
            <a 
              href={`tel:${shelter.phone}`}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px', 
                marginTop: '10px', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#0066CC',
                textDecoration: 'none'
              }}
            >
              <Phone size={13} />
              <span>Contact Shelter</span>
            </a>
          )}
        </div>
      </div>

      {/* 7. STRUCTURED TWO-COLUMN CONTENT LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* About This Shelter */}
          <Card style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'none' }}>
            <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <CardTitle style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} color="#0066CC" />
                <span>About This Shelter</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#475569', margin: 0 }}>
                {shelter.description || 'This shelter provides high-quality lodging, pet supervision, and temporary care for your pets with dedicated staff and clean facilities.'}
              </p>
            </CardContent>
          </Card>

          {/* 8. FACILITIES & AMENITIES */}
          <Card style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'none' }}>
            <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <CardTitle style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} color="#0066CC" />
                <span>Facilities & Amenities</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px 20px' }}>
              {shelter.facilities?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                  {shelter.facilities.map((fac, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px 12px', 
                        backgroundColor: '#F8FAFC', 
                        borderRadius: '8px', 
                        border: '1px solid #E2E8F0',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#334155'
                      }}
                    >
                      {getFacilityIcon(fac)}
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fac}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Standard lodging and pet amenities provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Shelter Rules */}
          {shelter.rules?.length > 0 && (
            <Card style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'none' }}>
              <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
                <CardTitle style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#0066CC" />
                  <span>Shelter Rules & Guidelines</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {shelter.rules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#475569' }}>
                      <Check size={15} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 9. CAPACITY SECTION */}
          <Card style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'none' }}>
            <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <CardTitle style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PawPrint size={16} color="#0066CC" />
                <span>Shelter Capacity</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: spacesAvailable > 0 ? '#16A34A' : '#EF4444', lineHeight: 1 }}>
                {spacesAvailable} / {shelter.capacity || 10}
              </div>
              <p style={{ marginTop: '6px', marginBottom: '12px', fontSize: '12px', fontWeight: '600', color: '#64748B' }}>
                Spaces Available Currently
              </p>
              
              {/* Progress Indicator */}
              <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.max(10, Math.min(100, (spacesAvailable / (shelter.capacity || 10)) * 100))}%`, 
                    backgroundColor: spacesAvailable > 2 ? '#16A34A' : (spacesAvailable > 0 ? '#F59E0B' : '#EF4444'),
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#94A3B8' }}>
                <span>Occupied: {shelter.occupiedSpaces || 0}</span>
                <span>Total: {shelter.capacity || 10}</span>
              </div>
            </CardContent>
          </Card>

          {/* 10. BOARDING SERVICES */}
          <Card style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'none' }}>
            <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <CardTitle style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="#0066CC" />
                <span>Boarding Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '12px 20px' }}>
              {shelter.services?.length > 0 ? (
                shelter.services.map((srv, idx) => (
                  <div key={srv.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx < shelter.services.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{srv.name}</div>
                      {srv.maxCapacity && (
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Capacity: {srv.maxCapacity} pets</div>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0066CC' }}>
                      {srv.dailyRate} PKR<span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>/day</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Daily Boarding Rate</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0066CC' }}>{pricePerDay} PKR/day</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 11. PICKUP SERVICE */}
          <Card style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'none' }}>
            <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
              <CardTitle style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} color="#0066CC" />
                <span>Pickup Service</span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '16px 20px' }}>
              {shelter.providesPickup ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Badge style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #DBEAFE', fontSize: '11px', fontWeight: '700' }}>
                      Home Pickup Available
                    </Badge>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Service Radius:</strong> Within {shelter.pickupRadius || 15} km</div>
                    <div><strong>Fee Type:</strong> {shelter.pickupFeeType || 'Flat Rate'}</div>
                    {shelter.pickupFee > 0 && (
                      <div><strong>Flat Fee:</strong> {shelter.pickupFee} PKR</div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Home pickup is not currently offered by this shelter.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 12. REVIEWS SECTION */}
      <div style={{ marginTop: '24px' }}>
        <Card style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'none' }}>
          <CardHeader style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#0066CC" />
              <span>Customer Reviews</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '12px' }}>
                {reviewsList.length}
              </span>
            </CardTitle>

            {reviewsList.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Sort by:</span>
                <select 
                  value={reviewSort} 
                  onChange={(e) => setReviewSort(e.target.value)}
                  style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#334155', fontWeight: '600' }}
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest Rating</option>
                </select>
              </div>
            )}
          </CardHeader>
          
          <CardContent style={{ padding: '20px' }}>
            {reviewsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748B' }}>
                <MessageSquare size={32} color="#94A3B8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>No reviews posted yet</p>
                <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Be the first pet owner to leave a review after your booking stay.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviewsList.map((rev, idx) => (
                  <div 
                    key={rev.id || idx} 
                    style={{ 
                      paddingBottom: idx < reviewsList.length - 1 ? '16px' : '0', 
                      borderBottom: idx < reviewsList.length - 1 ? '1px solid #F1F5F9' : 'none' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* User Avatar Circle */}
                        <div 
                          style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            backgroundColor: '#EFF6FF', 
                            color: '#0066CC', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: '700', 
                            fontSize: '13px',
                            border: '1px solid #DBEAFE'
                          }}
                        >
                          {(rev.user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                            {rev.user?.name || 'Anonymous Pet Owner'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Stay'}
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < (rev.rating || 5) ? '#F59E0B' : 'none'} 
                            color={i < (rev.rating || 5) ? '#F59E0B' : '#CBD5E1'} 
                          />
                        ))}
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#475569', marginTop: '10px', marginBottom: '0' }}>
                      {rev.comment}
                    </p>

                    {rev.response && (
                      <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#F8FAFC', borderLeft: '3px solid #0066CC', borderRadius: '4px', fontSize: '12px', color: '#334155' }}>
                        <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>Shelter Provider Reply</div>
                        <div>{rev.response}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 16. STEPPER DIALOG FOR BOOKING (UNTOUCHED FUNCTIONALITY) */}
      {isBookOpen && (
        <div className="dialog-overlay">
          <div className="dialog-box" style={{ maxWidth: '520px' }}>
            <div className="dialog-header">
              <h3>Request Boarding Stay</h3>
              <button onClick={() => setIsBookOpen(false)}><X size={16} /></button>
            </div>
            <div className="dialog-body" style={{ padding: '24px' }}>
              {/* Progress bar */}
              <div className="stepper-progress" style={{ marginBottom: '16px' }}>
                <div className="progress-bar" style={{ width: `${(bookStep / 5) * 100}%` }}></div>
              </div>

              {bookStep === 1 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 1: Select Your Pet</h4>
                  {userPets.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#EF4444' }}>No registered pets found. Please add a pet profile first.</p>
                  ) : (
                    <select value={selectedPetId} onChange={(e) => setSelectedPetId(e.target.value)}>
                      {userPets.map(p => (
                        <option key={p._id} value={p._id}>{p.name} ({p.breed})</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {bookStep === 2 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 2: Select Lodging Service</h4>
                  <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
                    {shelter.services?.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.dailyRate} PKR/day)</option>
                    ))}
                  </select>
                </div>
              )}

              {bookStep === 3 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 3: Select Stay Dates</h4>
                  <label>Check-In Date</label>
                  <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
                  <label style={{ marginTop: '12px' }}>Check-Out Date</label>
                  <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
                </div>
              )}

              {bookStep === 4 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 4: Pickup & Care Requirements</h4>
                  {shelter.providesPickup ? (
                    <>
                      <label>Pickup Preference</label>
                      <select value={pickupOption} onChange={(e) => setPickupOption(e.target.value)}>
                        <option value="No Pickup">No Pickup Required</option>
                        <option value="Home Pickup">Home Pickup Only</option>
                        <option value="Home Drop-off">Home Drop-off Only</option>
                        <option value="Both">Both Pickup & Drop-off</option>
                      </select>
                      {pickupOption !== 'No Pickup' && (
                        <>
                          <label style={{ marginTop: '12px' }}>Pickup Address</label>
                          <input type="text" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} />
                        </>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#64748B' }}>Home pickup is not supported by this shelter.</p>
                  )}

                  <label style={{ marginTop: '12px' }}>Special Instructions / Diet / Medication</label>
                  <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="Aggressive tendencies, medical history details..." />
                </div>
              )}

              {bookStep === 5 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 5: Stay Summary & Price</h4>
                  <div className="preview-box">
                    <p><strong>Service:</strong> {service.name}</p>
                    <p><strong>Period:</strong> {checkInDate} to {checkOutDate} ({days} Days)</p>
                    <p><strong>Daily Lodging Price:</strong> {pricePerDay} PKR</p>
                    <p><strong>Pickup Fee:</strong> {pickupOption !== 'No Pickup' ? `${flatPickupFee} PKR` : '0 PKR'}</p>
                    <Separator style={{ margin: '8px 0' }} />
                    <p><strong>Total Cost:</strong> <strong>{totalAmount} PKR</strong></p>
                  </div>
                </div>
              )}
            </div>
            <div className="dialog-footer">
              {bookStep > 1 && (
                <button className="btn-cancel" onClick={() => setBookStep(bookStep - 1)}>Back</button>
              )}
              {bookStep < 5 ? (
                <button className="btn-save" onClick={() => setBookStep(bookStep + 1)}>Next</button>
              ) : (
                <button className="btn-save" onClick={handleCreateBooking} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Confirm Booking Request'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

