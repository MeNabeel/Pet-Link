import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, ShieldCheck, Heart, User, Calendar, 
  MessageSquare, PawPrint, Info, Sparkles, Smile, ShieldAlert, 
  Activity, Clipboard, Phone, Mail, Award, CheckSquare, X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import PetImage from '../components/PetImage';
import './MarketplacePetDetails.css';

export default function MarketplacePetDetails({ user, petId, onBack }) {
  const [pet, setPet] = useState(null);
  const [similarPets, setSimilarPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab control in details page
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'health' | 'owner'

  // Contact Dialogs
  const [isContacting, setIsContacting] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

  // Fetch pet detail and similar suggestions
  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`${API_URL}/api/pets/${petId}`);
        if (!response.ok) {
          throw new Error('Pet profile not found or server is unreachable.');
        }
        
        const data = await response.json();
        setPet(data);

        // Fetch similar recommendation listings
        const similarRes = await fetch(`${API_URL}/api/marketplace/similar/${petId}`);
        if (similarRes.ok) {
          const similarData = await similarRes.json();
          setSimilarPets(similarData.similarPets || []);
        }
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError(err.message || 'Error loading pet profile.');
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPetDetails();
    }
  }, [petId]);

  // Contact Action Submission Handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setIsSubmittingMessage(true);
    try {
      // Simulate backend message router
      await new Promise(resolve => setTimeout(resolve, 800));
      alert(`Message successfully sent to ${pet.owner.name} regarding ${pet.name}!`);
      setIsContacting(false);
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleMessageTrigger = (actionType) => {
    setContactSubject(
      actionType === 'buy' 
        ? `Inquiry regarding purchasing ${pet.name}`
        : actionType === 'adopt'
        ? `Adoption request for ${pet.name}`
        : `General message about ${pet.name}`
    );
    setContactMessage(
      actionType === 'buy'
        ? `Hello ${pet.owner.name}, I am interested in purchasing ${pet.name} listed for ${pet.price.toLocaleString()} PKR. Please let me know the best time to speak.`
        : actionType === 'adopt'
        ? `Hello ${pet.owner.name}, I would love to request the adoption of ${pet.name} as a family companion. I can provide a loving environment and would love to arrange a meeting.`
        : `Hello ${pet.owner.name}, I had some questions about ${pet.name}'s daily routine and medical history. Please reach out to me when available.`
    );
    setIsContacting(true);
  };

  if (loading) {
    return (
      <div className="pet-details-loading-container">
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <Skeleton width="120px" height="32px" style={{ marginBottom: '24px', borderRadius: '8px' }} />
          <div className="pet-details-layout">
            <Skeleton width="100%" height="400px" style={{ borderRadius: '24px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Skeleton width="200px" height="24px" />
              <Skeleton width="150px" height="14px" />
              <Skeleton width="100%" height="120px" style={{ borderRadius: '16px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="marketplace-error-state" style={{ margin: '40px auto', maxWidth: '500px' }}>
        <ShieldAlert size={48} color="#EF4444" />
        <h4 className="error-title">Profile Sync Error</h4>
        <p className="error-desc">{error || 'Could not find details for this listing.'}</p>
        <button className="empty-reset-btn" onClick={onBack}>Go Back to Marketplace</button>
      </div>
    );
  }

  return (
    <div className="pet-details-outer-wrapper">
      {/* Back to Marketplace Link */}
      <button className="back-to-market-btn hover-lift" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Marketplace
      </button>

      {/* Main Details Workspace */}
      <div className="pet-details-layout">
        
        {/* Left Side: Photo Frame & Quick Badges */}
        <div className="pet-details-photo-card">
          <div className="details-photo-wrapper">
            <PetImage src={pet.image} imageSettings={pet.imageSettings} type="details" className="details-main-img" />
            <span className={`details-type-overlay-badge ${pet.activeStatus.toLowerCase()}`}>
              {pet.activeStatus === 'FOR_SALE' ? 'FOR SALE' : 'FOR ADOPTION'}
            </span>
          </div>

          {/* Quick Specifications Cards */}
          <div className="details-specs-strips-grid">
            <div className="strip-card">
              <span className="strip-label">Species</span>
              <span className="strip-val">{pet.species}</span>
            </div>
            <div className="strip-card">
              <span className="strip-label">Breed</span>
              <span className="strip-val" title={pet.breed}>{pet.breed}</span>
            </div>
            <div className="strip-card">
              <span className="strip-label">Gender</span>
              <span className="strip-val">{pet.gender}</span>
            </div>
            <div className="strip-card">
              <span className="strip-label">Age</span>
              <span className="strip-val">{pet.age}</span>
            </div>
            <div className="strip-card">
              <span className="strip-label">Weight</span>
              <span className="strip-val">{pet.weight || 'N/A'}</span>
            </div>
            <div className="strip-card">
              <span className="strip-label">Size</span>
              <span className="strip-val">{pet.size || 'Medium'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Details & Descriptions */}
        <div className="pet-details-info-card">
          <div className="info-main-header">
            <div>
              <h2 className="details-pet-name">{pet.name}</h2>
              <div className="details-pet-location">
                <MapPin size={14} color="var(--color-muted)" />
                <span>{pet.city}, {pet.province}, {pet.country}</span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="details-price-badge-box">
              {pet.activeStatus === 'FOR_SALE' ? (
                <div style={{ textAlign: 'right' }}>
                  <h3 className="details-price-value">{pet.price ? `${pet.price.toLocaleString()} PKR` : 'Call Owner'}</h3>
                  {pet.negotiable && <span className="details-negotiable-flag">Negotiable</span>}
                </div>
              ) : (
                <h3 className="details-adoption-value">Free Adoption</h3>
              )}
            </div>
          </div>

          {/* Tab Selection Header */}
          <div className="details-tab-nav">
            <button 
              className={`details-nav-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('profile')}
            >
              <PawPrint size={14} /> Profile & Behaviour
            </button>
            <button 
              className={`details-nav-btn ${activeSubTab === 'health' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('health')}
            >
              <Activity size={14} /> Health & Vaccines
            </button>
            <button 
              className={`details-nav-btn ${activeSubTab === 'owner' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('owner')}
            >
              <User size={14} /> Owner & Contact
            </button>
          </div>

          {/* Tab 1: Profile & Behaviour */}
          {activeSubTab === 'profile' && (
            <div className="tab-pane-content fade-in">
              <div className="info-block">
                <h4 className="info-block-title"><Info size={16} /> Biography</h4>
                <p className="pet-bio-text">
                  {pet.aboutPet || 'The owner has not provided a detailed biography description yet. Please contact the owner for more details.'}
                </p>
              </div>

              <div className="info-block-grid">
                <div className="info-block">
                  <h4 className="info-block-title"><Award size={16} /> Personality Type</h4>
                  <p className="badge-like-text">{pet.personality || 'Friendly, playful, energetic'}</p>
                </div>
                <div className="info-block">
                  <h4 className="info-block-title"><Smile size={16} /> Typical Behaviour</h4>
                  <p className="badge-like-text">{pet.behaviour || 'Well behaved, calm around strangers'}</p>
                </div>
              </div>

              <div className="behaviour-check-list-grid">
                <div className="check-item-card">
                  <CheckSquare size={16} className={pet.friendlyWithKids ? 'checked' : 'unchecked'} />
                  <div>
                    <span className="check-title">Friendly with Kids</span>
                    <span className="check-desc">{pet.friendlyWithKids ? 'Safe to play with children' : 'Requires supervision'}</span>
                  </div>
                </div>
                
                <div className="check-item-card">
                  <CheckSquare size={16} className={pet.friendlyWithPets ? 'checked' : 'unchecked'} />
                  <div>
                    <span className="check-title">Friendly with Other Pets</span>
                    <span className="check-desc">{pet.friendlyWithPets ? 'Gets along with other pets' : 'Prefers being the only pet'}</span>
                  </div>
                </div>

                <div className="check-item-card">
                  <CheckSquare size={16} className={pet.neuteredSpayed ? 'checked' : 'unchecked'} />
                  <div>
                    <span className="check-title">Neutered / Spayed</span>
                    <span className="check-desc">{pet.neuteredSpayed ? 'Surgery complete' : 'Not spayed/neutered'}</span>
                  </div>
                </div>

                <div className="check-item-card">
                  <span className="level-label-badge">{pet.trainingLevel || 'None'}</span>
                  <div>
                    <span className="check-title">Training Level</span>
                    <span className="check-desc">Commands and behavior tier</span>
                  </div>
                </div>
              </div>

              {pet.foodPreference && (
                <div className="info-block" style={{ marginTop: '12px' }}>
                  <h4 className="info-block-title"><PawPrint size={16} /> Food Preferences</h4>
                  <p className="badge-like-text">{pet.foodPreference}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Health & Vaccines */}
          {activeSubTab === 'health' && (
            <div className="tab-pane-content fade-in">
              <div className="info-block-grid">
                <div className="info-block">
                  <h4 className="info-block-title"><ShieldCheck size={16} /> Vaccination Status</h4>
                  <span className={`status-badge-inline ${pet.isVaccinated ? 'active' : 'inactive'}`}>
                    {pet.isVaccinated ? 'UP-TO-DATE' : 'PENDING VACCINATION'}
                  </span>
                </div>
                {pet.bloodGroup && (
                  <div className="info-block">
                    <h4 className="info-block-title"><Activity size={16} /> Blood Group</h4>
                    <span className="status-badge-inline active">{pet.bloodGroup}</span>
                  </div>
                )}
              </div>

              {/* Vaccines History Table */}
              <div className="info-block" style={{ marginTop: '16px' }}>
                <h4 className="info-block-title"><Clipboard size={16} /> Completed Vaccination Logs</h4>
                {pet.vaccines && pet.vaccines.length > 0 ? (
                  <div className="records-table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>Vaccine Name</th>
                          <th>Dose Details</th>
                          <th>Given Date</th>
                          <th>Next Due Date</th>
                          <th>Veterinarian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pet.vaccines.map((v, i) => (
                          <tr key={i}>
                            <td><strong>{v.vaccineName}</strong></td>
                            <td>{v.dose}</td>
                            <td>{v.date || 'N/A'}</td>
                            <td>{v.nextDueDate || 'N/A'}</td>
                            <td>{v.veterinarian || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-records-text">No documented vaccination records found on profile.</p>
                )}
              </div>

              {/* Medical History Chronic Chronic */}
              <div className="info-block" style={{ marginTop: '16px' }}>
                <h4 className="info-block-title"><ShieldAlert size={16} /> Chronological Medical History</h4>
                {pet.medicalRecords && pet.medicalRecords.length > 0 ? (
                  <div className="records-table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>Diagnosis</th>
                          <th>Symptoms</th>
                          <th>Treatment Plan</th>
                          <th>Medication</th>
                          <th>Visit Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pet.medicalRecords.map((m, i) => (
                          <tr key={i}>
                            <td><strong>{m.diagnosis || 'Diagnosis'}</strong></td>
                            <td>{m.symptoms || 'N/A'}</td>
                            <td>{m.treatment || 'N/A'}</td>
                            <td>{m.medicine || 'N/A'}</td>
                            <td>{m.visitDate || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-records-text">No medical chronic disease listings declared.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Owner & Contact */}
          {activeSubTab === 'owner' && (
            <div className="tab-pane-content fade-in">
              <div className="owner-card-profile-details">
                <div className="owner-details-header">
                  <div className="owner-details-avatar">
                    {pet.owner.profilePic ? (
                      <img src={pet.owner.profilePic} alt="Owner" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div>
                    <h4 className="owner-details-name">{pet.owner.name}</h4>
                    <span className="owner-details-role">Listing Creator / Owner</span>
                  </div>
                </div>

                <div className="owner-contacts-list">
                  <div className="owner-contact-row">
                    <Mail size={16} color="var(--color-muted)" />
                    <span>{pet.owner.email}</span>
                  </div>
                  {pet.owner.phone && (
                    <div className="owner-contact-row">
                      <Phone size={16} color="var(--color-muted)" />
                      <span>{pet.owner.phone}</span>
                    </div>
                  )}
                  <div className="owner-contact-row">
                    <MapPin size={16} color="var(--color-muted)" />
                    <span>{pet.owner.city}, {pet.owner.province}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Action Buttons depending on type */}
              <div className="owner-contact-action-launchers">
                <button 
                  className="contact-btn message-owner"
                  onClick={() => handleMessageTrigger('message')}
                >
                  <MessageSquare size={16} style={{ marginRight: '8px' }} /> Message Owner
                </button>

                {pet.activeStatus === 'FOR_SALE' ? (
                  <button 
                    className="contact-btn purchase-pet"
                    onClick={() => handleMessageTrigger('buy')}
                  >
                    <Sparkles size={16} style={{ marginRight: '8px' }} /> Buy Pet (Buyout Offer)
                  </button>
                ) : (
                  <button 
                    className="contact-btn request-adoption"
                    onClick={() => handleMessageTrigger('adopt')}
                  >
                    <Heart size={16} style={{ marginRight: '8px' }} /> Request Adoption
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Recommendations Section */}
      {similarPets.length > 0 && (
        <div className="similar-recommendations-section">
          <h3 className="similar-section-title">Similar Listings Nearby</h3>
          <p className="similar-section-subtitle">Based on matched species type, breeds, or location cities.</p>

          <div className="similar-pets-grid">
            {similarPets.map((simPet) => (
              <div 
                key={simPet._id} 
                className="similar-pet-card hover-lift"
                onClick={() => {
                  setPetId(simPet._id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="similar-card-image-wrapper">
                  <PetImage src={simPet.image} imageSettings={simPet.imageSettings} type="card" className="similar-card-img" />
                  <span className={`similar-type-badge ${simPet.activeStatus.toLowerCase()}`}>
                    {simPet.activeStatus === 'FOR_SALE' ? 'Sale' : 'Adoption'}
                  </span>
                </div>
                <div className="similar-card-content" style={{ padding: '12px' }}>
                  <h5 className="similar-pet-name">{simPet.name}</h5>
                  <span className="similar-pet-breed">{simPet.breed} • {simPet.species}</span>
                  
                  <div className="similar-price-row" style={{ marginTop: '6px', fontSize: '12px', fontWeight: '800' }}>
                    {simPet.activeStatus === 'FOR_SALE' ? (
                      <span style={{ color: '#10B981' }}>{simPet.price ? `${simPet.price.toLocaleString()} PKR` : 'Call'}</span>
                    ) : (
                      <span style={{ color: '#EA580C' }}>Free Adoption</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Dialog Overlay */}
      {isContacting && (
        <div className="quickview-backdrop-blur" onClick={() => setIsContacting(false)}>
          <div className="report-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="quickview-dialog-header">
              <h3>Contact Listing Owner</h3>
              <button className="close-dialog-btn" onClick={() => setIsContacting(false)}>&times;</button>
            </div>

            <form onSubmit={handleContactSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Subject</label>
                <input 
                  type="text" 
                  className="form-control login-input" 
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Message Body</label>
                <textarea 
                  className="form-control"
                  style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', lineHeight: '1.6' }}
                  placeholder="Enter details of your request..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button 
                  type="button" 
                  className="qv-action-btn outline" 
                  onClick={() => setIsContacting(false)}
                  disabled={isSubmittingMessage}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="qv-action-btn primary"
                  disabled={isSubmittingMessage || !contactMessage.trim()}
                >
                  {isSubmittingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
