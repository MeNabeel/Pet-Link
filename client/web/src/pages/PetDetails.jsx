import React, { useState, useEffect } from 'react';
import { 
  Pencil, Trash2, HeartPulse, Syringe, FilePlus2, 
  X, CheckCircle, Calendar, ShieldCheck, Heart, User, MapPin, 
  ChevronRight, ArrowLeft 
} from 'lucide-react';
import './PetDetails.css';

export default function PetDetails({ petId, onBack, onEdit, onDeleteSuccess }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal / Drawer active states
  const [activeDrawer, setActiveDrawer] = useState(null); // 'health' | 'vaccine' | 'medical' | 'deleteConfirm'

  // Add Vaccine Form state
  const [vName, setVName] = useState('');
  const [vDose, setVDose] = useState('');
  const [vDate, setVDate] = useState('');
  const [vNextDate, setVNextDate] = useState('');
  const [vVet, setVVet] = useState('');
  const [vNotes, setVNotes] = useState('');

  // Add Medical Record Form state
  const [mDisease, setMDisease] = useState('');
  const [mSymptoms, setMSymptoms] = useState('');
  const [mDiagnosis, setMDiagnosis] = useState('');
  const [mTreatment, setMTreatment] = useState('');
  const [mMedicine, setMMedicine] = useState('');
  const [mDoctor, setMDoctor] = useState('');
  const [mClinic, setMClinic] = useState('');
  const [mVisitDate, setMVisitDate] = useState('');
  const [mNextVisit, setMNextVisit] = useState('');
  const [mAttachment, setMAttachment] = useState('');

  const fetchPetDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}`);
      const data = await response.json();
      if (response.ok) {
        setPet(data);
      }
    } catch (err) {
      console.error('Error fetching pet details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (petId) {
      fetchPetDetails();
    }
  }, [petId]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setActiveDrawer(null);
        onDeleteSuccess();
      } else {
        alert('Failed to delete pet companion.');
      }
    } catch (err) {
      console.error('Error deleting pet:', err);
    }
  };

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    if (!vName || !vDate) {
      alert('Vaccine Name and Date are required.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}/vaccine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaccineName: vName,
          dose: vDose,
          date: vDate,
          nextDueDate: vNextDate,
          veterinarian: vVet,
          notes: vNotes
        }),
      });

      if (response.ok) {
        setVName(''); setVDose(''); setVDate(''); setVNextDate(''); setVVet(''); setVNotes('');
        setActiveDrawer('health'); // Redirect to health logs timeline drawer
        fetchPetDetails();
      } else {
        alert('Failed to log vaccination entry.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMedical = async (e) => {
    e.preventDefault();
    if (!mDisease || !mVisitDate) {
      alert('Disease and Visit Date are required.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}/medical-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: mDisease,
          symptoms: mSymptoms,
          diagnosis: mDiagnosis,
          treatment: mTreatment,
          medicine: mMedicine,
          doctor: mDoctor,
          clinic: mClinic,
          visitDate: mVisitDate,
          nextVisitDate: mNextVisit,
          attachments: mAttachment ? [mAttachment] : [],
        }),
      });

      if (response.ok) {
        setMDisease(''); setMSymptoms(''); setMDiagnosis(''); setMTreatment(''); setMMedicine(''); setMDoctor(''); setMClinic(''); setMVisitDate(''); setMNextVisit(''); setMAttachment('');
        setActiveDrawer('health'); // Redirect to health logs timeline drawer
        fetchPetDetails();
      } else {
        alert('Failed to log medical visitation.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Base64 attachment reader
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMAttachment(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Retrieving pet companion profile...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Pet companion profile not found.</p>
        <button className="pet-btn-outline" onClick={onBack} style={{ margin: '20px auto' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pet-details-container fade-in">
      
      {/* Back Header Nav */}
      <div style={{ marginBottom: '20px' }}>
        <button className="pet-btn-outline" onClick={onBack} style={{ border: 'none', paddingLeft: 0 }}>
          <ArrowLeft size={16} />
          Back to list
        </button>
      </div>

      {/* Hero Banner Grid Card */}
      <div className="pet-details-hero">
        <div className="pet-details-hero-img-wrapper">
          {pet.image ? (
            <img src={pet.image} alt={pet.name} className="pet-details-hero-img" />
          ) : (
            <div className="pet-details-hero-placeholder">
              <ChevronRight size={64} />
            </div>
          )}
          
          <div className="pet-details-badges-row">
            <span className="pet-details-badge adoption">{pet.adoptionStatus}</span>
            <span className={`pet-details-badge status ${pet.activeStatus.toLowerCase()}`}>{pet.activeStatus}</span>
          </div>
        </div>

        <div className="pet-details-hero-content">
          <div className="pet-details-hero-title-area">
            <h2 className="pet-details-hero-name">{pet.name}</h2>
            <span className="pet-details-hero-breed">{pet.breed} • {pet.species}</span>
          </div>

          {/* Action Toolbar buttons group */}
          <div className="pet-details-action-group">
            <button className="pet-btn-outline" onClick={() => setActiveDrawer('health')}>
              <HeartPulse size={14} />
              View Health Record
            </button>
            <button className="pet-btn-outline" onClick={() => setActiveDrawer('vaccine')}>
              <Syringe size={14} />
              Add Vaccine
            </button>
          </div>
        </div>
      </div>

      {/* Details Sections Cards Grid */}
      <div className="pet-details-info-grid">
        
        {/* Card 1: Basic Information */}
        <div className="pet-info-card">
          <h4 className="pet-info-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--color-primary)" />
              Basic Information
            </span>
            <button className="pet-section-edit-btn" onClick={() => onEdit(pet._id)} title="Edit Basic Info">
              <Pencil size={13} />
            </button>
          </h4>
          <div className="pet-info-list">
            <div className="pet-info-item">
              <span className="pet-info-item-label">Name</span>
              <span className="pet-info-item-value">{pet.name}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Species</span>
              <span className="pet-info-item-value">{pet.species}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Breed</span>
              <span className="pet-info-item-value">{pet.breed}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Age</span>
              <span className="pet-info-item-value">{pet.age}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Gender</span>
              <span className="pet-info-item-value">{pet.gender}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Weight</span>
              <span className="pet-info-item-value">{pet.weight}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Color</span>
              <span className="pet-info-item-value">{pet.color || 'N/A'}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Size</span>
              <span className="pet-info-item-value">{pet.size || 'N/A'}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Microchip ID</span>
              <span className="pet-info-item-value">{pet.microchipNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: About Pet */}
        <div className="pet-info-card">
          <h4 className="pet-info-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={16} color="#EC4899" />
              About Pet & Behaviour
            </span>
            <button className="pet-section-edit-btn" onClick={() => onEdit(pet._id)} title="Edit Behaviour Info">
              <Pencil size={13} />
            </button>
          </h4>
          <div className="pet-info-list">
            <div className="pet-info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', border: 'none' }}>
              <span className="pet-info-item-label">Biography</span>
              <span className="pet-info-item-value" style={{ maxWidth: '100%', textAlign: 'left', marginTop: '6px' }}>
                {pet.aboutPet || 'No bio registered.'}
              </span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Kids Friendly</span>
              <span className="pet-info-item-value">{pet.friendlyWithKids ? 'Yes' : 'No'}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Pets Friendly</span>
              <span className="pet-info-item-value">{pet.friendlyWithPets ? 'Yes' : 'No'}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Training Level</span>
              <span className="pet-info-item-value">{pet.trainingLevel}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Neutered / Spayed</span>
              <span className="pet-info-item-value">{pet.neuteredSpayed ? 'Yes' : 'No'}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Behaviour Style</span>
              <span className="pet-info-item-value">{pet.behaviour || 'N/A'}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Personality Type</span>
              <span className="pet-info-item-value">{pet.personality || 'N/A'}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Food Preference</span>
              <span className="pet-info-item-value">{pet.foodPreference || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Location */}
        <div className="pet-info-card">
          <h4 className="pet-info-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#EAB308" />
              Location Details
            </span>
            <button className="pet-section-edit-btn" onClick={() => onEdit(pet._id)} title="Edit Location Info">
              <Pencil size={13} />
            </button>
          </h4>
          <div className="pet-info-list">
            <div className="pet-info-item">
              <span className="pet-info-item-label">Country</span>
              <span className="pet-info-item-value">{pet.country}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">Province</span>
              <span className="pet-info-item-value">{pet.province}</span>
            </div>
            <div className="pet-info-item">
              <span className="pet-info-item-label">City</span>
              <span className="pet-info-item-value">{pet.city}</span>
            </div>
            <div className="pet-info-item" style={{ border: 'none' }}>
              <span className="pet-info-item-label">Address</span>
              <span className="pet-info-item-value">{pet.address || 'N/A'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Health Record Logs Drawer */}
      {activeDrawer === 'health' && (
        <div className="pet-details-drawer-overlay" onClick={() => setActiveDrawer(null)}>
          <div className="pet-details-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pet-drawer-header">
              <h3 className="pet-drawer-title">{pet.name}'s Medical Health Log</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="pet-btn-outline" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => setActiveDrawer('medical')}>
                  <FilePlus2 size={12} />
                  Add Medical Record
                </button>
                <button className="pet-btn-outline danger" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => setActiveDrawer('deleteConfirm')}>
                  <Trash2 size={12} />
                  Delete Pet
                </button>
                <button className="pet-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="pet-info-list" style={{ marginBottom: '24px' }}>
              <div className="pet-grid-2">
                <div className="pet-info-item">
                  <span className="pet-info-item-label">Blood Group</span>
                  <span className="pet-info-item-value">{pet.bloodGroup || 'Not specified'}</span>
                </div>
                <div className="pet-info-item">
                  <span className="pet-info-item-label">Vaccination Status</span>
                  <span className="pet-info-item-value">{pet.isVaccinated ? 'Vaccinated' : 'Not Vaccinated'}</span>
                </div>
              </div>
              <div className="pet-info-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="pet-info-item-label">Allergies Log</span>
                <span className="pet-info-item-value" style={{ width: '100%', textAlign: 'left', marginTop: '4px' }}>
                  {pet.allergies || 'No allergies recorded.'}
                </span>
              </div>
              <div className="pet-info-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="pet-info-item-label">Chronic Diseases</span>
                <span className="pet-info-item-value" style={{ width: '100%', textAlign: 'left', marginTop: '4px' }}>
                  {pet.diseases || 'No chronic diseases recorded.'}
                </span>
              </div>
              <div className="pet-info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', border: 'none' }}>
                <span className="pet-info-item-label">General Medical Summary</span>
                <span className="pet-info-item-value" style={{ width: '100%', textAlign: 'left', marginTop: '4px' }}>
                  {pet.medicalHistory || 'No past surgical history logged.'}
                </span>
              </div>
            </div>

            {/* Document Attachments files */}
            {pet.documents && pet.documents.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h4 className="pet-drawer-title" style={{ fontSize: '14px', marginBottom: '12px' }}>Uploaded Documents ({pet.documents.length})</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {pet.documents.map((doc, i) => (
                    <div key={i} className="pet-timeline-doc-tag" onClick={() => window.open(doc.data)}>
                      <span>{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timelines logs */}
            <h4 className="pet-drawer-title" style={{ fontSize: '14px', marginBottom: '8px' }}>Treatment & Vaccination History Timeline</h4>
            <div className="pet-timeline-container">
              
              {/* Render Vaccines logs */}
              {pet.vaccines && pet.vaccines.map((vac, idx) => (
                <div key={`vac-${idx}`} className="pet-timeline-item">
                  <div className="pet-timeline-dot" style={{ backgroundColor: '#16A34A' }} />
                  <span className="pet-timeline-date">{vac.date}</span>
                  <h5 className="pet-timeline-title">Vaccinated: {vac.vaccineName} ({vac.dose})</h5>
                  <p className="pet-timeline-body">
                    <strong>Veterinarian:</strong> {vac.veterinarian || 'Not specified'}<br />
                    {vac.notes && <span><strong>Notes:</strong> {vac.notes}<br /></span>}
                    {vac.nextDueDate && <span style={{ color: '#EAB308', fontWeight: '700' }}>Next Due: {vac.nextDueDate}</span>}
                  </p>
                </div>
              ))}

              {/* Render Medical Records logs */}
              {pet.medicalRecords && pet.medicalRecords.map((med, idx) => (
                <div key={`med-${idx}`} className="pet-timeline-item">
                  <div className="pet-timeline-dot" style={{ backgroundColor: '#EF4444' }} />
                  <span className="pet-timeline-date">{med.visitDate}</span>
                  <h5 className="pet-timeline-title">Clinic Visit: {med.disease}</h5>
                  <p className="pet-timeline-body">
                    <strong>Symptoms:</strong> {med.symptoms}<br />
                    <strong>Diagnosis:</strong> {med.diagnosis}<br />
                    <strong>Treatment:</strong> {med.treatment}<br />
                    <strong>Medicine:</strong> {med.medicine}<br />
                    <strong>Doctor/Clinic:</strong> {med.doctor} at {med.clinic}<br />
                    {med.nextVisitDate && <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Follow up: {med.nextVisitDate}</span>}
                  </p>
                  {med.attachments && med.attachments.map((att, i) => (
                    <div key={i} className="pet-timeline-doc-tag" onClick={() => window.open(att)}>
                      <span>Attachment {i + 1}</span>
                    </div>
                  ))}
                </div>
              ))}

              {(!pet.vaccines || pet.vaccines.length === 0) && (!pet.medicalRecords || pet.medicalRecords.length === 0) && (
                <p style={{ fontSize: '12px', color: 'var(--color-muted)', paddingLeft: '8px' }}>No medical history timelines registered.</p>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Add Vaccine form drawer */}
      {activeDrawer === 'vaccine' && (
        <div className="pet-details-drawer-overlay" onClick={() => setActiveDrawer(null)}>
          <div className="pet-details-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pet-drawer-header">
              <h3 className="pet-drawer-title">Log Vaccination Entry</h3>
              <button className="pet-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddVaccine}>
              <div className="form-group">
                <label className="form-label">Vaccine Name *</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. DHPP, Rabies"
                  value={vName} 
                  onChange={(e) => setVName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dose Number / Info</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. 1st Dose, Booster"
                  value={vDose} 
                  onChange={(e) => setVDose(e.target.value)} 
                />
              </div>
              <div className="pet-modal-row">
                <div className="form-group">
                  <label className="form-label">Vaccination Date *</label>
                  <input 
                    type="date" 
                    className="form-control login-input" 
                    value={vDate} 
                    onChange={(e) => setVDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Next Due Date</label>
                  <input 
                    type="date" 
                    className="form-control login-input" 
                    value={vNextDate} 
                    onChange={(e) => setVNextDate(e.target.value)} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Veterinarian Name</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. Dr. Haris"
                  value={vVet} 
                  onChange={(e) => setVVet(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea 
                  className="form-control login-input" 
                  style={{ height: '70px', padding: '10px' }}
                  placeholder="Additional observations..."
                  value={vNotes}
                  onChange={(e) => setVNotes(e.target.value)}
                />
              </div>

              <div className="pet-modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="pet-modal-btn-cancel" onClick={() => setActiveDrawer(null)}>
                  Cancel
                </button>
                <button type="submit" className="pet-modal-btn-save">
                  Save Vaccine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medical Record form drawer */}
      {activeDrawer === 'medical' && (
        <div className="pet-details-drawer-overlay" onClick={() => setActiveDrawer(null)}>
          <div className="pet-details-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pet-drawer-header">
              <h3 className="pet-drawer-title">Log Clinic Consultation</h3>
              <button className="pet-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMedical}>
              <div className="form-group">
                <label className="form-label">Disease / Reason *</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. Ear Infection, Yearly Checkup"
                  value={mDisease} 
                  onChange={(e) => setMDisease(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Observed Symptoms</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. Redness, scratching ear"
                  value={mSymptoms} 
                  onChange={(e) => setMSymptoms(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Clinical Diagnosis</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="Diagnosis..."
                  value={mDiagnosis} 
                  onChange={(e) => setMDiagnosis(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prescribed Treatment</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="Treatment..."
                  value={mTreatment} 
                  onChange={(e) => setMTreatment(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Medicine Details</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. Otomax drops twice daily"
                  value={mMedicine} 
                  onChange={(e) => setMMedicine(e.target.value)} 
                />
              </div>
              <div className="pet-modal-row">
                <div className="form-group">
                  <label className="form-label">Doctor Name</label>
                  <input 
                    type="text" 
                    className="form-control login-input" 
                    value={mDoctor} 
                    onChange={(e) => setMDoctor(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Clinic Location</label>
                  <input 
                    type="text" 
                    className="form-control login-input" 
                    value={mClinic} 
                    onChange={(e) => setMClinic(e.target.value)} 
                  />
                </div>
              </div>
              <div className="pet-modal-row">
                <div className="form-group">
                  <label className="form-label">Visit Date *</label>
                  <input 
                    type="date" 
                    className="form-control login-input" 
                    value={mVisitDate} 
                    onChange={(e) => setMVisitDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Next Visit Follow-up</label>
                  <input 
                    type="date" 
                    className="form-control login-input" 
                    value={mNextVisit} 
                    onChange={(e) => setMNextVisit(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attach Diagnostic Report (Image)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAttachmentChange} 
                />
              </div>

              <div className="pet-modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="pet-modal-btn-cancel" onClick={() => setActiveDrawer(null)}>
                  Cancel
                </button>
                <button type="submit" className="pet-modal-btn-save">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Drawer */}
      {activeDrawer === 'deleteConfirm' && (
        <div className="pet-modal-overlay" onClick={() => setActiveDrawer(null)}>
          <div className="pet-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h3 className="pet-modal-title" style={{ color: '#EF4444', border: 'none', marginBottom: '12px' }}>Delete Pet</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '24px', fontWeight: '500' }}>
              Are you sure you want to permanently delete this pet? This operation is irreversible.
            </p>
            <div className="pet-modal-actions" style={{ justifyContent: 'center' }}>
              <button className="pet-modal-btn-cancel" onClick={() => setActiveDrawer(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
                className="pet-form-btn-save" 
                onClick={handleDelete}
                style={{ backgroundColor: '#EF4444', flex: 1 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
