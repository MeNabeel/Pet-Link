import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  MapPin, Star, Truck, Calendar, Sparkles, Check, Clock, 
  MessageSquare, AlertTriangle, X, ShieldAlert, ArrowRight, User,
  Phone, Globe, Map
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ClinicDetails({ user, clinicId, onBack, onNavigateToAddPet }) {
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState([]);

  // Booking Flow Stepper states
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [bookStep, setBookStep] = useState(1);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/clinics/${clinicId}`);
      if (res.ok) {
        const data = await res.json();
        setClinic(data);
        if (data.services?.length > 0) {
          setSelectedServiceId(data.services[0].id);
        }
        if (data.doctors?.length > 0) {
          setSelectedDoctorId(data.doctors[0].id);
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
  }, [clinicId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', minHeight: '60vh', justifyContent: 'center' }}>
        <div className="spinner-loader" style={{ borderColor: 'var(--color-primary)' }}></div>
        <p style={{ marginTop: '16px', color: '#64748B' }}>Fetching place coordinates from Google Platform API...</p>
      </div>
    );
  }

  if (!clinic) return null;

  const service = clinic.services?.find(s => s.id === selectedServiceId) || { name: 'General Consultation', price: clinic.startingFee || 1000 };
  const doctor = clinic.doctors?.find(d => d.id === selectedDoctorId) || { name: 'Duty Veterinarian' };
  const pet = userPets.find(p => p._id === selectedPetId) || { name: 'Unnamed Pet' };

  const handleCreateBooking = async () => {
    setSubmitting(true);
    try {
      const payload = {
        clinicId: clinic.clinicId, // maps to Supabase primary key
        serviceId: selectedServiceId || null,
        doctorId: selectedDoctorId || null,
        petId: selectedPetId,
        appointmentDate,
        appointmentTime,
        notes
      };

      const res = await fetch(`${API_URL}/api/clinics/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Appointment requested successfully!');
        setIsBookOpen(false);
        setBookStep(1);
        setAppointmentDate('');
        setAppointmentTime('');
        setNotes('');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit appointment request.');
      }
    } catch (err) {
      alert('Error creating appointment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Maps Directions URL
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.formattedAddress)}`;

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
          src={clinic.photo || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800'} 
          alt="Clinic Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0) 100%)', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: '#FFFFFF' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{clinic.name}</h1>
              {clinic.connected ? (
                <Badge variant="success">PetLink Connected</Badge>
              ) : (
                <Badge variant="secondary">Places Partner</Badge>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '14px', opacity: 0.9 }}>
              <MapPin size={14} />
              <span>{clinic.formattedAddress}</span>
            </div>
          </div>
          {clinic.connected && (
            <button 
              onClick={() => setIsBookOpen(true)}
              style={{ padding: '12px 28px', backgroundColor: 'var(--color-primary)', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            >
              Book Appointment
            </button>
          )}
        </div>
      </div>

      {/* External Places Info Warning Banner */}
      {!clinic.connected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', borderRadius: '8px', marginBottom: '24px' }}>
          <AlertTriangle size={20} color="#3B82F6" />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1E3A8A' }}>External Clinic Listing</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#1E40AF' }}>
              This clinic is not connected to the PetLink Online Booking ecosystem. You can still reach out via phone, visit their website, or get map directions.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Column */}
        <div>
          {/* About / Description */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', margin: 0 }}>
                {clinic.description || `Real-world veterinary clinic listed via Google Places API in ${clinic.formattedAddress}. Connect with them directly using standard communication channels.`}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader><CardTitle>Contact & Navigation Actions</CardTitle></CardHeader>
            <CardContent style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {clinic.phone ? (
                <a 
                  href={`tel:${clinic.phone}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#F1F5F9', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', textDecoration: 'none' }}
                >
                  <Phone size={14} />
                  <span>Call: {clinic.phone}</span>
                </a>
              ) : (
                <span style={{ fontSize: '13px', color: '#94A3B8', padding: '10px 16px' }}>Phone not listed</span>
              )}

              {clinic.website && (
                <a 
                  href={clinic.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#F1F5F9', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', textDecoration: 'none' }}
                >
                  <Globe size={14} />
                  <span>Visit Website</span>
                </a>
              )}

              <a 
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#EFF6FF', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                <Map size={14} />
                <span>Get Directions</span>
              </a>
            </CardContent>
          </Card>

          {/* Veterinarians (Connected Clinics Only) */}
          {clinic.connected && (
            <Card style={{ marginBottom: '24px' }}>
              <CardHeader><CardTitle>Our Veterinary Doctors</CardTitle></CardHeader>
              <CardContent style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {clinic.doctors?.length > 0 ? (
                  clinic.doctors.map(d => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 16px', minWidth: '220px' }}>
                      <img src={d.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'} alt="Doctor" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A' }}>{d.name}</strong>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>{d.specialization}</span>
                        <small style={{ display: 'block', fontSize: '11px', color: '#059669', fontWeight: '600' }}>{d.experience} Years Exp.</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#64748B' }}>Any duty veterinarian will attend.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* User Reviews */}
          <Card>
            <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
            <CardContent>
              {clinic.reviews?.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', padding: '16px' }}>No PetLink patient reviews posted yet.</p>
              ) : (
                clinic.reviews?.map(r => (
                  <div key={r.id} style={{ marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.userName || 'Anonymous User'}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < r.rating ? '#F59E0B' : 'none'} color="#F59E0B" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px', margin: 0 }}>{r.comment}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div>
          {/* Services list (Connected Only) */}
          {clinic.connected && (
            <Card style={{ marginBottom: '24px' }}>
              <CardHeader><CardTitle>PetLink Booking Services</CardTitle></CardHeader>
              <CardContent>
                {clinic.services?.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <strong style={{ fontSize: '13px' }}>{s.name}</strong>
                      <small style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>Duration: {s.duration} mins</small>
                    </div>
                    <strong>{s.price} PKR</strong>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Operating hours */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader><CardTitle>Operating Hours</CardTitle></CardHeader>
            <CardContent>
              {clinic.weekdayDescriptions && clinic.weekdayDescriptions.length > 0 ? (
                clinic.weekdayDescriptions.map(desc => (
                  <div key={desc} style={{ padding: '6px 0', fontSize: '13px', borderBottom: '1px dashed #F1F5F9', color: desc.toLowerCase().includes('closed') ? '#EF4444' : '#334155' }}>
                    {desc}
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                  <span>Mon - Sat</span>
                  <span>09:00 AM - 09:00 PM</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stepper dialog */}
      {isBookOpen && clinic.connected && (
        <div className="dialog-overlay">
          <div className="dialog-box" style={{ maxWidth: '520px' }}>
            <div className="dialog-header">
              <h3>Schedule Veterinary Slot</h3>
              <button onClick={() => setIsBookOpen(false)}><X size={16} /></button>
            </div>
            <div className="dialog-body" style={{ padding: '24px' }}>
              <div className="stepper-progress" style={{ marginBottom: '16px' }}>
                <div className="progress-bar" style={{ width: `${(bookStep / 5) * 100}%` }}></div>
              </div>

              {bookStep === 1 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 1: Select Your Pet</h4>
                  {userPets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <p style={{ fontSize: '13px', color: '#EF4444', marginBottom: '12px' }}>You need to add a pet before booking an appointment.</p>
                      <button 
                        onClick={() => {
                          setIsBookOpen(false);
                          if (onNavigateToAddPet) onNavigateToAddPet();
                        }}
                        style={{ padding: '8px 16px', backgroundColor: 'var(--color-primary)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Add Pet Profile
                      </button>
                    </div>
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
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 2: Select Treatment Service</h4>
                  <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
                    {clinic.services?.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.price} PKR)</option>
                    ))}
                  </select>
                </div>
              )}

              {bookStep === 3 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 3: Select Doctor</h4>
                  <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)}>
                    {clinic.doctors?.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
              )}

              {bookStep === 4 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 4: Date & Time</h4>
                  <label>Appointment Date</label>
                  <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
                  
                  <label style={{ marginTop: '12px' }}>Appointment Time Slot</label>
                  <select value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)}>
                    <option value="">Choose Time Slot</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>

                  <label style={{ marginTop: '12px' }}>Symptoms / Notes for Doctor</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fever, grooming notes..." />
                </div>
              )}

              {bookStep === 5 && (
                <div>
                  <h4 style={{ margin: '0 0 16px 0' }}>Step 5: Booking Review & Price</h4>
                  <div className="preview-box">
                    <p><strong>Clinic:</strong> {clinic.name}</p>
                    <p><strong>Pet:</strong> {pet.name}</p>
                    <p><strong>Service:</strong> {service.name}</p>
                    <p><strong>Doctor:</strong> {doctor.name}</p>
                    <p><strong>Schedule:</strong> {appointmentDate} at {appointmentTime}</p>
                    <Separator style={{ margin: '8px 0' }} />
                    <p><strong>Total Amount:</strong> <strong>{service.price} PKR</strong></p>
                  </div>
                </div>
              )}
            </div>
            <div className="dialog-footer">
              {bookStep > 1 && (
                <button className="btn-cancel" onClick={() => setBookStep(bookStep - 1)}>Back</button>
              )}
              {bookStep < 5 ? (
                <button className="btn-save" onClick={() => setBookStep(bookStep + 1)} disabled={bookStep === 1 && userPets.length === 0}>Next</button>
              ) : (
                <button className="btn-save" onClick={handleCreateBooking} disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Confirm Appointment Request'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
