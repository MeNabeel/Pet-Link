import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, ShieldCheck, Heart, User, Sparkles } from 'lucide-react';
import './MyPets.css';
import PetImage from '../components/PetImage';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/Skeleton';

export default function MyPets({ user, onViewDetails, onAddPet, onEditPet, onDeletePet }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletePetId, setDeletePetId] = useState(null);

  const fetchPets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/pets/owner/${user._id}`);
      const data = await response.json();
      if (response.ok) {
        setPets(data);
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchPets();
    }
  }, [user]);

  const handleDeleteClick = (e, petId) => {
    e.stopPropagation();
    setDeletePetId(petId);
  };

  const proceedDelete = async () => {
    if (!deletePetId) return;
    try {
      const response = await fetch(`${API_URL}/api/pets/${deletePetId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPets();
        if (onDeletePet) onDeletePet(deletePetId);
      } else {
        console.error("Failed to delete pet profile");
      }
    } catch (err) {
      console.error("Delete pet error:", err);
    } finally {
      setDeletePetId(null);
    }
  };

  const filteredPets = pets.filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.breed || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pets-container fade-in">
      
      {/* Top Header Bar */}
      <div className="pets-header">
        <div className="pets-title-area">
          <h2 className="pets-title">Your Furry Family</h2>
          <span className="pets-subtitle">Manage profiles, health records, and vaccination cards.</span>
        </div>

        <div className="pets-actions-row">
          <div className="input-wrapper" style={{ margin: 0 }}>
            <Search className="input-icon-left" size={16} />
            <input 
              type="text" 
              className="pets-search-input" 
              placeholder="Search companion name or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="pets-btn-add" onClick={onAddPet}>
            <Plus size={16} style={{ flexShrink: 0 }} />
            <span className="btn-add-text">Add Pet</span>
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="pets-grid">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="pet-card">
              <Skeleton width="100%" height="160px" style={{ borderRadius: '12px 12px 0 0' }} />
              <div className="pet-card-content" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <Skeleton width="100px" height="14px" style={{ marginBottom: '6px' }} />
                    <Skeleton width="120px" height="11px" />
                  </div>
                  <Skeleton width="50px" height="18px" style={{ borderRadius: '6px' }} />
                </div>
                <Skeleton width="100%" height="12px" style={{ marginBottom: '6px' }} />
                <Skeleton width="90px" height="12px" style={{ marginBottom: '14px' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Skeleton width="80px" height="28px" style={{ borderRadius: '8px' }} />
                  <Skeleton width="80px" height="28px" style={{ borderRadius: '8px' }} />
                  <Skeleton width="28px" height="28px" style={{ borderRadius: '8px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredPets.length === 0 ? (
            <div className="pet-empty-container">
              <Sparkles size={48} color="var(--color-muted)" />
              <h4 className="pet-empty-title">No companions found</h4>
              <span className="pet-empty-subtitle">Get started by clicking the "Add Pet" button above.</span>
            </div>
          ) : (
            <div className="pets-grid">
              {filteredPets.map((pet) => (
                <div 
                  key={pet._id} 
                  className="pet-card" 
                  onClick={() => onViewDetails(pet._id)}
                  style={{ cursor: 'pointer' }}
                >
                  
                  {/* Photo Section */}
                  <div className="pet-card-image-wrapper">
                    <PetImage src={pet.image} imageSettings={pet.imageSettings} type="card" className="pet-card-image" />
                    
                    <span className={`pet-details-badge status-${(pet.activeStatus || 'ACTIVE').toLowerCase().replace(/_/g, '-')}`} style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '9px', padding: '4px 10px', opacity: 0.9 }}>
                      {(pet.activeStatus || 'ACTIVE').replace('_', ' ')}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="pet-card-content">
                    <div className="pet-card-title-row">
                      <div>
                        <h4 className="pet-card-name">{pet.name}</h4>
                        <span className="pet-card-breed">{pet.breed} • {pet.species}</span>
                      </div>
                      <span className={`pet-card-gender-badge ${(pet.gender || 'Male').toLowerCase()}`}>
                        {pet.gender || 'Male'}
                      </span>
                    </div>

                    {/* Capsule Highlights */}
                    <div className="pet-card-capsules" style={{ marginBottom: '18px' }}>
                      <div className="pet-capsule">
                        <User size={11} color="var(--color-muted)" />
                        <span>{pet.age}</span>
                      </div>
                      <div className="pet-capsule">
                        <Sparkles size={11} color="var(--color-muted)" />
                        <span>{pet.weight}</span>
                      </div>
                      {pet.isVaccinated ? (
                        <div className="pet-capsule vaccinated">
                          <ShieldCheck size={11} color="#fff" />
                          <span>Vaccinated</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action buttons inside the card */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-bg-light)', paddingTop: '12px', marginTop: 'auto' }}>
                      <button 
                        className="pet-btn-outline" 
                        style={{ flex: 1, padding: '6px 12px', fontSize: '11px', justifyContent: 'center' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPet(pet._id);
                        }}
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button 
                        className="pet-btn-outline danger" 
                        style={{ flex: 1, padding: '6px 12px', fontSize: '11px', justifyContent: 'center' }}
                        onClick={(e) => handleDeleteClick(e, pet._id)}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}
        </>
      )}

      <AlertDialog open={deletePetId !== null} onOpenChange={(open) => { if (!open) setDeletePetId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Companion Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this companion profile? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={proceedDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
