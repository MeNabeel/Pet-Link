import API_URL from '@/config';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, HeartPulse, PawPrint, BadgeCheck, MapPin, 
  FileText, Upload, X, ChevronRight, Sparkles, Check
} from 'lucide-react';
import './PetForm.css';
import PetImage from '../components/PetImage';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PetForm({ user, petId, onCancel, onSaveSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Active Dialog State: 'health' | 'behaviour' | 'status' | 'location' | 'documents' | null
  const [activeModalSection, setActiveModalSection] = useState(null);

  // Section 1: Basic Info
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [image, setImage] = useState('');
  const [imageSettings, setImageSettings] = useState({ positionX: 50, positionY: 50, scale: 1, objectPosition: '50% 50%' });

  // Section 2: Health Info
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [nextVaccinationDate, setNextVaccinationDate] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [diseases, setDiseases] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Section 3: Behaviour & Personality
  const [friendlyWithKids, setFriendlyWithKids] = useState(false);
  const [friendlyWithPets, setFriendlyWithPets] = useState(false);
  const [trainingLevel, setTrainingLevel] = useState('None');
  const [neuteredSpayed, setNeuteredSpayed] = useState(false);
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [foodPreference, setFoodPreference] = useState('');
  const [behaviour, setBehaviour] = useState('');
  const [personality, setPersonality] = useState('');
  const [aboutPet, setAboutPet] = useState('');

  // Section 4: Adoption Info
  const [adoptionStatus, setAdoptionStatus] = useState('Available');

  // Section 5: Pet Status
  const [activeStatus, setActiveStatus] = useState('ACTIVE');
  const [price, setPrice] = useState(0);
  const [negotiable, setNegotiable] = useState(true);

  // Section 6: Location
  const [country, setCountry] = useState('Pakistan');
  const [province, setProvince] = useState('Punjab');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');

  // Section 7: Documents
  const [documents, setDocuments] = useState([]); // Array of { name, fileType, data: base64 }

  const mainImageRef = useRef(null);
  const docFileRef = useRef(null);

  // Prepopulate if editing
  useEffect(() => {
    if (petId) {
      setFetchingData(true);
      fetch(`${API_URL}/api/pets/${petId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data._id) {
            setName(data.name || '');
            setSpecies(data.species || 'Dog');
            setBreed(data.breed || '');
            setGender(data.gender || 'Male');
            setAge(data.age || '');
            setWeight(data.weight || '');
            setColor(data.color || '');
            setSize(data.size || '');
            setImage(data.image || '');
            setImageSettings(data.imageSettings || { positionX: 50, positionY: 50, scale: 1, objectPosition: '50% 50%' });

            setIsVaccinated(data.isVaccinated || false);
            setVaccinationDate(data.vaccinationDate || '');
            setNextVaccinationDate(data.nextVaccinationDate || '');
            setMedicalHistory(data.medicalHistory || '');
            setAllergies(data.allergies || '');
            setDiseases(data.diseases || '');
            setBloodGroup(data.bloodGroup || '');

            setFriendlyWithKids(data.friendlyWithKids || false);
            setFriendlyWithPets(data.friendlyWithPets || false);
            setTrainingLevel(data.trainingLevel || 'None');
            setNeuteredSpayed(data.neuteredSpayed || false);
            setMicrochipNumber(data.microchipNumber || '');
            setFoodPreference(data.foodPreference || '');
            setBehaviour(data.behaviour || '');
            setPersonality(data.personality || '');
            setAboutPet(data.aboutPet || '');

            setAdoptionStatus(data.adoptionStatus || 'Available');
            setActiveStatus(data.activeStatus ? data.activeStatus.toUpperCase() : 'ACTIVE');

            setCountry(data.country || 'Pakistan');
            setProvince(data.province || 'Punjab');
            setCity(data.city || 'Lahore');
            setAddress(data.address || '');

            setDocuments(data.documents || []);
            setPrice(data.price !== undefined ? data.price : 0);
            setNegotiable(data.negotiable !== undefined ? data.negotiable : true);
          }
        })
        .catch((err) => console.error('Error prepopulating pet data:', err))
        .finally(() => setFetchingData(false));
    }
  }, [petId]);

  // Handle main photo reader
  const handleMainPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImageSettings({ positionX: 50, positionY: 50, scale: 1, objectPosition: '50% 50%' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple docs upload
  const handleDocsUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocuments((prev) => [
          ...prev,
          {
            name: file.name,
            fileType: file.type,
            data: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveDoc = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startPos = useRef({ x: 50, y: 50 });

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startPos.current = { x: imageSettings.positionX, y: imageSettings.positionY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    let newX = startPos.current.x - (dx / 2.8);
    let newY = startPos.current.y - (dy / 1.8);

    newX = Math.max(0, Math.min(100, Math.round(newX)));
    newY = Math.max(0, Math.min(100, Math.round(newY)));

    setImageSettings({
      positionX: newX,
      positionY: newY,
      scale: 1,
      objectPosition: `${newX}% ${newY}%`
    });
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startPos.current = { x: imageSettings.positionX, y: imageSettings.positionY };
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    let newX = startPos.current.x - (dx / 2.8);
    let newY = startPos.current.y - (dy / 1.8);

    newX = Math.max(0, Math.min(100, Math.round(newX)));
    newY = Math.max(0, Math.min(100, Math.round(newY)));

    setImageSettings({
      positionX: newX,
      positionY: newY,
      scale: 1,
      objectPosition: `${newX}% ${newY}%`
    });
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !breed || !age || !weight) {
      alert('Nick Name, Breed, Age, and Weight are required.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const proceedSave = async () => {
    setLoading(true);
    setFormError('');
    try {
      const payload = {
        owner: user._id,
        name, species, breed, gender, age, weight, color, size,
        isVaccinated, vaccinationDate, nextVaccinationDate, medicalHistory, allergies, diseases, bloodGroup,
        friendlyWithKids, friendlyWithPets, trainingLevel, neuteredSpayed, microchipNumber, foodPreference,
        behaviour, personality, aboutPet, adoptionStatus, activeStatus,
        country, province, city, address, image, imageSettings, documents,
        price: activeStatus === 'FOR_SALE' ? price : 0,
        negotiable: activeStatus === 'FOR_SALE' ? negotiable : false
      };

      let response;
      if (petId) {
        response = await fetch(`${API_URL}/api/pets/${petId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-requester-id': user._id
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_URL}/api/pets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const savedData = await response.json();
        onSaveSuccess(savedData);
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Failed to save pet profile.');
      }
    } catch (err) {
      console.error('Error saving pet profile:', err);
      setFormError('Network issue or server unavailable.');
    } finally {
      setLoading(false);
      setIsConfirmOpen(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="pet-form-skeleton-loading">
        <Skeleton width="60%" height="24px" style={{ marginBottom: '16px' }} />
        <Skeleton width="100%" height="180px" style={{ borderRadius: '16px', marginBottom: '16px' }} />
        <Skeleton width="100%" height="240px" style={{ borderRadius: '16px' }} />
      </div>
    );
  }

  return (
    <div className="pet-form-container fade-in">
      
      {/* HEADER */}
      <div className="pet-form-header">
        <h2 className="pet-form-title">{petId ? 'Edit Pet Profile' : 'Register New Pet Companion'}</h2>
        <p className="pet-form-subtitle">Update basic information below or open additional section dialogs to manage health, location, and records.</p>
      </div>

      <form onSubmit={handleSubmit} className="pet-form-body-wrapper">
        
        {formError && (
          <div className="pet-form-error-alert">
            <span>{formError}</span>
          </div>
        )}

        {/* MAIN COMPACT GRID: BASIC INFO (LEFT) & SECTION DIALOG TRIGGERS (RIGHT) */}
        <div className="pet-form-main-grid">
          
          {/* LEFT: BASIC INFORMATION (ALWAYS VISIBLE) */}
          <div className="pet-basic-card">
            <h3 className="pet-section-title-sm">
              <Heart size={16} color="var(--color-primary)" />
              <span>Basic Information</span>
            </h3>

            {/* Photo Avatar Drag Box */}
            <div className="pet-photo-upload-section">
              {image && (
                <span className="pet-image-drag-hint">
                  Click & Drag photo below to adjust position
                </span>
              )}
              <div 
                className="pet-image-upload-box" 
                onClick={() => { if (!image) mainImageRef.current.click(); }}
                onMouseDown={image ? handleMouseDown : undefined}
                onMouseMove={image ? handleMouseMove : undefined}
                onMouseUp={image ? handleMouseUpOrLeave : undefined}
                onMouseLeave={image ? handleMouseUpOrLeave : undefined}
                onTouchStart={image ? handleTouchStart : undefined}
                onTouchMove={image ? handleTouchMove : undefined}
                onTouchEnd={image ? handleMouseUpOrLeave : undefined}
              >
                {image ? (
                  <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <PetImage src={image} imageSettings={imageSettings} type="card" style={{ height: '100%' }} />
                  </div>
                ) : (
                  <div className="pet-image-placeholder">
                    <Upload size={22} />
                    <span>Upload Main Photo</span>
                  </div>
                )}
              </div>

              {image && (
                <button 
                  type="button" 
                  className="pet-btn-change-photo" 
                  onClick={() => mainImageRef.current.click()}
                >
                  Change Photo
                </button>
              )}

              <input 
                type="file" 
                ref={mainImageRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleMainPhotoChange} 
              />
            </div>

            {/* Basic Info Fields Grid */}
            <div className="pet-basic-inputs-grid">
              <div className="form-group">
                <label className="form-label">Pet Name *</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. Luna"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Species *</label>
                <select 
                  className="form-control login-input" 
                  value={species} 
                  onChange={(e) => setSpecies(e.target.value)}
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Breed *</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. Golden Retriever"
                  value={breed} 
                  onChange={(e) => setBreed(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select 
                  className="form-control login-input" 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Age *</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. 3 yrs"
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight *</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. 28 kg"
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. Golden"
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Size</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  placeholder="e.g. Medium"
                  value={size} 
                  onChange={(e) => setSize(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* RIGHT: EXPANDABLE SECTION DIALOG TRIGGERS */}
          <div className="pet-triggers-column">
            <h3 className="pet-section-title-sm">
              <Sparkles size={16} color="var(--color-primary)" />
              <span>Additional Sections</span>
            </h3>

            {/* Health Trigger */}
            <div className="pet-trigger-card" onClick={() => setActiveModalSection('health')}>
              <div className="pet-trigger-icon-box health">
                <HeartPulse size={18} />
              </div>
              <div className="pet-trigger-text">
                <h4 className="pet-trigger-name">Health Info</h4>
                <p className="pet-trigger-sub">
                  {isVaccinated ? 'Vaccinated' : 'Vaccination details'} • {bloodGroup || 'Medical log'}
                </p>
              </div>
              <ChevronRight size={18} className="pet-trigger-chevron" />
            </div>

            {/* Behaviour Trigger */}
            <div className="pet-trigger-card" onClick={() => setActiveModalSection('behaviour')}>
              <div className="pet-trigger-icon-box behaviour">
                <PawPrint size={18} />
              </div>
              <div className="pet-trigger-text">
                <h4 className="pet-trigger-name">Behaviour & Personality</h4>
                <p className="pet-trigger-sub">
                  {trainingLevel} training • {neuteredSpayed ? 'Neutered/Spayed' : 'Temperament & diet'}
                </p>
              </div>
              <ChevronRight size={18} className="pet-trigger-chevron" />
            </div>

            {/* Status Trigger */}
            <div className="pet-trigger-card" onClick={() => setActiveModalSection('status')}>
              <div className="pet-trigger-icon-box status">
                <BadgeCheck size={18} />
              </div>
              <div className="pet-trigger-text">
                <h4 className="pet-trigger-name">Status & Marketplace</h4>
                <p className="pet-trigger-sub">
                  {activeStatus.replace(/_/g, ' ')} • {adoptionStatus}
                </p>
              </div>
              <ChevronRight size={18} className="pet-trigger-chevron" />
            </div>

            {/* Location Trigger */}
            <div className="pet-trigger-card" onClick={() => setActiveModalSection('location')}>
              <div className="pet-trigger-icon-box location">
                <MapPin size={18} />
              </div>
              <div className="pet-trigger-text">
                <h4 className="pet-trigger-name">Location</h4>
                <p className="pet-trigger-sub">
                  {city ? `${city}, ${province}` : 'City & country settings'}
                </p>
              </div>
              <ChevronRight size={18} className="pet-trigger-chevron" />
            </div>

            {/* Documents Trigger */}
            <div className="pet-trigger-card" onClick={() => setActiveModalSection('documents')}>
              <div className="pet-trigger-icon-box documents">
                <FileText size={18} />
              </div>
              <div className="pet-trigger-text">
                <h4 className="pet-trigger-name">Documents & Reports</h4>
                <p className="pet-trigger-sub">
                  {documents.length > 0 ? `${documents.length} document(s) uploaded` : 'Medical cards & reports'}
                </p>
              </div>
              <ChevronRight size={18} className="pet-trigger-chevron" />
            </div>
          </div>

        </div>

        {/* MAIN FOOTER ACTION BUTTONS */}
        <div className="pet-form-actions-footer">
          <button type="button" className="pet-form-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="pet-form-btn-save" disabled={loading}>
            {loading ? 'Saving Updates...' : petId ? 'Save Updates' : 'Save Companion'}
          </button>
        </div>

      </form>

      {/* ----------------------------------------------------
         1. HEALTH INFO DIALOG MODAL
         ---------------------------------------------------- */}
      <Dialog open={activeModalSection === 'health'} onOpenChange={(open) => { if (!open) setActiveModalSection(null); }}>
        <DialogContent className="pet-section-dialog-content">
          <DialogHeader>
            <DialogTitle className="pet-dialog-title">
              <HeartPulse size={20} color="#16A34A" />
              <span>Health Information</span>
            </DialogTitle>
            <DialogDescription className="pet-dialog-desc">
              Manage vaccination history, medical background, allergies, and blood group details.
            </DialogDescription>
          </DialogHeader>

          <div className="pet-dialog-scroll-body">
            <div className="pet-toggle-row">
              <div className="pet-toggle-label-area">
                <span className="pet-toggle-title">Vaccinated</span>
                <span className="pet-toggle-subtitle">Has this companion received core protective vaccines?</span>
              </div>
              <input 
                type="checkbox" 
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                checked={isVaccinated} 
                onChange={(e) => setIsVaccinated(e.target.checked)} 
              />
            </div>

            {isVaccinated && (
              <div className="pet-grid-2 fade-in" style={{ marginTop: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Last Vaccination Date</label>
                  <input 
                    type="date" 
                    className="form-control login-input" 
                    value={vaccinationDate} 
                    onChange={(e) => setVaccinationDate(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Next Vaccination Due Date</label>
                  <input 
                    type="date" 
                    className="form-control login-input" 
                    value={nextVaccinationDate} 
                    onChange={(e) => setNextVaccinationDate(e.target.value)} 
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">Medical History / Past Surgeries</label>
              <textarea 
                className="form-control login-input" 
                style={{ height: '70px', padding: '10px' }}
                placeholder="List major past medical issues or operations..."
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
              />
            </div>

            <div className="pet-grid-2" style={{ marginTop: '14px' }}>
              <div className="form-group">
                <label className="form-label">Allergies</label>
                <textarea 
                  className="form-control login-input" 
                  style={{ height: '60px', padding: '10px' }}
                  placeholder="Food or drug allergies..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Diseases (Chronic / Current)</label>
                <textarea 
                  className="form-control login-input" 
                  style={{ height: '60px', padding: '10px' }}
                  placeholder="Chronic ailments or active diseases..."
                  value={diseases}
                  onChange={(e) => setDiseases(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px', maxWidth: '220px' }}>
              <label className="form-label">Blood Group (Optional)</label>
              <input 
                type="text" 
                className="form-control login-input" 
                placeholder="e.g. DEA 1.1"
                value={bloodGroup} 
                onChange={(e) => setBloodGroup(e.target.value)} 
              />
            </div>
          </div>

          <DialogFooter className="pet-dialog-footer">
            <button 
              type="button" 
              className="pet-dialog-btn-done"
              onClick={() => setActiveModalSection(null)}
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------------------------------------
         2. BEHAVIOUR & PERSONALITY DIALOG MODAL
         ---------------------------------------------------- */}
      <Dialog open={activeModalSection === 'behaviour'} onOpenChange={(open) => { if (!open) setActiveModalSection(null); }}>
        <DialogContent className="pet-section-dialog-content">
          <DialogHeader>
            <DialogTitle className="pet-dialog-title">
              <PawPrint size={20} color="#EAB308" />
              <span>Behaviour & Personality</span>
            </DialogTitle>
            <DialogDescription className="pet-dialog-desc">
              Define social compatibility, training, diet, microchip number, and biography.
            </DialogDescription>
          </DialogHeader>

          <div className="pet-dialog-scroll-body">
            <div className="pet-grid-2">
              <div className="pet-toggle-row">
                <div className="pet-toggle-label-area">
                  <span className="pet-toggle-title">Friendly with Kids</span>
                </div>
                <input 
                  type="checkbox" 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={friendlyWithKids} 
                  onChange={(e) => setFriendlyWithKids(e.target.checked)} 
                />
              </div>

              <div className="pet-toggle-row">
                <div className="pet-toggle-label-area">
                  <span className="pet-toggle-title">Friendly with Pets</span>
                </div>
                <input 
                  type="checkbox" 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={friendlyWithPets} 
                  onChange={(e) => setFriendlyWithPets(e.target.checked)} 
                />
              </div>
            </div>

            <div className="pet-grid-2" style={{ marginTop: '14px' }}>
              <div className="form-group">
                <label className="form-label">Training Level</label>
                <select 
                  className="form-control login-input" 
                  value={trainingLevel} 
                  onChange={(e) => setTrainingLevel(e.target.value)}
                >
                  <option value="None">None</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="pet-toggle-row" style={{ height: '46px', marginTop: '22px' }}>
                <div className="pet-toggle-label-area">
                  <span className="pet-toggle-title">Neutered / Spayed</span>
                </div>
                <input 
                  type="checkbox" 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={neuteredSpayed} 
                  onChange={(e) => setNeuteredSpayed(e.target.checked)} 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">Microchip Number</label>
              <input 
                type="text" 
                className="form-control login-input" 
                placeholder="15-digit ISO Microchip number..."
                value={microchipNumber} 
                onChange={(e) => setMicrochipNumber(e.target.value)} 
              />
            </div>

            <div className="pet-grid-3" style={{ marginTop: '14px' }}>
              <div className="form-group">
                <label className="form-label">Food Preference</label>
                <textarea 
                  className="form-control login-input" 
                  placeholder="Wet food, allergens..."
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Typical Behaviour</label>
                <textarea 
                  className="form-control login-input" 
                  placeholder="Calm, hyperactive..."
                  value={behaviour}
                  onChange={(e) => setBehaviour(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Personality Type</label>
                <textarea 
                  className="form-control login-input" 
                  placeholder="Loyal, playful..."
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">About Pet Bio</label>
              <textarea 
                className="form-control login-input" 
                style={{ height: '80px', padding: '10px' }}
                placeholder="Daily schedule, favorite toys..."
                value={aboutPet}
                onChange={(e) => setAboutPet(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pet-dialog-footer">
            <button 
              type="button" 
              className="pet-dialog-btn-done"
              onClick={() => setActiveModalSection(null)}
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------------------------------------
         3. ADOPTION & ACTIVE STATUS DIALOG MODAL
         ---------------------------------------------------- */}
      <Dialog open={activeModalSection === 'status'} onOpenChange={(open) => { if (!open) setActiveModalSection(null); }}>
        <DialogContent className="pet-section-dialog-content">
          <DialogHeader>
            <DialogTitle className="pet-dialog-title">
              <BadgeCheck size={20} color="var(--color-primary)" />
              <span>Adoption & Active Status</span>
            </DialogTitle>
            <DialogDescription className="pet-dialog-desc">
              Set availability for Marketplace listing, adoption, or shelter status.
            </DialogDescription>
          </DialogHeader>

          <div className="pet-dialog-scroll-body">
            <div className="pet-grid-2">
              <div className="form-group">
                <label className="form-label">Adoption Status</label>
                <select 
                  className="form-control login-input" 
                  value={adoptionStatus} 
                  onChange={(e) => setAdoptionStatus(e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                  <option value="Adopted">Adopted</option>
                  <option value="Not for Adoption">Not for Adoption</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Pet Status</label>
                <select 
                  className="form-control login-input" 
                  value={activeStatus} 
                  onChange={(e) => setActiveStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="FOR_SALE">FOR SALE (Marketplace)</option>
                  <option value="FOR_ADOPTION">FOR ADOPTION (Marketplace)</option>
                  <option value="IN_SHELTER">IN SHELTER</option>
                  <option value="LOST">LOST (Lost & Found)</option>
                  <option value="DECEASED">DECEASED</option>
                  <option value="ARCHIVED">ARCHIVED (Hide from listing)</option>
                </select>
              </div>
            </div>

            {activeStatus === 'FOR_SALE' && (
              <div className="pet-grid-2 fade-in" style={{ marginTop: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Price (PKR)</label>
                  <input 
                    type="number" 
                    className="form-control login-input" 
                    placeholder="Enter sale price..."
                    value={price} 
                    onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))} 
                  />
                </div>
                <div className="pet-toggle-row" style={{ marginTop: '24px' }}>
                  <div className="pet-toggle-label-area">
                    <span className="pet-toggle-title">Price is Negotiable</span>
                  </div>
                  <input 
                    type="checkbox" 
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    checked={negotiable} 
                    onChange={(e) => setNegotiable(e.target.checked)} 
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pet-dialog-footer">
            <button 
              type="button" 
              className="pet-dialog-btn-done"
              onClick={() => setActiveModalSection(null)}
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------------------------------------
         4. LOCATION DIALOG MODAL
         ---------------------------------------------------- */}
      <Dialog open={activeModalSection === 'location'} onOpenChange={(open) => { if (!open) setActiveModalSection(null); }}>
        <DialogContent className="pet-section-dialog-content">
          <DialogHeader>
            <DialogTitle className="pet-dialog-title">
              <MapPin size={20} color="var(--color-primary)" />
              <span>Location Details</span>
            </DialogTitle>
            <DialogDescription className="pet-dialog-desc">
              Specify city, province, country, and address for local service discovery.
            </DialogDescription>
          </DialogHeader>

          <div className="pet-dialog-scroll-body">
            <div className="pet-grid-3">
              <div className="form-group">
                <label className="form-label">Country</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Province</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  value={province} 
                  onChange={(e) => setProvince(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">Street Address (Optional)</label>
              <input 
                type="text" 
                className="form-control login-input" 
                placeholder="e.g. House 45, Sector B, DHA Phase 5"
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
              />
            </div>
          </div>

          <DialogFooter className="pet-dialog-footer">
            <button 
              type="button" 
              className="pet-dialog-btn-done"
              onClick={() => setActiveModalSection(null)}
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ----------------------------------------------------
         5. DOCUMENTS & REPORTS DIALOG MODAL
         ---------------------------------------------------- */}
      <Dialog open={activeModalSection === 'documents'} onOpenChange={(open) => { if (!open) setActiveModalSection(null); }}>
        <DialogContent className="pet-section-dialog-content">
          <DialogHeader>
            <DialogTitle className="pet-dialog-title">
              <FileText size={20} color="var(--color-primary)" />
              <span>Documents & Medical Reports</span>
            </DialogTitle>
            <DialogDescription className="pet-dialog-desc">
              Upload vaccination cards, clinic reports, and pet identification files.
            </DialogDescription>
          </DialogHeader>

          <div className="pet-dialog-scroll-body">
            <div className="pet-drag-drop-zone" onClick={() => docFileRef.current.click()}>
              <Upload size={28} />
              <span className="pet-drag-title">Click to upload vaccination cards or reports</span>
              <span className="pet-drag-subtitle">(PDF, JPEG, PNG supported)</span>
              <input 
                type="file" 
                ref={docFileRef} 
                style={{ display: 'none' }} 
                multiple 
                onChange={handleDocsUpload} 
              />
            </div>

            {documents.length > 0 && (
              <div className="pet-docs-list" style={{ marginTop: '14px' }}>
                {documents.map((doc, idx) => (
                  <div key={idx} className="pet-doc-card">
                    {doc.fileType.startsWith('image/') ? (
                      <img src={doc.data} alt="Doc Preview" className="pet-doc-preview-img" />
                    ) : (
                      <div className="pet-doc-placeholder-icon">
                        <FileText size={24} />
                      </div>
                    )}
                    <span className="pet-doc-name">{doc.name}</span>
                    <button type="button" className="pet-doc-remove-btn" onClick={() => handleRemoveDoc(idx)}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pet-dialog-footer">
            <button 
              type="button" 
              className="pet-dialog-btn-done"
              onClick={() => setActiveModalSection(null)}
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION ALERT DIALOG */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{petId ? 'Confirm Profile Update' : 'Confirm Registration'}</AlertDialogTitle>
            <AlertDialogDescription>
              {petId 
                ? "Do you want to save these changes to the pet profile?" 
                : "Do you want to register this new pet companion profile?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={proceedSave}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
