import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Heart, Eye, MapPin, Sparkles, AlertTriangle, 
  RefreshCw, LayoutGrid, List, SlidersHorizontal, ShieldCheck, 
  HelpCircle, User, Calendar, Smile, ShieldAlert
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
  
  // Data State
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalListings: 0,
    forSaleCount: 0,
    forAdoptionCount: 0,
    recentlyAddedCount: 0
  });

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
    if (!user || !user._id) return;
    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/owner/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        const ids = new Set(data.wishlist.map(p => p._id));
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

      // Append pricing queries if not FOR_ADOPTION
      if (listingType !== 'FOR_ADOPTION') {
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
      }

      const response = await fetch(`http://localhost:5000/api/marketplace?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load marketplace data. Please try again.');
      }
      
      const data = await response.json();
      setPets(data.pets || []);
      setTotalPages(data.pagination.pages || 1);
      
      if (data.stats) {
        setStats(data.stats);
      }
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
  const handleToggleFavorite = async (e, petId) => {
    e.stopPropagation();
    if (!user || !user._id) {
      alert('Please log in to save pets to your wishlist.');
      return;
    }

    const isFavorited = wishlistIds.has(petId);
    setSavingFavId(petId);

    try {
      const endpoint = isFavorited ? 'remove' : 'add';
      const response = await fetch(`http://localhost:5000/api/wishlist/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, petId })
      });

      if (response.ok) {
        const updated = new Set(wishlistIds);
        if (isFavorited) {
          updated.delete(petId);
        } else {
          updated.add(petId);
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
      const response = await fetch('http://localhost:5000/api/marketplace/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter: user._id,
          petId: reportingPet._id,
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
    setPage(1);
  };

  // Share Listing Mock
  const handleShareListing = (e, pet) => {
    e.stopPropagation();
    const url = `${window.location.origin}/marketplace/${pet._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert(`Copied link to clipboard for ${pet.name}!`);
    } else {
      alert(`Share link: ${url}`);
    }
  };

  return (
    <div className="marketplace-container">
      {/* Top Banner & Title Section */}
      <div className="marketplace-header-banner">
        <div className="marketplace-header-left">
          <span className="marketplace-badge-pill">
            <Sparkles size={12} /> Live Pet Ecosystem
          </span>
          <h2 className="marketplace-title">Marketplace & Adoption Hub</h2>
          <p className="marketplace-subtitle">
            Find loving companions, verified profiles for sale, and pets seeking immediate adoption across Pakistan.
          </p>

          {/* Quick Search */}
          <div className="marketplace-quick-search">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by companion name, breed, species, location..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Dynamic Analytics Stats Column */}
        <div className="marketplace-stats-card-grid">
          <div className="stats-box hover-lift">
            <span className="stats-label">Total Listings</span>
            <h4 className="stats-number text-blue">{stats.totalListings}</h4>
          </div>
          <div className="stats-box hover-lift">
            <span className="stats-label">For Sale</span>
            <h4 className="stats-number text-emerald">{stats.forSaleCount}</h4>
          </div>
          <div className="stats-box hover-lift">
            <span className="stats-label">For Adoption</span>
            <h4 className="stats-number text-orange">{stats.forAdoptionCount}</h4>
          </div>
          <div className="stats-box hover-lift">
            <span className="stats-label">Recently Added</span>
            <h4 className="stats-number text-purple">{stats.recentlyAddedCount}</h4>
          </div>
        </div>
      </div>

      {/* Main Work Grid Layout */}
      <div className="marketplace-work-layout">
        
        {/* Left Sticky Sidebar Form Filters */}
        <aside className={`marketplace-filters-sidebar ${isFilterExpanded ? 'open' : 'collapsed'}`}>
          <div className="sidebar-filter-header">
            <span className="sidebar-title">
              <SlidersHorizontal size={16} /> Filters Matrix
            </span>
            <button className="reset-filters-btn" onClick={handleResetFilters}>Reset All</button>
          </div>

          <div className="sidebar-scrollable-content">
            {/* listing type segmented selector */}
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

            {/* Size & Color options */}
            <div className="filter-group">
              <label className="filter-label">Size Class</label>
              <select 
                value={size} 
                onChange={(e) => { setSize(e.target.value); setPage(1); }}
                className="filter-select"
              >
                <option value="">All Sizes</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Extra Large">Extra Large</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Coat Color</label>
              <input 
                type="text" 
                placeholder="e.g. Golden, White, Black" 
                value={color} 
                onChange={(e) => { setColor(e.target.value); setPage(1); }}
                className="filter-input"
              />
            </div>

            {/* Training Level */}
            <div className="filter-group">
              <label className="filter-label">Training Level</label>
              <select 
                value={trainingLevel} 
                onChange={(e) => { setTrainingLevel(e.target.value); setPage(1); }}
                className="filter-select"
              >
                <option value="">All Training Levels</option>
                <option value="None">None</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Health & Behavior Checkboxes */}
            <div className="checkbox-filters-group">
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={vaccinated} 
                  onChange={(e) => { setVaccinated(e.target.checked); setPage(1); }} 
                />
                <span>Vaccinated Profiles</span>
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

        {/* Right Directory Content Grid */}
        <section className="marketplace-directory-panel">
          
          {/* List Settings Control Header */}
          <div className="directory-settings-header">
            <div className="results-count-area">
              {loading ? (
                <Skeleton width="120px" height="18px" />
              ) : (
                <span className="results-counter">Showing {pets.length} companions</span>
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
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
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
          ) : pets.length === 0 ? (
            <div className="marketplace-empty-state">
              <Smile size={48} className="empty-icon" />
              <h4 className="empty-title">No listings found</h4>
              <p className="empty-desc">
                No furry friends match your filter settings. Reset the filters to load available marketplace pets.
              </p>
              <button className="empty-reset-btn" onClick={handleResetFilters}>Reset Filters</button>
            </div>
          ) : (
            <motion.div 
              layout 
              className={`pets-directory-list ${viewMode}`}
            >
              <AnimatePresence mode="popLayout">
                {pets.map((pet) => {
                  const isFavorited = wishlistIds.has(pet._id);
                  const isOwner = user && user._id === (pet.owner._id || pet.owner);
                  
                  return (
                    <motion.div
                      key={pet._id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`marketplace-pet-card hover-lift ${viewMode}`}
                      onClick={() => onViewDetails(pet._id)}
                    >
                      {/* Photo Header */}
                      <div className="card-media-wrapper">
                        <PetImage src={pet.image} imageSettings={pet.imageSettings} type="card" className="pet-img" />
                        
                        {/* Listing type badge */}
                        <span className={`listing-type-badge ${pet.activeStatus.toLowerCase()}`}>
                          {pet.activeStatus === 'FOR_SALE' ? 'For Sale' : 'For Adoption'}
                        </span>

                        {/* Species Label */}
                        <span className="species-badge-overlay">{pet.species}</span>

                        {/* Wishlist Button (Heart) */}
                        <button 
                          className={`fav-heart-btn ${isFavorited ? 'favorited' : ''} ${savingFavId === pet._id ? 'loading' : ''}`}
                          onClick={(e) => handleToggleFavorite(e, pet._id)}
                          disabled={savingFavId === pet._id}
                          title={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
                        >
                          <Heart size={16} fill={isFavorited ? "var(--color-primary)" : "none"} />
                        </button>
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

                        {/* Telemetry specs grid */}
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
                            className="card-action-btn primary"
                            onClick={() => onViewDetails(pet._id)}
                          >
                            View Details
                          </button>
                          
                          <button 
                            className="card-action-btn outline"
                            onClick={() => setQuickViewPet(pet)}
                          >
                            <Eye size={12} style={{ marginRight: '4px' }} /> Quick View
                          </button>

                          <div className="extra-action-buttons">
                            <button 
                              className="circle-action-btn"
                              onClick={(e) => handleShareListing(e, pet)}
                              title="Share Listing Link"
                            >
                              <Sparkles size={12} />
                            </button>
                            <button 
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

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="marketplace-pagination">
              <button 
                className="pagination-arrow-btn"
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              
              <span className="pagination-text">Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
              
              <button 
                className="pagination-arrow-btn"
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          )}

        </section>
      </div>

      {/* Inline Quick View Modal Backdrop */}
      <AnimatePresence>
        {quickViewPet && (
          <div className="quickview-backdrop-blur" onClick={() => setQuickViewPet(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="quickview-dialog-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="quickview-dialog-header">
                <h3>Quick Review Matrix</h3>
                <button className="close-dialog-btn" onClick={() => setQuickViewPet(null)}>&times;</button>
              </div>

              <div className="quickview-dialog-body">
                <div className="quickview-photo-panel">
                  <PetImage src={quickViewPet.image} imageSettings={quickViewPet.imageSettings} type="details" className="quickview-img" />
                  <span className={`quickview-status-badge ${quickViewPet.activeStatus.toLowerCase()}`}>
                    {quickViewPet.activeStatus === 'FOR_SALE' ? 'FOR SALE' : 'ADOPTION'}
                  </span>
                </div>

                <div className="quickview-details-panel">
                  <h4 className="qv-title">{quickViewPet.name}</h4>
                  <span className="qv-breed">{quickViewPet.breed} • {quickViewPet.species}</span>

                  <div className="qv-price-row">
                    {quickViewPet.activeStatus === 'FOR_SALE' ? (
                      <span className="qv-price-val">{quickViewPet.price ? `${quickViewPet.price.toLocaleString()} PKR` : 'Call'}</span>
                    ) : (
                      <span className="qv-adopt-val">Free Adoption</span>
                    )}
                  </div>

                  <div className="qv-specs-table">
                    <div className="qv-spec-row"><strong>Age:</strong> <span>{quickViewPet.age}</span></div>
                    <div className="qv-spec-row"><strong>Gender:</strong> <span>{quickViewPet.gender}</span></div>
                    <div className="qv-spec-row"><strong>Weight:</strong> <span>{quickViewPet.weight}</span></div>
                    <div className="qv-spec-row"><strong>Vaccinated:</strong> <span>{quickViewPet.isVaccinated ? 'Yes' : 'No'}</span></div>
                    <div className="qv-spec-row"><strong>Neutered/Spayed:</strong> <span>{quickViewPet.neuteredSpayed ? 'Yes' : 'No'}</span></div>
                    <div className="qv-spec-row"><strong>Training:</strong> <span>{quickViewPet.trainingLevel}</span></div>
                    <div className="qv-spec-row"><strong>Kids Friendly:</strong> <span>{quickViewPet.friendlyWithKids ? 'Yes' : 'No'}</span></div>
                    <div className="qv-spec-row"><strong>Pets Friendly:</strong> <span>{quickViewPet.friendlyWithPets ? 'Yes' : 'No'}</span></div>
                  </div>

                  <p className="qv-about-snippet">
                    {quickViewPet.aboutPet || 'No bio description provided for this profile.'}
                  </p>

                  <div className="qv-dialog-actions">
                    <button 
                      className="qv-action-btn primary"
                      onClick={() => {
                        onViewDetails(quickViewPet._id);
                        setQuickViewPet(null);
                      }}
                    >
                      View Details Page
                    </button>
                    <button className="qv-action-btn outline" onClick={() => setQuickViewPet(null)}>Close</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {reportingPet && (
          <div className="quickview-backdrop-blur" onClick={() => setReportingPet(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="report-dialog-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="quickview-dialog-header">
                <h3>Report Inappropriate Listing</h3>
                <button className="close-dialog-btn" onClick={() => setReportingPet(null)}>&times;</button>
              </div>

              <form onSubmit={handleSubmitReport} className="report-form" style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                  Please let us know why you are reporting the listing for <strong>{reportingPet.name}</strong>. Admins will review the case shortly.
                </p>

                <textarea 
                  className="form-control"
                  style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                  placeholder="Specify violation (e.g. offensive content, incorrect pricing, duplicate, scam...)"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button 
                    type="button" 
                    className="qv-action-btn outline" 
                    onClick={() => setReportingPet(null)}
                    disabled={isSubmittingReport}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="qv-action-btn primary report-submit-btn"
                    disabled={isSubmittingReport || !reportReason.trim()}
                  >
                    {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
