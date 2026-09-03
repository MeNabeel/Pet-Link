import API_URL from '@/config';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Heart, Eye, MapPin, Sparkles, AlertTriangle, 
  RefreshCw, LayoutGrid, List, SlidersHorizontal, ShieldCheck, 
  User, Calendar, Smile, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import PetImage from '../components/PetImage';
import './Marketplace.css';

export default function Marketplace({ user, onViewDetails }) {
  // UI State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [quickViewPet, setQuickViewPet] = useState(null);
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);
  
  // Data State
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  // Wishlist State (List of favorited Pet IDs)
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [savingFavId, setSavingFavId] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listingType, setListingType] = useState('all'); // 'all' | 'FOR_SALE' | 'FOR_ADOPTION'
  
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  
  const [vaccinated, setVaccinated] = useState(false);
  const [friendlyWithKids, setFriendlyWithKids] = useState(false);
  const [friendlyWithPets, setFriendlyWithPets] = useState(false);
  const [trainingLevel, setTrainingLevel] = useState('');
  
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  // Report State
  const [reportingPet, setReportingPet] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Real-time debounce search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Wishlist Items
  const fetchWishlist = useCallback(async () => {
    const userId = user && (user._id || user.id);
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/api/wishlist/owner/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const ids = new Set((data.wishlist || []).map(p => p._id || p.id));
        setWishlistIds(ids);
      }
    } catch (err) {
      console.error('Error fetching user wishlist:', err);
    }
  }, [user]);

  // Fetch Marketplace Data
  const fetchMarketplace = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: debouncedSearch,
        sort
      });

      if (species) queryParams.append('species', species);
      if (breed) queryParams.append('breed', breed);
      if (gender) queryParams.append('gender', gender);
      if (age) queryParams.append('age', age);
      if (size) queryParams.append('size', size);
      if (color) queryParams.append('color', color);
      if (vaccinated) queryParams.append('vaccinated', 'true');
      if (friendlyWithKids) queryParams.append('friendlyWithKids', 'true');
      if (friendlyWithPets) queryParams.append('friendlyWithPets', 'true');
      if (trainingLevel) queryParams.append('trainingLevel', trainingLevel);
      if (city) queryParams.append('city', city);
      if (province) queryParams.append('province', province);
      
      if (listingType !== 'all') {
        queryParams.append('listingType', listingType);
      }

      if (listingType !== 'FOR_ADOPTION') {
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
      }

      const response = await fetch(`${API_URL}/api/marketplace?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load marketplace data. Please try again.');
      }
      
      const data = await response.json();
      setPets(data.pets || []);
      setTotalPages((data.pagination && data.pagination.pages) || 1);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Server error loading marketplace.');
    } finally {
      setLoading(false);
    }
  }, [
    page, debouncedSearch, sort, species, breed, gender, age, size, color,
    vaccinated, friendlyWithKids, friendlyWithPets, trainingLevel, city,
    province, listingType, minPrice, maxPrice
  ]);

  // Trigger main query
  useEffect(() => {
    fetchMarketplace();
  }, [fetchMarketplace]);

  // Trigger wishlist sync
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Wishlist Heart Click Handler
  const handleToggleFavorite = async (e, targetPetId) => {
    e.stopPropagation();
    const userId = user && (user._id || user.id);
    if (!userId) {
      alert('Please log in to save pets to your wishlist.');
      return;
    }

    const isFavorited = wishlistIds.has(targetPetId);
    setSavingFavId(targetPetId);

    try {
      const endpoint = isFavorited ? 'remove' : 'add';
      const response = await fetch(`${API_URL}/api/wishlist/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, petId: targetPetId })
      });

      if (response.ok) {
        const updated = new Set(wishlistIds);
        if (isFavorited) {
          updated.delete(targetPetId);
        } else {
          updated.add(targetPetId);
        }
        setWishlistIds(updated);
      } else {
        const errData = await response.json();
        alert(errData.message || 'Failed to update wishlist.');
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setSavingFavId(null);
    }
  };

  // Submit Listing Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim() || !reportingPet) return;
    
    setIsSubmittingReport(true);
    try {
      const response = await fetch(`${API_URL}/api/marketplace/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter: user._id || user.id,
          petId: reportingPet._id || reportingPet.id,
          reason: reportReason
        })
      });

      if (response.ok) {
        alert('Thank you for your report. Administrative staff will review the listing.');
        setReportingPet(null);
        setReportReason('');
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error('Report submission error:', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setSpecies('');
    setBreed('');
    setGender('');
    setAge('');
    setSize('');
    setColor('');
    setVaccinated(false);
    setFriendlyWithKids(false);
    setFriendlyWithPets(false);
    setTrainingLevel('');
    setCity('');
    setProvince('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setListingType('all');
    setShowOnlyWishlist(false);
    setPage(1);
  };

  // Share Listing Link
  const handleShareListing = (e, pet) => {
    e.stopPropagation();
    const targetId = pet._id || pet.id;
    const url = `${window.location.origin}/marketplace/${targetId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert(`Copied link to clipboard for ${pet.name}!`);
    } else {
      alert(`Share link: ${url}`);
    }
  };

  const displayedPets = showOnlyWishlist 
    ? pets.filter(p => wishlistIds.has(p._id || p.id)) 
    : pets;

  return (
    <div className="marketplace-container">
      
      {/* CLEAN COMPACT MARKETPLACE HEADER */}
      <div className="marketplace-clean-header">
        <div className="marketplace-header-title-box">
          <h2 className="marketplace-title">Marketplace & Adoption Hub</h2>
          <p className="marketplace-subtitle">
            Browse verified companions, profiles for sale, and pets seeking immediate adoption across Pakistan.
          </p>
        </div>

        <div className="marketplace-header-toolbar">
          {/* PROMINENT MARKETPLACE SEARCH BAR */}
          <div className="marketplace-main-search">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Search by companion name, breed, species, or city..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* SAVED / WISHLIST FILTER BUTTON */}
          <button 
            type="button"
            className={`marketplace-saved-btn ${showOnlyWishlist ? 'active' : ''}`}
            onClick={() => { setShowOnlyWishlist(!showOnlyWishlist); setPage(1); }}
            title={showOnlyWishlist ? "Show All Listings" : "Show Saved Wishlist"}
          >
            <Heart size={16} fill={showOnlyWishlist ? "#EF4444" : "none"} color={showOnlyWishlist ? "#EF4444" : "#64748B"} />
            <span>Saved ({wishlistIds.size})</span>
          </button>
        </div>
      </div>

      {/* Main Work Layout */}
      <div className="marketplace-work-layout">
        
        {/* Left Sticky Sidebar Form Filters */}
        <aside className={`marketplace-filters-sidebar ${isFilterExpanded ? 'open' : 'collapsed'}`}>
          <div className="sidebar-filter-header">
            <span className="sidebar-title">
              <SlidersHorizontal size={16} /> Filters
            </span>
            <button className="reset-filters-btn" onClick={handleResetFilters}>Reset All</button>
          </div>

          <div className="sidebar-scrollable-content">
            {/* Listing type segmented selector */}
            <div className="filter-group">
              <label className="filter-label">Listing Type</label>
              <div className="segmented-control">
                <button 
                  className={`segment-btn ${listingType === 'all' ? 'active' : ''}`}
                  onClick={() => { setListingType('all'); setPage(1); }}
                >
                  All
                </button>
                <button 
                  className={`segment-btn ${listingType === 'FOR_SALE' ? 'active' : ''}`}
                  onClick={() => { setListingType('FOR_SALE'); setPage(1); }}
                >
                  For Sale
                </button>
                <button 
                  className={`segment-btn ${listingType === 'FOR_ADOPTION' ? 'active' : ''}`}
                  onClick={() => { setListingType('FOR_ADOPTION'); setPage(1); }}
                >
                  Adoption
                </button>
              </div>
            </div>

            {/* Conditional Price Range Inputs */}
            {listingType !== 'FOR_ADOPTION' && (
              <div className="filter-group fade-in">
                <label className="filter-label">Price Range (PKR)</label>
                <div className="price-inputs-row">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} 
                  />
                  <span className="price-separator">to</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} 
                  />
                </div>
              </div>
            )}

            {/* Species dropdown filter */}
            <div className="filter-group">
              <label className="filter-label">Species</label>
              <select 
                value={species} 
                onChange={(e) => { setSpecies(e.target.value); setBreed(''); setPage(1); }}
                className="filter-select"
              >
                <option value="">All Species</option>
                <option value="Dog">Dogs</option>
                <option value="Cat">Cats</option>
                <option value="Bird">Birds</option>
                <option value="Fish">Fish</option>
                <option value="Rabbit">Rabbits</option>
              </select>
            </div>

            {/* Breed input */}
            <div className="filter-group">
              <label className="filter-label">Breed</label>
              <input 
                type="text" 
                placeholder="e.g. Persian, German Shepherd" 
                value={breed} 
                onChange={(e) => { setBreed(e.target.value); setPage(1); }}
                className="filter-input"
              />
            </div>

            {/* Gender Selection */}
            <div className="filter-group">
              <label className="filter-label">Gender</label>
              <select 
                value={gender} 
                onChange={(e) => { setGender(e.target.value); setPage(1); }}
                className="filter-select"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Age dropdown filter */}
            <div className="filter-group">
              <label className="filter-label">Age Range</label>
              <select 
                value={age} 
                onChange={(e) => { setAge(e.target.value); setPage(1); }}
                className="filter-select"
              >
                <option value="">All Ages</option>
                <option value="Puppy / Kitten">Puppy / Kitten (&lt; 6 months)</option>
                <option value="Young">Young (&lt; 2 yrs)</option>
                <option value="Adult">Adult (2 - 7 yrs)</option>
                <option value="Senior">Senior (&gt; 7 yrs)</option>
              </select>
            </div>

            {/* Location filters */}
            <div className="filter-group">
              <label className="filter-label">Province</label>
              <input 
                type="text" 
                placeholder="e.g. Punjab, Sindh" 
                value={province} 
                onChange={(e) => { setProvince(e.target.value); setPage(1); }}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">City</label>
              <input 
                type="text" 
                placeholder="e.g. Lahore, Karachi" 
                value={city} 
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                className="filter-input"
              />
            </div>

            {/* Checkbox Attributes */}
            <div className="checkbox-filters-group">
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={vaccinated} 
                  onChange={(e) => { setVaccinated(e.target.checked); setPage(1); }} 
                />
                <span>Vaccinated Only</span>
              </label>

              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={friendlyWithKids} 
                  onChange={(e) => { setFriendlyWithKids(e.target.checked); setPage(1); }} 
                />
                <span>Friendly with Kids</span>
              </label>

              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={friendlyWithPets} 
                  onChange={(e) => { setFriendlyWithPets(e.target.checked); setPage(1); }} 
                />
                <span>Friendly with Other Pets</span>
              </label>
            </div>

          </div>
        </aside>

        {/* Right Directory Content Panel */}
        <section className="marketplace-directory-panel">
          
          {/* List Settings Control Header */}
          <div className="directory-settings-header">
            <div className="results-count-area">
              {loading ? (
                <Skeleton width="120px" height="18px" />
              ) : (
                <span className="results-counter">
                  {showOnlyWishlist ? `Showing ${displayedPets.length} saved companion(s)` : `Showing ${displayedPets.length} companion(s)`}
                </span>
              )}
            </div>

            <div className="header-controls-row">
              {/* Sorting Selection */}
              <div className="sort-wrapper">
                <span className="sort-lbl">Sort:</span>
                <select 
                  value={sort} 
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="directory-sort-select"
                >
                  <option value="newest">Newest Listed</option>
                  <option value="oldest">Oldest Listed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="recently_updated">Recently Updated</option>
                </select>
              </div>

              {/* View switches */}
              <div className="view-mode-toggles">
                <button 
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  type="button"
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Directory Listings */}
          {loading ? (
            <div className={`pets-directory-list ${viewMode}`}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="skeleton-card-container">
                  <Skeleton width="100%" height={viewMode === 'grid' ? '200px' : '100%'} style={{ borderRadius: '16px' }} />
                  <div style={{ padding: '16px', flex: 1 }}>
                    <Skeleton width="120px" height="18px" style={{ marginBottom: '10px' }} />
                    <Skeleton width="80px" height="12px" style={{ marginBottom: '20px' }} />
                    <Skeleton width="100%" height="32px" style={{ borderRadius: '8px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="marketplace-error-state">
              <AlertTriangle size={48} className="error-icon" />
              <h4 className="error-title">Database Sync Error</h4>
              <p className="error-desc">{error}</p>
              <button className="error-retry-btn" onClick={fetchMarketplace}>
                <RefreshCw size={14} style={{ marginRight: '6px' }} /> Retry Connection
              </button>
            </div>
          ) : displayedPets.length === 0 ? (
            <div className="marketplace-empty-state">
              <Smile size={48} className="empty-icon" />
              <h4 className="empty-title">
                {showOnlyWishlist ? 'No saved companions in wishlist' : 'No listings found'}
              </h4>
              <p className="empty-desc">
                {showOnlyWishlist 
                  ? 'Click the heart icon on any pet listing to save it to your wishlist.' 
                  : 'No furry friends match your filter settings. Reset filters to load available marketplace pets.'}
              </p>
              <button className="empty-reset-btn" onClick={handleResetFilters}>Reset Filters</button>
            </div>
          ) : (
            <motion.div 
              layout 
              className={`pets-directory-list ${viewMode}`}
            >
              <AnimatePresence mode="popLayout">
                {displayedPets.map((pet) => {
                  const targetId = pet._id || pet.id;
                  const isFavorited = wishlistIds.has(targetId);
                  
                  return (
                    <motion.div
                      key={targetId}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`marketplace-pet-card hover-lift ${viewMode}`}
                      onClick={() => onViewDetails(targetId)}
                    >
                      {/* Photo Header */}
                      <div className="card-media-wrapper">
                        <PetImage src={pet.image} imageSettings={pet.imageSettings} type="card" className="pet-img" />
                        
                        {/* Listing type badge */}
                        <span className={`listing-type-badge ${pet.activeStatus.toLowerCase()}`}>
                          {pet.activeStatus === 'FOR_SALE' ? 'For Sale' : 'For Adoption'}
                        </span>

                        {/* Top Right Action Overlay: Eye Icon Quick View & Heart Icon Wishlist */}
                        <div className="card-media-actions-overlay">
                          <button 
                            type="button"
                            className="card-media-icon-btn eye-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickViewPet(pet);
                            }}
                            title="Quick View Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button 
                            type="button"
                            className={`card-media-icon-btn heart-btn ${isFavorited ? 'favorited' : ''} ${savingFavId === targetId ? 'loading' : ''}`}
                            onClick={(e) => handleToggleFavorite(e, targetId)}
                            disabled={savingFavId === targetId}
                            title={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
                          >
                            <Heart size={15} fill={isFavorited ? "#EF4444" : "none"} color={isFavorited ? "#EF4444" : "#64748B"} />
                          </button>
                        </div>

                        {/* Species Label */}
                        <span className="species-badge-overlay">{pet.species}</span>
                      </div>

                      {/* Card Meta Content */}
                      <div className="card-info-content">
                        <div className="info-primary-header">
                          <div>
                            <h4 className="pet-name">{pet.name}</h4>
                            <span className="pet-breed">{pet.breed}</span>
                          </div>

                          {/* Pricing Display */}
                          <div className="price-tag-wrapper">
                            {pet.activeStatus === 'FOR_SALE' ? (
                              <div>
                                <span className="price-value">{pet.price ? `${pet.price.toLocaleString()} PKR` : 'Call for Price'}</span>
                                {pet.negotiable && <span className="negotiable-badge">Negotiable</span>}
                              </div>
                            ) : (
                              <span className="adoption-free-badge">Free Adoption</span>
                            )}
                          </div>
                        </div>

                        {/* Specifications grid */}
                        <div className="specifications-badges-grid">
                          <span className="spec-badge">Age: {pet.age}</span>
                          <span className="spec-badge">Gender: {pet.gender}</span>
                          <span className="spec-badge">Size: {pet.size || 'Medium'}</span>
                          {pet.isVaccinated && (
                            <span className="spec-badge vaccinated">
                              <ShieldCheck size={10} style={{ marginRight: '3px' }} /> Vaccinated
                            </span>
                          )}
                        </div>

                        {/* Location and Date */}
                        <div className="card-geography-row">
                          <div className="geo-location">
                            <MapPin size={12} color="var(--color-muted)" />
                            <span>{pet.city}, {pet.province}</span>
                          </div>
                          <span className="posted-date">
                            <Calendar size={10} style={{ marginRight: '3px' }} /> {new Date(pet.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Owner Information */}
                        {pet.owner && (
                          <div className="card-owner-profile">
                            <div className="owner-avatar">
                              {pet.owner.profilePic ? (
                                <img src={pet.owner.profilePic} alt="Owner" />
                              ) : (
                                <User size={12} />
                              )}
                            </div>
                            <span className="owner-name">Owner: {pet.owner.name}</span>
                          </div>
                        )}

                        {/* Card Actions Row */}
                        <div className="card-actions-wrapper" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button"
                            className="card-action-btn primary"
                            onClick={() => onViewDetails(targetId)}
                          >
                            View Details
                          </button>

                          <div className="extra-action-buttons">
                            <button 
                              type="button"
                              className="circle-action-btn"
                              onClick={(e) => handleShareListing(e, pet)}
                              title="Share Listing Link"
                            >
                              <Sparkles size={12} />
                            </button>
                            <button 
                              type="button"
                              className="circle-action-btn report"
                              onClick={() => setReportingPet(pet)}
                              title="Report Listing"
                            >
                              <ShieldAlert size={12} />
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination bar */}
          {totalPages > 1 && !showOnlyWishlist && (
            <div className="marketplace-pagination-bar">
              <button 
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button 
                className="pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}

        </section>
      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewPet && (
        <div className="pet-details-drawer-overlay" onClick={() => setQuickViewPet(null)}>
          <div className="pet-details-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', borderRadius: '20px' }}>
            <div className="pet-drawer-header">
              <h3 className="pet-drawer-title">{quickViewPet.name} Quick Overview</h3>
              <button type="button" className="pet-drawer-close-btn" onClick={() => setQuickViewPet(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '140px', height: '140px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                <PetImage src={quickViewPet.image} imageSettings={quickViewPet.imageSettings} type="card" style={{ height: '100%' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>{quickViewPet.name}</h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{quickViewPet.breed} • {quickViewPet.species}</p>
                <div style={{ marginTop: '4px' }}>
                  {quickViewPet.activeStatus === 'FOR_SALE' ? (
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#10B981' }}>
                      {quickViewPet.price ? `${quickViewPet.price.toLocaleString()} PKR` : 'Call for Price'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#EA580C', backgroundColor: '#FFEDD5', padding: '3px 8px', borderRadius: '6px' }}>
                      Free Adoption
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#334155', margin: '4px 0 0 0' }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {quickViewPet.city}, {quickViewPet.province}
                </p>
              </div>
            </div>

            <div className="pet-card-rows-list" style={{ marginBottom: '20px' }}>
              <div className="pet-row-item">
                <span className="pet-row-label">Age</span>
                <span className="pet-row-val">{quickViewPet.age}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Gender</span>
                <span className="pet-row-val">{quickViewPet.gender}</span>
              </div>
              <div className="pet-row-item">
                <span className="pet-row-label">Vaccination</span>
                <span className="pet-row-val">{quickViewPet.isVaccinated ? 'Vaccinated' : 'Not Vaccinated'}</span>
              </div>
              {quickViewPet.aboutPet && (
                <div className="pet-row-item vertical border-none">
                  <span className="pet-row-label">Biography</span>
                  <span className="pet-row-val" style={{ width: '100%', textAlign: 'left', marginTop: '4px' }}>
                    {quickViewPet.aboutPet}
                  </span>
                </div>
              )}
            </div>

            <div className="pet-modal-actions">
              <button type="button" className="pet-modal-btn-cancel" onClick={() => setQuickViewPet(null)}>
                Close
              </button>
              <button 
                type="button" 
                className="pet-modal-btn-save" 
                onClick={() => {
                  const targetId = quickViewPet._id || quickViewPet.id;
                  setQuickViewPet(null);
                  onViewDetails(targetId);
                }}
              >
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT LISTING MODAL */}
      {reportingPet && (
        <div className="pet-details-drawer-overlay" onClick={() => setReportingPet(null)}>
          <div className="pet-details-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="pet-drawer-header">
              <h3 className="pet-drawer-title">Report Listing: {reportingPet.name}</h3>
              <button type="button" className="pet-drawer-close-btn" onClick={() => setReportingPet(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReport}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Reason for reporting</label>
                <textarea 
                  className="form-control login-input" 
                  style={{ height: '90px', padding: '10px' }}
                  placeholder="Inaccurate details, inappropriate content, fraudulent pricing..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                />
              </div>

              <div className="pet-modal-actions">
                <button type="button" className="pet-modal-btn-cancel" onClick={() => setReportingPet(null)}>
                  Cancel
                </button>
                <button type="submit" className="pet-delete-confirm-btn" disabled={isSubmittingReport}>
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
