import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { MapPin, Star, Truck, Calendar, Sparkles, Building2, Check, Clock, MessageSquare, AlertTriangle, X } from 'lucide-react';
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
        <div className="spinner-loader" style={{ borderColor: 'var(--color-primary)' }}></div>
        <p style={{ marginTop: '16px', color: '#64748B' }}>Fetching shelter amenities and reviews...</p>
      </div>
    );
  }

  if (!shelter) return null;

  // Calculate pricing
  const service = shelter.services?.find(s => s.id === selectedServiceId) || shelter;
  const pricePerDay = service.dailyRate || shelter.dailyRate || 1000;
  const days = (checkInDate && checkOutDate) 
    ? Math.max(1, Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)))
    : 1;

  const flatPickupFee = shelter.providesPickup && shelter.pickupFeeType === 'Paid' ? (shelter.pickupFee || 0) : 0;
  const pickupFeeText = shelter.providesPickup ? `${shelter.pickupFeeType} (Flat: ${shelter.pickupFee} PKR)` : 'N/A';
  const totalAmount = (pricePerDay * days) + (pickupOption !== 'No Pickup' ? flatPickupFee : 0);

  const spacesAvailable = Math.max(0, shelter.capacity - shelter.occupiedSpaces);

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
        fetchDetails(); // Refresh spaces
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

  return (
    <div className="marketplace-container fade-in" style={{ padding: '24px' }}>
      <button 
        onClick={onBack}
        style={{ padding: '8px 16px', background: 'none', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px', fontSize: '13px', fontWeight: '600' }}
      >
        ← Back to Discovery
      </button>

      {/* Hero Header */}
      <div style={{ position: 'relative', height: '260px', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
        <img 
          src={shelter.logo || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800'} 
          alt="Shelter Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0) 100%)', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: '#FFFFFF' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>{shelter.name}</h1>
              <Badge variant="success">Verified</Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '14px', opacity: 0.9 }}>
              <MapPin size={14} />
              <span>{shelter.address}, {shelter.city}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => setIsBookOpen(true)}
              style={{ padding: '12px 28px', backgroundColor: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              disabled={spacesAvailable === 0}
            >
              {spacesAvailable > 0 ? 'Book Shelter' : 'Fully Booked'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column */}
        <div>
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader><CardTitle>About Our Shelter</CardTitle></CardHeader>
            <CardContent>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>{shelter.description || 'No description provided.'}</p>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <CardHeader><CardTitle>Facilities & Perks</CardTitle></CardHeader>
            <CardContent>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {shelter.facilities?.length > 0 ? (
                  shelter.facilities.map(f => (
                    <Badge key={f} style={{ backgroundColor: '#F1F5F9', color: '#334155', padding: '8px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      {f}
                    </Badge>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#64748B' }}>Standard spaces provided.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {shelter.providesPickup && (
            <Card style={{ marginBottom: '24px' }}>
              <CardHeader><CardTitle>Pickup Service Details</CardTitle></CardHeader>
              <CardContent style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <Truck size={36} color="var(--color-primary)" />
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' }}>Home Pickup Available</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                    Available within {shelter.pickupRadius} km. Pickup Type: {shelter.pickupServiceType}. Flat Fee: {shelter.pickupFee} PKR.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <Card>
            <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
            <CardContent>
              {shelter.reviews?.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', padding: '16px' }}>No reviews posted yet.</p>
              ) : (
                shelter.reviews?.map(r => (
                  <div key={r.id} style={{ marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.user?.name || 'Anonymous User'}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < r.rating ? '#F59E0B' : 'none'} color="#F59E0B" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>{r.comment}</p>
                    {r.response && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#F8FAFC', borderLeft: '3px solid var(--color-primary)', borderRadius: '4px', fontSize: '12px', color: '#475569' }}>
                        <strong>Shelter reply:</strong> {r.response}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div>
          <Card style={{ marginBottom: '24px', border: '1px solid #E2E8F0' }}>
            <CardHeader><CardTitle>Shelter Capacity</CardTitle></CardHeader>
            <CardContent>
              <div style={{ fontSize: '24px', fontWeight: '800', textAlign: 'center', marginBottom: '8px', color: spacesAvailable > 0 ? '#16A34A' : '#EF4444' }}>
                {spacesAvailable} / {shelter.capacity}
              </div>
              <p style={{ textAlign: 'center', margin: 0, fontSize: '12px', color: '#64748B' }}>Spaces Available Currently</p>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: '24px' }}>
            <CardHeader><CardTitle>Boarding Services</CardTitle></CardHeader>
            <CardContent>
              {shelter.services?.length > 0 ? (
                shelter.services.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <strong style={{ fontSize: '13px' }}>{s.name}</strong>
                      <small style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>Capacity: {s.maxCapacity} pets</small>
                    </div>
                    <strong>{s.dailyRate} PKR/day</strong>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span>Daily Boarding Rate</span>
                  <strong>{shelter.dailyRate} PKR/day</strong>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Shelter Rules</CardTitle></CardHeader>
            <CardContent>
              {shelter.rules?.length > 0 ? (
                shelter.rules.map(r => (
                  <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px', color: '#475569' }}>
                    <Check size={14} color="#16A34A" />
                    <span>{r}</span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: '#64748B' }}>No specific rules enforced.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stepper Dialog for Booking */}
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
