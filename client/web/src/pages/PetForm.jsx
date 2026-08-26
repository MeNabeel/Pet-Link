import API_URL from '@/config';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, ShieldAlert, Award, FileText, MapPin, 
  Upload, X, Image as ImageIcon, Sparkles, CheckSquare,
  ChevronDown, ChevronRight
} from 'lucide-react';
import './PetForm.css';
import PetImage from '../components/PetImage';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';

export default function PetForm({ user, petId, onCancel, onSaveSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [sectionsExpanded, setSectionsExpanded] = useState({
    basic: true,
    health: false,
    behaviour: false,
    status: false,
    location: false,
    documents: false
  });

  const toggleSection = (sectionKey) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

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
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading companion profile information...</p>
      </div>
    );
  }

  return (
    <div className="pet-form-container fade-in">
      <div className="pet-form-header">
        <h2 className="pet-form-title">{petId ? 'Edit Pet Profile' : 'Register New Pet Companion'}</h2>
        <p className="pet-form-subtitle">Fill in the comprehensive profile parameters below to sync with shelter networks.</p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {formError && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '12px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', fontSize: '13px', fontWeight: '600' }}>
            {formError}
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="pet-form-section">
          <div className="pet-section-header" onClick={() => toggleSection('basic')}>
            <h3 className="pet-section-title">
              <Heart size={18} color="var(--color-primary)" />
              1. Basic Information
            </h3>
            {sectionsExpanded.basic ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>

          {sectionsExpanded.basic && (
            <div className="pet-section-body fade-in">
              <div className="pet-image-upload-wrapper" style={{ width: '280px', margin: '0 auto 20px auto' }}>
            {image && (
              <span className="pet-form-subtitle" style={{ fontSize: '11px', marginBottom: '8px', color: 'var(--color-primary)', fontWeight: '700', display: 'block', textAlign: 'center' }}>
                🖱️ Click & Drag the image below to adjust its position
              </span>
            )}
            <div 
              className="pet-image-upload-box" 
              style={{ 
                width: '280px', 
                height: '180px', 
                borderRadius: '20px', 
                overflow: 'hidden', 
                cursor: image ? 'grab' : 'pointer',
                position: 'relative',
                border: '1px solid var(--color-border)',
                backgroundColor: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
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
                <div className="pet-image-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Upload size={24} />
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>Pet Main Photo</span>
                </div>
              )}
            </div>

            {image && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                  type="button" 
                  className="pet-btn-outline" 
                  style={{ marginTop: '12px', padding: '6px 12px', fontSize: '11px', justifyContent: 'center' }}
                  onClick={() => mainImageRef.current.click()}
                >
                  Change Photo
                </button>
              </div>
            )}

            <input 
              type="file" 
              ref={mainImageRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleMainPhotoChange} 
            />
          </div>

          <div className="pet-grid-2">
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
          </div>

          <div className="pet-grid-2" style={{ marginTop: '16px' }}>
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
          </div>

          <div className="pet-grid-2" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Age (e.g. 3 yrs / 5 months) *</label>
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
              <label className="form-label">Weight (e.g. 28 kg) *</label>
              <input 
                type="text" 
                className="form-control login-input" 
                placeholder="e.g. 28 kg"
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="pet-grid-2" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Color</label>
              <input 
                type="text" 
                className="form-control login-input" 
                placeholder="e.g. Golden / Light Brown"
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Size</label>
              <input 
                type="text" 
                className="form-control login-input" 
                placeholder="e.g. Medium / Large"
                value={size} 
                onChange={(e) => setSize(e.target.value)} 
              />
            </div>
          </div>
          </div>
          )}
        </div>

        {/* Section 2: Health Information */}
        <div className="pet-form-section">
          <div className="pet-section-header" onClick={() => toggleSection('health')}>
            <h3 className="pet-section-title">
              <ShieldAlert size={18} color="#16A34A" />
              2. Health Information
            </h3>
            {sectionsExpanded.health ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>

          {sectionsExpanded.health && (
            <div className="pet-section-body fade-in">

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
            <div className="pet-grid-2 fade-in" style={{ marginBottom: '20px' }}>
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

          <div className="form-group">
            <label className="form-label">Medical History / Past Surgeries Summary</label>
            <textarea 
              className="form-control login-input" 
              style={{ height: '70px', padding: '12px' }}
              placeholder="List any major past medical issues or operations..."
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
            />
          </div>

          <div className="pet-grid-2" style={{ marginTop: '16px' }}>
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
                placeholder="Chronic ailments or currently active diseases..."
                value={diseases}
                onChange={(e) => setDiseases(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px', maxWidth: '200px' }}>
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
          )}
        </div>

        {/* Section 3: Behaviour & Personality */}
        <div className="pet-form-section">
          <div className="pet-section-header" onClick={() => toggleSection('behaviour')}>
            <h3 className="pet-section-title">
              <Award size={18} color="#EAB308" />
              3. Behaviour & Personality
            </h3>
            {sectionsExpanded.behaviour ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>

          {sectionsExpanded.behaviour && (
            <div className="pet-section-body fade-in">

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

          <div className="pet-grid-2" style={{ marginTop: '16px' }}>
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

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Microchip Number</label>
            <input 
              type="text" 
              className="form-control login-input" 
              placeholder="15-digit ISO Microchip number..."
              value={microchipNumber} 
              onChange={(e) => setMicrochipNumber(e.target.value)} 
            />
          </div>

          <div className="pet-grid-3" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Food Preference</label>
              <textarea 
                className="form-control login-input" 
                placeholder="Wet food, chicken broth, allergens..."
                value={foodPreference}
                onChange={(e) => setFoodPreference(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Typical Behaviour</label>
              <textarea 
                className="form-control login-input" 
                placeholder="Calm, hyperactive, barks at strangers..."
                value={behaviour}
                onChange={(e) => setBehaviour(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Personality Type</label>
              <textarea 
                className="form-control login-input" 
                placeholder="Loyal, playful, protective..."
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">About Pet (General Biography)</label>
            <textarea 
              className="form-control login-input" 
              style={{ height: '100px', padding: '12px' }}
              placeholder="Tell us about your pet's life, daily schedule, and favorite toys..."
              value={aboutPet}
              onChange={(e) => setAboutPet(e.target.value)}
            />
          </div>
          </div>
          )}
        </div>

        {/* Section 4 & 5: Adoption & Active Status */}
        <div className="pet-form-section">
          <div className="pet-section-header" onClick={() => toggleSection('status')}>
            <h3 className="pet-section-title">
              <Sparkles size={18} color="var(--color-primary)" />
              4. Adoption & Active Status
            </h3>
            {sectionsExpanded.status ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>

          {sectionsExpanded.status && (
            <div className="pet-section-body fade-in">

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
            <div className="pet-grid-2 fade-in" style={{ marginTop: '16px' }}>
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
                  <span className="pet-toggle-subtitle">Allow buyers to negotiate offers?</span>
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
          )}
        </div>

        {/* Section 6: Location */}
        <div className="pet-form-section">
          <div className="pet-section-header" onClick={() => toggleSection('location')}>
            <h3 className="pet-section-title">
              <MapPin size={18} color="var(--color-primary)" />
              5. Location
            </h3>
            {sectionsExpanded.location ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>

          {sectionsExpanded.location && (
            <div className="pet-section-body fade-in">

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

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Address (Optional)</label>
            <input 
              type="text" 
              className="form-control login-input" 
              placeholder="e.g. House 45, Sector B, DHA Phase 5"
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
            />
          </div>
          </div>
          )}
        </div>

        {/* Section 7: Documents Drag & Drop */}
        <div className="pet-form-section">
          <div className="pet-section-header" onClick={() => toggleSection('documents')}>
            <h3 className="pet-section-title">
              <FileText size={18} color="var(--color-primary)" />
              6. Documents & Reports
            </h3>
            {sectionsExpanded.documents ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>

          {sectionsExpanded.documents && (
            <div className="pet-section-body fade-in">

          <div className="pet-drag-drop-zone" onClick={() => docFileRef.current.click()}>
            <Upload size={32} />
            <span className="pet-drag-title">Click to upload vaccination cards, medical reports, or extra images.</span>
            <span className="pet-drag-subtitle">(Supported formats: PDF, JPEG, PNG)</span>
            <input 
              type="file" 
              ref={docFileRef} 
              style={{ display: 'none' }} 
              multiple 
              onChange={handleDocsUpload} 
            />
          </div>

          {documents.length > 0 && (
            <div className="pet-docs-list">
              {documents.map((doc, idx) => (
                <div key={idx} className="pet-doc-card">
                  {doc.fileType.startsWith('image/') ? (
                    <img src={doc.data} alt="Doc Preview" className="pet-doc-preview-img" />
                  ) : (
                    <div className="pet-doc-placeholder-icon">
                      <FileText size={28} />
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
          )}
        </div>

        {/* Action Buttons */}
        <div className="pet-form-actions">
          <button type="button" className="pet-form-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="pet-form-btn-save" disabled={loading}>
            {loading ? 'Saving...' : petId ? 'Save Updates' : 'Save Companion'}
          </button>
        </div>

      </form>

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
