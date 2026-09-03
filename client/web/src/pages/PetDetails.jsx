import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  Pencil, Trash2, HeartPulse, Syringe, FilePlus2, 
  X, CheckCircle, Calendar, ShieldCheck, Heart, User, MapPin, 
  ChevronRight, ArrowLeft, Activity, FileText, Sparkles
} from 'lucide-react';
import './PetDetails.css';
import PetImage from '../components/PetImage';

export default function PetDetails({ user, petId, onBack, onEdit, onDeleteSuccess }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'health' | 'documents'

  const isOwner = user && pet && (pet.owner === user._id || pet.owner._id === user._id);

  // Modal / Drawer active states: 'health' | 'vaccine' | 'medical' | 'deleteConfirm' | null
  const [activeDrawer, setActiveDrawer] = useState(null);

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
      const response = await fetch(`${API_URL}/api/pets/${petId}`);
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
      const response = await fetch(`${API_URL}/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'x-requester-id': user._id
        }
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
      const response = await fetch(`${API_URL}/api/pets/${petId}/vaccine`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
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
        setActiveDrawer(null);
        setActiveTab('health');
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
      const response = await fetch(`${API_URL}/api/pets/${petId}/medical-record`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
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
        setActiveDrawer(null);
        setActiveTab('health');
        fetchPetDetails();
      } else {
        alert('Failed to log medical visitation.');
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      <div className="pet-details-loading-box">
        <p>Retrieving pet companion profile...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="pet-details-loading-box">
        <p>Pet companion profile not found.</p>
        <button type="button" className="pet-back-btn" onClick={onBack} style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} />
          <span>Back to list</span>
        </button>
      </div>
    );
  }

  const vaccineCount = pet.vaccines ? pet.vaccines.length : 0;
  const medicalCount = pet.medicalRecords ? pet.medicalRecords.length : 0;
  const docsCount = pet.documents ? pet.documents.length : 0;

  return (
    <div className="pet-details-container fade-in">
      
      {/* HEADER NAV BAR */}
      <div className="pet-details-nav-bar">
        <button type="button" className="pet-back-btn" onClick={onBack} aria-label="Back to List">
          <ArrowLeft size={16} color="#0066CC" />
          <span>Back to list</span>
        </button>

        {isOwner && (
          <button 
            type="button" 
            className="pet-delete-companion-btn"
            onClick={() => setActiveDrawer('deleteConfirm')}
            title="Delete Pet Companion"
          >
            <Trash2 size={14} />
            <span>Delete Companion</span>
          </button>
        )}
      </div>

      {/* REDESIGNED PET PROFILE HEADER CARD */}
      <div className="pet-profile-card">
        
        {/* LEFT: LARGE RECTANGULAR PET IMAGE (30-35% WIDTH, FULL HEIGHT, FLUSH LEFT EDGE) */}
        <div className="pet-profile-image-container">
          <PetImage src={pet.image} imageSettings={pet.imageSettings} type="card" className="pet-profile-full-img" />
          <span className={`pet-status-pill status-${(pet.activeStatus || 'ACTIVE').toLowerCase().replace(/_/g, '-')}`}>
            {(pet.activeStatus || 'ACTIVE').replace('_', ' ')}
          </span>
        </div>

        {/* RIGHT: PET INFORMATION AREA (65-70% WIDTH) */}
        <div className="pet-profile-info-area">
          
          {/* TOP ROW: NAME, BREED & ACTION BUTTONS */}
          <div className="pet-profile-top-row">
            <div className="pet-profile-title-group">
              <div className="pet-profile-name-row">
                <h2 className="pet-profile-name">{pet.name}</h2>
                {pet.gender === 'Female' ? (
                  <span className="pet-gender-icon female" title="Female">♀</span>
                ) : (
                  <span className="pet-gender-icon male" title="Male">♂</span>
                )}
              </div>
              <p className="pet-profile-breed-sub">{pet.breed} • {pet.species}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pet-profile-actions-group">
              <button 
                type="button" 
                className="pet-header-action-btn teal" 
                onClick={() => setActiveDrawer('health')}
              >
                <HeartPulse size={15} />
                <span>View Health Record</span>
              </button>

              {isOwner && (
                <>
                  <button 
                    type="button" 
                    className="pet-header-action-btn orange" 
                    onClick={() => setActiveDrawer('vaccine')}
                  >
                    <Syringe size={15} />
                    <span>Add Vaccine</span>
                  </button>

                  <button 
                    type="button" 
                    className="pet-header-action-btn blue icon-only" 
                    onClick={() => onEdit(pet._id)}
                    title="Edit Profile"
                    aria-label="Edit Profile"
                  >
                    <Pencil size={15} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* BOTTOM ROW: INFORMATION STATISTICS METRICS */}
          <div className="pet-profile-stats-row">
            
            <div className="pet-stat-item">
              <div className="pet-stat-icon-badge green">
                <Calendar size={15} />
              </div>
              <div className="pet-stat-text">
                <span className="pet-stat-label">AGE</span>
                <span className="pet-stat-value">{pet.age}</span>
              </div>
            </div>

            <div className="pet-stat-item">
              <div className="pet-stat-icon-badge blue">
                <Activity size={15} />
              </div>
              <div className="pet-stat-text">
                <span className="pet-stat-label">WEIGHT</span>
                <span className="pet-stat-value">{pet.weight}</span>
              </div>
            </div>

            <div className="pet-stat-item">
              <div className="pet-stat-icon-badge teal">
                <Sparkles size={15} />
              </div>
              <div className="pet-stat-text">
                <span className="pet-stat-label">COLOR</span>
                <span className="pet-stat-value">{pet.color || 'N/A'}</span>
              </div>
            </div>

            <div className="pet-stat-item">
              <div className="pet-stat-icon-badge purple">
                <ShieldCheck size={15} />
              </div>
              <div className="pet-stat-text">
                <span className="pet-stat-label">MICROCHIP ID</span>
                <span className="pet-stat-value">{pet.microchipNumber || 'N/A'}</span>
              </div>
            </div>

            <div className="pet-stat-item">
              <div className="pet-stat-icon-badge orange">
                <MapPin size={15} />
              </div>
              <div className="pet-stat-text">
                <span className="pet-stat-label">LOCATION</span>
                <span className="pet-stat-value">{pet.city || 'Lahore'}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* HORIZONTAL NAVIGATION TABS */}
      <div className="pet-tabs-bar">
        <button 
          type="button"
          className={`pet-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <User size={15} />
          <span>Overview</span>
        </button>

        <button 
          type="button"
          className={`pet-tab-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <HeartPulse size={15} />
          <span>Health Logs ({vaccineCount + medicalCount})</span>
        </button>

        <button 
          type="button"
          className={`pet-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={15} />
          <span>Documents ({docsCount})</span>
        </button>
      </div>

      {/* TABS CONTENT REGION */}
      {activeTab === 'overview' && (
        <div className="pet-overview-grid">
          
          {/* CARD 1: BASIC INFORMATION */}
          <div className="pet-card-box">
            <div className="pet-card-box-header">
              <h4 className="pet-card-box-title">
                <User size={16} color="var(--color-primary)" />
                <span>Basic Information</span>
              </h4>
            </div>

            <div className="pet-card-rows-list">
              <div className="pet-row-item">
                <span className="pet-row-label">Name</span>
                <span className="pet-row-val">{pet.name}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Species</span>
                <span className="pet-row-val">{pet.species}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Breed</span>
                <span className="pet-row-val">{pet.breed}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Age</span>
                <span className="pet-row-val">{pet.age}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Gender</span>
                <span className="pet-row-val">{pet.gender}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Weight</span>
                <span className="pet-row-val">{pet.weight}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Color</span>
                <span className="pet-row-val">{pet.color || 'N/A'}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Size</span>
                <span className="pet-row-val">{pet.size || 'N/A'}</span>
              </div>
              <div className="pet-row-item border-none">
                <span className="pet-row-label">Microchip ID</span>
                <span className="pet-row-val">{pet.microchipNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* CARD 2: ABOUT PET & BEHAVIOUR */}
          <div className="pet-card-box">
            <div className="pet-card-box-header">
              <h4 className="pet-card-box-title">
                <Heart size={16} color="#EC4899" />
                <span>About Pet & Behaviour</span>
              </h4>
            </div>

            <div className="pet-card-rows-list">
              <div className="pet-row-item vertical">
                <span className="pet-row-label">Biography</span>
                <p className="pet-row-bio">{pet.aboutPet || 'No biography registered yet.'}</p>
              </div>

              <div className="pet-row-item">
                <span className="pet-row-label">Kids Friendly</span>
                <span className="pet-row-val">{pet.friendlyWithKids ? 'Yes' : 'No'}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Pets Friendly</span>
                <span className="pet-row-val">{pet.friendlyWithPets ? 'Yes' : 'No'}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Training Level</span>
                <span className="pet-row-val">{pet.trainingLevel || 'None'}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Neutered / Spayed</span>
                <span className="pet-row-val">{pet.neuteredSpayed ? 'Yes' : 'No'}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Behaviour Style</span>
                <span className="pet-row-val">{pet.behaviour || 'N/A'}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Personality Type</span>
                <span className="pet-row-val">{pet.personality || 'N/A'}</span>
              </div>
              <div className="pet-row-item border-none">
                <span className="pet-row-label">Food Preference</span>
                <span className="pet-row-val">{pet.foodPreference || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* CARD 3: LOCATION DETAILS */}
          <div className="pet-card-box">
            <div className="pet-card-box-header">
              <h4 className="pet-card-box-title">
                <MapPin size={16} color="#EAB308" />
                <span>Location Details</span>
              </h4>
            </div>

            <div className="pet-card-rows-list">
              <div className="pet-row-item">
                <span className="pet-row-label">Country</span>
                <span className="pet-row-val">{pet.country || 'Pakistan'}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Province</span>
                <span className="pet-row-val">{pet.province || 'Punjab'}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">City</span>
                <span className="pet-row-val">{pet.city || 'Lahore'}</span>
              </div>
              <div className="pet-row-item border-none">
                <span className="pet-row-label">Address</span>
                <span className="pet-row-val">{pet.address || 'N/A'}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* HEALTH TAB: TIMELINE LOGS */}
      {activeTab === 'health' && (
        <div className="pet-card-box">
          <div className="pet-card-box-header">
            <h4 className="pet-card-box-title">
              <HeartPulse size={16} color="#16A34A" />
              <span>Medical History & Vaccination Timelines</span>
            </h4>
          </div>

          <div className="pet-timeline-wrapper">
            {/* Render Vaccines */}
            {pet.vaccines && pet.vaccines.map((vac, idx) => (
              <div key={`vac-${idx}`} className="pet-timeline-item">
                <div className="pet-timeline-dot green" />
                <span className="pet-timeline-date">{vac.date}</span>
                <h5 className="pet-timeline-title">Vaccinated: {vac.vaccineName} ({vac.dose})</h5>
                <p className="pet-timeline-body">
                  <strong>Veterinarian:</strong> {vac.veterinarian || 'Not specified'}<br />
                  {vac.notes && <span><strong>Notes:</strong> {vac.notes}<br /></span>}
                  {vac.nextDueDate && <span style={{ color: '#EAB308', fontWeight: '700' }}>Next Due: {vac.nextDueDate}</span>}
                </p>
              </div>
            ))}

            {/* Render Medical Records */}
            {pet.medicalRecords && pet.medicalRecords.map((med, idx) => (
              <div key={`med-${idx}`} className="pet-timeline-item">
                <div className="pet-timeline-dot red" />
                <span className="pet-timeline-date">{med.visitDate}</span>
                <h5 className="pet-timeline-title">Clinic Consultation: {med.disease}</h5>
                <p className="pet-timeline-body">
                  <strong>Symptoms:</strong> {med.symptoms}<br />
                  <strong>Diagnosis:</strong> {med.diagnosis}<br />
                  <strong>Treatment:</strong> {med.treatment}<br />
                  <strong>Medicine:</strong> {med.medicine}<br />
                  <strong>Doctor/Clinic:</strong> {med.doctor} at {med.clinic}<br />
                  {med.nextVisitDate && <span style={{ color: '#0066CC', fontWeight: '700' }}>Follow up: {med.nextVisitDate}</span>}
                </p>
                {med.attachments && med.attachments.map((att, i) => (
                  <div key={i} className="pet-doc-tag-inline" onClick={() => window.open(att)}>
                    <span>Attachment {i + 1}</span>
                  </div>
                ))}
              </div>
            ))}

            {(!pet.vaccines || pet.vaccines.length === 0) && (!pet.medicalRecords || pet.medicalRecords.length === 0) && (
              <p className="pet-empty-timeline-text">No medical or vaccination history logged yet.</p>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="pet-card-box">
          <div className="pet-card-box-header">
            <h4 className="pet-card-box-title">
              <FileText size={16} color="#0066CC" />
              <span>Uploaded Documents & Identification Reports</span>
            </h4>
          </div>

          {pet.documents && pet.documents.length > 0 ? (
            <div className="pet-documents-grid">
              {pet.documents.map((doc, idx) => (
                <div key={idx} className="pet-doc-item-card" onClick={() => window.open(doc.data)}>
                  <FileText size={28} color="#0066CC" />
                  <div className="pet-doc-item-text">
                    <span className="pet-doc-item-name">{doc.name}</span>
                    <span className="pet-doc-item-sub">Click to view/download</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="pet-empty-timeline-text">No document attachments uploaded.</p>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
         DRAWER MODALS (HEALTH LOG, VACCINE FORM, MEDICAL FORM, DELETE)
         ---------------------------------------------------- */}

      {/* Health Record Logs Drawer */}
      {activeDrawer === 'health' && (
        <div className="pet-details-drawer-overlay" onClick={() => setActiveDrawer(null)}>
          <div className="pet-details-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pet-drawer-header">
              <h3 className="pet-drawer-title">{pet.name}'s Medical Health Log</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isOwner && (
                  <>
                    <button type="button" className="pet-header-action-btn teal" onClick={() => setActiveDrawer('medical')}>
                      <FilePlus2 size={13} />
                      <span>Add Medical Record</span>
                    </button>
                    <button type="button" className="pet-delete-companion-btn" onClick={() => setActiveDrawer('deleteConfirm')}>
                      <span>Delete Companion</span>
                    </button>
                  </>
                )}
                <button type="button" className="pet-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="pet-card-rows-list" style={{ marginBottom: '20px' }}>
              <div className="pet-row-item">
                <span className="pet-row-label">Blood Group</span>
                <span className="pet-row-val">{pet.bloodGroup || 'Not specified'}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Vaccination Status</span>
                <span className="pet-row-val">{pet.isVaccinated ? 'Vaccinated' : 'Not Vaccinated'}</span>
              </div>
              <div className="pet-row-item vertical">
                <span className="pet-row-label">Allergies Log</span>
                <span className="pet-row-val" style={{ width: '100%', textAlign: 'left', marginTop: '4px' }}>
                  {pet.allergies || 'No allergies recorded.'}
                </span>
              </div>
              <div className="pet-row-item vertical">
                <span className="pet-row-label">Chronic Diseases</span>
                <span className="pet-row-val" style={{ width: '100%', textAlign: 'left', marginTop: '4px' }}>
                  {pet.diseases || 'No chronic diseases recorded.'}
                </span>
              </div>
              <div className="pet-row-item vertical border-none">
                <span className="pet-row-label">General Medical Summary</span>
                <span className="pet-row-val" style={{ width: '100%', textAlign: 'left', marginTop: '4px' }}>
                  {pet.medicalHistory || 'No past surgical history logged.'}
                </span>
              </div>
            </div>

            <h4 className="pet-card-box-title" style={{ fontSize: '14px', marginBottom: '10px' }}>Timeline Logs</h4>
            <div className="pet-timeline-wrapper">
              {pet.vaccines && pet.vaccines.map((vac, idx) => (
                <div key={`vac-${idx}`} className="pet-timeline-item">
                  <div className="pet-timeline-dot green" />
                  <span className="pet-timeline-date">{vac.date}</span>
                  <h5 className="pet-timeline-title">Vaccinated: {vac.vaccineName} ({vac.dose})</h5>
                  <p className="pet-timeline-body">
                    <strong>Veterinarian:</strong> {vac.veterinarian || 'Not specified'}<br />
                    {vac.notes && <span><strong>Notes:</strong> {vac.notes}<br /></span>}
                    {vac.nextDueDate && <span style={{ color: '#EAB308', fontWeight: '700' }}>Next Due: {vac.nextDueDate}</span>}
                  </p>
                </div>
              ))}

              {pet.medicalRecords && pet.medicalRecords.map((med, idx) => (
                <div key={`med-${idx}`} className="pet-timeline-item">
                  <div className="pet-timeline-dot red" />
                  <span className="pet-timeline-date">{med.visitDate}</span>
                  <h5 className="pet-timeline-title">Clinic Consultation: {med.disease}</h5>
                  <p className="pet-timeline-body">
                    <strong>Symptoms:</strong> {med.symptoms}<br />
                    <strong>Diagnosis:</strong> {med.diagnosis}<br />
                    <strong>Treatment:</strong> {med.treatment}<br />
                    <strong>Medicine:</strong> {med.medicine}<br />
                    <strong>Doctor/Clinic:</strong> {med.doctor} at {med.clinic}<br />
                    {med.nextVisitDate && <span style={{ color: '#0066CC', fontWeight: '700' }}>Follow up: {med.nextVisitDate}</span>}
                  </p>
                </div>
              ))}
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
              <button type="button" className="pet-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
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
              <button type="button" className="pet-drawer-close-btn" onClick={() => setActiveDrawer(null)}>
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

      {/* Delete Confirmation Modal */}
      {activeDrawer === 'deleteConfirm' && (
        <div className="pet-modal-overlay" onClick={() => setActiveDrawer(null)}>
          <div className="pet-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Delete Companion?</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>This action cannot be undone.</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#334155', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete <strong>{pet.name}</strong> from your profile?
            </p>
            <div className="pet-modal-actions" style={{ gap: '10px' }}>
              <button type="button" className="pet-modal-btn-cancel" onClick={() => setActiveDrawer(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
                type="button"
                className="pet-delete-confirm-btn" 
                onClick={handleDelete}
                style={{ flex: 1 }}
              >
                Delete Companion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
