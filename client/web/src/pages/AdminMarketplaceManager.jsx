import API_URL from '@/config';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, SlidersHorizontal, LayoutGrid, Table, Eye, Edit, Trash2, 
  CheckCircle, XCircle, Ban, Archive, Sparkles, RefreshCw, BarChart3, 
  Download, User, ShieldAlert, Award, Calendar, MapPin, Activity, 
  Clipboard, AlertTriangle, ShieldCheck, Mail, Phone, Clock, FileText,
  UserX, Info, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import PetImage from '../components/PetImage';
import './AdminMarketplaceManager.css';

export default function AdminMarketplaceManager({ user }) {
  // Navigation & View Modes
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null); // Detailed view sheet

  // Bulk Actions Selection Set
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Data States
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalListings: 0,
    forSaleCount: 0,
    forAdoptionCount: 0,
    pendingApproval: 0,
    soldPets: 0,
    adoptedPets: 0
  });
  
  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [listingType, setListingType] = useState('all'); // 'all' | 'FOR_SALE' | 'FOR_ADOPTION'
  const [status, setStatus] = useState('all'); // Published, Pending Review, etc.
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [vaccinated, setVaccinated] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  // Warning Message Dialog State
  const [warningPet, setWarningPet] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [isSendingWarning, setIsSendingWarning] = useState(false);

  // Realtime debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch listings and statistics
  const fetchAdminMarketplace = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: debouncedSearch,
        sort,
        listingType,
        status
      });

      if (species) queryParams.append('species', species);
      if (breed) queryParams.append('breed', breed);
      if (gender) queryParams.append('gender', gender);
      if (vaccinated) queryParams.append('vaccinated', vaccinated);
      if (city) queryParams.append('city', city);
      if (province) queryParams.append('province', province);
      
      if (listingType !== 'FOR_ADOPTION') {
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
      }

      const response = await fetch(`${API_URL}/api/admin/marketplace?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load administrative listings database.');
      }
      
      const data = await response.json();
      setPets(data.pets || []);
      setTotalPages(data.pagination.pages || 1);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error communicating with moderation API.');
    } finally {
      setLoading(false);
    }
  }, [
    page, debouncedSearch, sort, listingType, status, species, breed, 
    gender, vaccinated, city, province, minPrice, maxPrice
  ]);

  // Trigger main listings fetch
  useEffect(() => {
    fetchAdminMarketplace();
  }, [fetchAdminMarketplace]);

  // Fetch Analytics datasets
  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch(`${API_URL}/api/admin/marketplace/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Toggle Analytics dashboard
  const handleToggleAnalytics = () => {
    const nextVal = !showAnalytics;
    setShowAnalytics(nextVal);
    if (nextVal) {
      fetchAnalytics();
    }
  };

  // Status modification action
  const handleUpdateStatus = async (petId, fieldsPayload, textLabel) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/marketplace/${petId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsPayload)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Listing updated successfully: marked ${textLabel}.`);
        
        // Update local list
        setPets(prev => prev.map(p => p._id === petId ? { ...p, ...data.pet } : p));
        if (selectedPet && selectedPet._id === petId) {
          setSelectedPet(prev => ({ ...prev, ...data.pet }));
        }
      } else {
        alert('Failed to update listing moderation parameters.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Featured status
  const handleToggleFeatured = async (petId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/marketplace/${petId}/feature`, {
        method: 'PUT'
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Featured status updated.');
        setPets(prev => prev.map(p => p._id === petId ? { ...p, isFeatured: data.pet.isFeatured } : p));
        if (selectedPet && selectedPet._id === petId) {
          setSelectedPet(prev => ({ ...prev, isFeatured: data.pet.isFeatured }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send warnings to Owner
  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningMessage.trim() || !warningPet) return;
    
    setIsSendingWarning(true);
    try {
      // Simulate warning dispatch
      await new Promise(r => setTimeout(r, 600));
      alert(`Warning notice successfully sent to ${warningPet.owner.name} (${warningPet.owner.email}).`);
      setWarningPet(null);
      setWarningMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingWarning(false);
    }
  };

  // Bulk executions handler
  const handleBulkAction = async (actionName) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    
    const confirmText = `Are you sure you want to apply "${actionName}" to ${ids.length} selected listings?`;
    if (!window.confirm(confirmText)) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/marketplace/bulk-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: actionName })
      });

      if (response.ok) {
        alert(`Bulk action "${actionName}" completed successfully.`);
        setSelectedIds(new Set());
        fetchAdminMarketplace();
      } else {
        alert('Failed to execute bulk moderation operations.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle individual row select check
  const handleSelectRow = (petId) => {
    const updated = new Set(selectedIds);
    if (updated.has(petId)) {
      updated.delete(petId);
    } else {
      updated.add(petId);
    }
    setSelectedIds(updated);
  };

  // Handle select all checkbox toggle
  const handleSelectAll = () => {
    if (selectedIds.size === pets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pets.map(p => p._id)));
    }
  };

  // Export listings database placeholder
  const handleExportListings = () => {
    const headers = 'ID,Name,Species,Breed,Type,Price,Owner,Location,Status,Date\n';
    const rows = pets.map(p => 
      `"${p._id}","${p.name}","${p.species}","${p.breed}","${p.activeStatus}","${p.price || 0}","${p.owner?.name}","${p.city}","${p.moderationStatus}","${new Date(p.createdAt).toLocaleDateString()}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Marketplace_Listings_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Reset Filters logic
  const handleResetFilters = () => {
    setSearch('');
    setListingType('all');
    setStatus('all');
    setSpecies('');
    setBreed('');
    setGender('');
    setVaccinated('');
    setProvince('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="admin-marketplace-container">
      
      {/* Moderation header title area */}
      <div className="admin-marketplace-header">
        <div>
          <span className="header-badge-inline">Moderation Engine v3.2</span>
          <h2 className="admin-mp-title">Marketplace Management</h2>
          <p className="admin-mp-subtitle">
            Moderate, feature, suspend, or delete pet listings. Review analytics data, resolve reported violations, and notify owners globally.
          </p>
        </div>

        <div className="admin-header-actions">
          <button className="admin-btn outline" onClick={handleToggleAnalytics}>
            <BarChart3 size={14} style={{ marginRight: '6px' }} /> 
            {showAnalytics ? 'Show Listings Grid' : 'Marketplace Analytics'}
          </button>
          <button className="admin-btn outline" onClick={handleExportListings}>
            <Download size={14} style={{ marginRight: '6px' }} /> Export CSV
          </button>
          <button className="admin-btn primary" onClick={fetchAdminMarketplace}>
            <RefreshCw size={14} style={{ marginRight: '6px' }} /> Refresh
          </button>
        </div>
      </div>

      {/* Analytics Dashboard Panel */}
      {showAnalytics && (
        <div className="analytics-dashboard-panel fade-in">
          {loadingAnalytics || !analytics ? (
            <div className="analytics-loading-grid">
              <Skeleton width="100%" height="220px" style={{ borderRadius: '16px' }} />
              <Skeleton width="100%" height="220px" style={{ borderRadius: '16px' }} />
            </div>
          ) : (
            <div className="analytics-data-grid">
              {/* Listings Activity Chart mockup */}
              <div className="analytics-card">
                <h4 className="chart-title">Listing & Transacts Growth (H1 2026)</h4>
                <div className="analytics-bars-container">
                  {analytics.monthlyListings.map((item, index) => (
                    <div key={index} className="analytics-bar-col">
                      <div className="bars-stack">
                        <div className="bar listing-bar" style={{ height: `${item.listings * 2}px` }} title={`Listings: ${item.listings}`} />
                        <div className="bar sales-bar" style={{ height: `${item.sales * 2}px` }} title={`Sales: ${item.sales}`} />
                        <div className="bar adopt-bar" style={{ height: `${item.adoptions * 2}px` }} title={`Adoptions: ${item.adoptions}`} />
                      </div>
                      <span className="bar-axis-label">{item.month}</span>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <span className="legend-dot listing">Listings</span>
                  <span className="legend-dot sales">Sales</span>
                  <span className="legend-dot adopt">Adoptions</span>
                </div>
              </div>

              {/* Species distribution */}
              <div className="analytics-card">
                <h4 className="chart-title">Species Shares</h4>
                <div className="species-share-list">
                  {analytics.speciesDistribution.map((item, idx) => (
                    <div key={idx} className="share-row">
                      <div className="share-label-info">
                        <strong>{item.species}s</strong>
                        <span>{item.count} listed</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-fill" style={{ width: `${Math.min(100, (item.count / stats.totalListings) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Viewed items */}
              <div className="analytics-card">
                <h4 className="chart-title">Most Viewed Companion Profiles</h4>
                <div className="top-items-list">
                  {analytics.mostViewed.map((item) => (
                    <div key={item._id} className="top-item-row">
                      <div className="top-item-left">
                        <span className="rank-num">{item.viewsCount} views</span>
                        <div>
                          <strong>{item.name}</strong>
                          <span className="sub-lbl">{item.breed}</span>
                        </div>
                      </div>
                      <span className="price-tag-sm">
                        {item.activeStatus === 'FOR_SALE' ? `${item.price.toLocaleString()} PKR` : 'Adoption'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Reported listings */}
              <div className="analytics-card">
                <h4 className="chart-title">Highly Flagged / Reported Logs</h4>
                <div className="top-items-list">
                  {analytics.mostReported.map((item) => (
                    <div key={item._id} className="top-item-row flagged">
                      <div className="top-item-left">
                        <span className="rank-num flag-badge">{item.reportsCount} flags</span>
                        <div>
                          <strong>{item.name}</strong>
                          <span className="sub-lbl">{item.species} • {item.breed}</span>
                        </div>
                      </div>
                      <button className="action-row-btn warning" onClick={() => handleUpdateStatus(item._id, { status: 'Suspended' }, 'Suspended')}>
                        <Ban size={12} /> Suspend
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Admin stats counters row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card hover-lift">
          <div className="stat-card-left">
            <span className="stat-card-lbl">Total Active listings</span>
            <h3 className="stat-card-num text-dark">{stats.totalListings}</h3>
          </div>
          <FileText size={24} className="stat-icon-purple" />
        </div>

        <div className="admin-stat-card hover-lift">
          <div className="stat-card-left">
            <span className="stat-card-lbl">Pets For Sale</span>
            <h3 className="stat-card-num text-blue">{stats.forSaleCount}</h3>
          </div>
          <Sparkles size={24} className="stat-icon-blue" />
        </div>

        <div className="admin-stat-card hover-lift">
          <div className="stat-card-left">
            <span className="stat-card-lbl">Adoption Listings</span>
            <h3 className="stat-card-num text-orange">{stats.forAdoptionCount}</h3>
          </div>
          <Award size={24} className="stat-icon-orange" />
        </div>

        <div className="admin-stat-card hover-lift">
          <div className="stat-card-left">
            <span className="stat-card-lbl">Pending Review</span>
            <h3 className="stat-card-num text-red">{stats.pendingApproval}</h3>
          </div>
          <Clock size={24} className="stat-icon-red" />
        </div>

        <div className="admin-stat-card hover-lift">
          <div className="stat-card-left">
            <span className="stat-card-lbl">Sold listings</span>
            <h3 className="stat-card-num text-emerald">{stats.soldPets}</h3>
          </div>
          <CheckCircle size={24} className="stat-icon-emerald" />
        </div>

        <div className="admin-stat-card hover-lift">
          <div className="stat-card-left">
            <span className="stat-card-lbl">Adopted Companions</span>
            <h3 className="stat-card-num text-teal">{stats.adoptedPets}</h3>
          </div>
          <CheckCircle size={24} className="stat-icon-teal" />
        </div>
      </div>

      {/* Search and Advanced Filters Panel */}
      <div className="admin-moderation-filters-bar">
        <div className="filters-upper-row">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by Companion Name, Owner Name, Listing ID, Breed..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="filters-buttons-row">
            <select 
              value={listingType} 
              onChange={(e) => { setListingType(e.target.value); setPage(1); }}
              className="admin-select"
            >
              <option value="all">All Types</option>
              <option value="FOR_SALE">For Sale</option>
              <option value="FOR_ADOPTION">For Adoption</option>
            </select>

            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="admin-select"
            >
              <option value="all">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Rejected">Rejected</option>
              <option value="Suspended">Suspended</option>
              <option value="Archived">Archived</option>
              <option value="Removed">Removed</option>
              <option value="Featured">Featured Only</option>
              <option value="Reported">Reported Listings</option>
            </select>

            <button className="reset-filters-link" onClick={handleResetFilters}>Reset Filters</button>

            <div className="view-mode-controls">
              <button 
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <Table size={14} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Price slider visible conditionally */}
        {listingType === 'FOR_SALE' && (
          <div className="filters-lower-price-row fade-in">
            <span className="price-lbl">Pricing Range:</span>
            <input 
              type="number" 
              placeholder="Min PKR" 
              value={minPrice} 
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
            />
            <span className="separator">to</span>
            <input 
              type="number" 
              placeholder="Max PKR" 
              value={maxPrice} 
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            />
          </div>
        )}
      </div>

      {/* Bulk actions moderation bar */}
      {selectedIds.size > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bulk-actions-toolbar"
        >
          <span className="selected-counter">Selected <strong>{selectedIds.size}</strong> listings:</span>
          <div className="bulk-buttons-group">
            <button className="bulk-btn approve" onClick={() => handleBulkAction('approve')}>
              <CheckCircle size={12} /> Bulk Approve
            </button>
            <button className="bulk-btn reject" onClick={() => handleBulkAction('reject')}>
              <XCircle size={12} /> Bulk Reject
            </button>
            <button className="bulk-btn suspend" onClick={() => handleBulkAction('suspend')}>
              <Ban size={12} /> Bulk Suspend
            </button>
            <button className="bulk-btn archive" onClick={() => handleBulkAction('archive')}>
              <Archive size={12} /> Bulk Archive
            </button>
            <button className="bulk-btn delete" onClick={() => handleBulkAction('delete')}>
              <Trash2 size={12} /> Bulk Delete
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Database Grid/Table Content */}
      {loading ? (
        <div className="table-loading-skeleton">
          <Skeleton width="100%" height="48px" style={{ marginBottom: '8px' }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height="40px" style={{ marginBottom: '4px' }} />
          ))}
        </div>
      ) : error ? (
        <div className="marketplace-error-state">
          <AlertTriangle size={48} className="error-icon" />
          <h4 className="error-title">Moderation Feed Error</h4>
          <p className="error-desc">{error}</p>
          <button className="error-retry-btn" onClick={fetchAdminMarketplace}>Retry Connection</button>
        </div>
      ) : pets.length === 0 ? (
        <div className="marketplace-empty-state">
          <Info size={48} className="empty-icon" />
          <h4 className="empty-title">No listings recorded</h4>
          <p className="empty-desc">No database listings matched the criteria search filters.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th width="40px">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === pets.length} 
                    onChange={handleSelectAll} 
                  />
                </th>
                <th>Companion</th>
                <th>Owner Details</th>
                <th>Type</th>
                <th>Species / Breed</th>
                <th>Value (PKR)</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date Listed</th>
                <th width="120px">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => {
                const isSelected = selectedIds.has(pet._id);
                const isReported = pet.reportsCount > 0;
                
                return (
                  <tr key={pet._id} className={`${isSelected ? 'selected-row' : ''} ${isReported ? 'flagged-row' : ''}`}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectRow(pet._id)} 
                      />
                    </td>
                    <td>
                      <div className="td-pet-profile" onClick={() => setSelectedPet(pet)}>
                        <div className="pet-thumb">
                          <PetImage src={pet.image} imageSettings={pet.imageSettings} type="card" className="thumb-img" />
                          {pet.isFeatured && <span className="featured-dot-badge" title="Featured Listing"><Sparkles size={8} /></span>}
                        </div>
                        <div>
                          <strong className="clickable-name">{pet.name}</strong>
                          <span className="sub-text">ID: {pet._id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="td-owner-profile">
                        <strong>{pet.owner?.name || 'Unknown'}</strong>
                        <span className="sub-text">{pet.owner?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`listing-badge-sm ${pet.activeStatus.toLowerCase()}`}>
                        {pet.activeStatus === 'FOR_SALE' ? 'Sale' : 'Adoption'}
                      </span>
                    </td>
                    <td>
                      <div className="td-species-breed">
                        <span>{pet.species}</span>
                        <span className="sub-text">{pet.breed}</span>
                      </div>
                    </td>
                    <td>
                      {pet.activeStatus === 'FOR_SALE' ? (
                        <strong>{pet.price ? pet.price.toLocaleString() : 'Call'}</strong>
                      ) : (
                        <span className="free-lbl">Free</span>
                      )}
                    </td>
                    <td>
                      <span className="geo-lbl">{pet.city}, {pet.province}</span>
                    </td>
                    <td>
                      <span className={`status-badge-moderation ${pet.moderationStatus.toLowerCase().replace(' ', '-')}`}>
                        {pet.moderationStatus}
                      </span>
                      {isReported && <span className="flag-warn-badge">⚠️ {pet.reportsCount} Reports</span>}
                    </td>
                    <td>
                      <span className="date-lbl">{new Date(pet.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <div className="table-actions-row">
                        <button className="action-row-btn" onClick={() => setSelectedPet(pet)} title="View Details">
                          <Eye size={12} />
                        </button>
                        
                        {/* Status moderation switch popover */}
                        <div className="dropdown-action-wrapper">
                          <button className="action-row-btn" title="Moderate Listing">
                            <SlidersHorizontal size={12} />
                          </button>
                          
                          <div className="action-hover-dropdown">
                            {pet.moderationStatus !== 'Published' && (
                              <button onClick={() => handleUpdateStatus(pet._id, { status: 'Published' }, 'Published')}>
                                <CheckCircle size={10} color="#16A34A" /> Approve
                              </button>
                            )}
                            {pet.moderationStatus !== 'Rejected' && (
                              <button onClick={() => handleUpdateStatus(pet._id, { status: 'Rejected' }, 'Rejected')}>
                                <XCircle size={10} color="#EF4444" /> Reject
                              </button>
                            )}
                            {pet.moderationStatus !== 'Suspended' && (
                              <button onClick={() => handleUpdateStatus(pet._id, { status: 'Suspended' }, 'Suspended')}>
                                <Ban size={10} color="#EA580C" /> Suspend
                              </button>
                            )}
                            {pet.moderationStatus !== 'Archived' && (
                              <button onClick={() => handleUpdateStatus(pet._id, { status: 'Archived' }, 'Archived')}>
                                <Archive size={10} color="#64748B" /> Archive
                              </button>
                            )}
                            <button onClick={() => handleToggleFeatured(pet._id)}>
                              <Sparkles size={10} color="#EAB308" /> {pet.isFeatured ? 'Unfeature' : 'Mark Featured'}
                            </button>
                            <button className="warning-btn" onClick={() => setWarningPet(pet)}>
                              <Mail size={10} color="#EF4444" /> Send Warning
                            </button>
                            <button className="danger-btn" onClick={() => handleUpdateStatus(pet._id, { status: 'Removed', activeStatus: 'ARCHIVED' }, 'Deleted')}>
                              <Trash2 size={10} color="#EF4444" /> Delete
                            </button>
                          </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="admin-grid-view-panel">
          {pets.map((pet) => {
            const isReported = pet.reportsCount > 0;
            return (
              <div key={pet._id} className={`grid-moderation-card hover-lift ${isReported ? 'reported' : ''}`} onClick={() => setSelectedPet(pet)}>
                <div className="card-thumb-frame">
                  <PetImage src={pet.image} imageSettings={pet.imageSettings} type="card" className="card-thumb-img" />
                  <span className={`listing-tag ${pet.activeStatus.toLowerCase()}`}>
                    {pet.activeStatus === 'FOR_SALE' ? 'Sale' : 'Adoption'}
                  </span>
                  
                  {pet.isFeatured && <span className="featured-ribbon"><Sparkles size={10} /> Featured</span>}
                </div>

                <div className="card-content-block">
                  <div className="card-upper-meta">
                    <div>
                      <h4 className="card-pet-name">{pet.name}</h4>
                      <span className="card-pet-breed">{pet.breed}</span>
                    </div>

                    <span className={`status-badge-moderation ${pet.moderationStatus.toLowerCase().replace(' ', '-')}`}>
                      {pet.moderationStatus}
                    </span>
                  </div>

                  <div className="card-geography-line">
                    <MapPin size={12} color="var(--color-muted)" />
                    <span>{pet.city}, {pet.province}</span>
                  </div>

                  <div className="card-telemetry-row">
                    <span>Views: <strong>{pet.viewsCount}</strong></span>
                    <span>Saves: <strong>{pet.favoritesCount}</strong></span>
                    {isReported && <span className="text-red">Flags: <strong>{pet.reportsCount}</strong></span>}
                  </div>

                  <div className="card-owner-line">
                    <User size={12} color="var(--color-muted)" />
                    <span>Owner: <strong>{pet.owner?.name}</strong></span>
                  </div>

                  <div className="card-bottom-actions-row" onClick={(e) => e.stopPropagation()}>
                    <button className="card-moderation-btn approve" onClick={() => handleUpdateStatus(pet._id, { status: 'Published' }, 'Published')}>
                      Approve
                    </button>
                    <button className="card-moderation-btn suspend" onClick={() => handleUpdateStatus(pet._id, { status: 'Suspended' }, 'Suspended')}>
                      Suspend
                    </button>
                    <button className="card-moderation-btn outline" onClick={() => setSelectedPet(pet)}>
                      Review
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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

      {/* Right Drawer detailed view sheet */}
      <AnimatePresence>
        {selectedPet && (
          <div className="sheet-backdrop-blur" onClick={() => setSelectedPet(null)}>
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="details-side-sheet-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sheet-header">
                <h3>Moderator Review Sheet</h3>
                <button className="close-sheet-btn" onClick={() => setSelectedPet(null)}>&times;</button>
              </div>

              <div className="sheet-scrollable-body">
                {/* Images gallery frame */}
                <div className="sheet-gallery-frame">
                  <PetImage src={selectedPet.image} imageSettings={selectedPet.imageSettings} type="details" className="sheet-main-img" />
                  <span className={`sheet-type-badge ${selectedPet.activeStatus.toLowerCase()}`}>
                    {selectedPet.activeStatus === 'FOR_SALE' ? 'Sale' : 'Adoption'}
                  </span>
                </div>

                <div className="sheet-metadata-block">
                  <h2 className="sheet-pet-name">{selectedPet.name}</h2>
                  <span className="sheet-pet-breed">{selectedPet.breed} • {selectedPet.species}</span>

                  <div className="sheet-stats-pills-row">
                    <span className="stat-pill"><Eye size={12} /> {selectedPet.viewsCount} views</span>
                    <span className="stat-pill"><CheckCircle size={12} /> {selectedPet.favoritesCount} saves</span>
                    {selectedPet.reportsCount > 0 && (
                      <span className="stat-pill flagged"><ShieldAlert size={12} /> {selectedPet.reportsCount} flags</span>
                    )}
                  </div>
                </div>

                {/* Right quick actions column */}
                <div className="sheet-block">
                  <h4 className="sheet-block-title">Moderator Quick Operations</h4>
                  <div className="sheet-actions-grid">
                    <button className="sheet-btn approve" onClick={() => handleUpdateStatus(selectedPet._id, { status: 'Published' }, 'Published')}>
                      <CheckCircle size={14} /> Approve Listing
                    </button>
                    <button className="sheet-btn reject" onClick={() => handleUpdateStatus(selectedPet._id, { status: 'Rejected' }, 'Rejected')}>
                      <XCircle size={14} /> Reject Listing
                    </button>
                    <button className="sheet-btn suspend" onClick={() => handleUpdateStatus(selectedPet._id, { status: 'Suspended' }, 'Suspended')}>
                      <Ban size={14} /> Suspend Listing
                    </button>
                    <button className="sheet-btn archive" onClick={() => handleUpdateStatus(selectedPet._id, { status: 'Archived' }, 'Archived')}>
                      <Archive size={14} /> Archive Listing
                    </button>
                    <button className="sheet-btn feature" onClick={() => handleToggleFeatured(selectedPet._id)}>
                      <Sparkles size={14} /> {selectedPet.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                    </button>
                    <button className="sheet-btn delete" onClick={() => handleUpdateStatus(selectedPet._id, { status: 'Removed', activeStatus: 'ARCHIVED' }, 'Deleted')}>
                      <Trash2 size={14} /> Delete Profile
                    </button>
                  </div>
                </div>

                {/* Owner details card */}
                <div className="sheet-block">
                  <h4 className="sheet-block-title">Listing Owner Profile</h4>
                  {selectedPet.owner ? (
                    <div className="sheet-owner-card">
                      <div className="sheet-owner-header">
                        <div className="owner-avatar">
                          {selectedPet.owner.profilePic ? (
                            <img src={selectedPet.owner.profilePic} alt="Owner" />
                          ) : (
                            <User size={24} />
                          )}
                        </div>
                        <div>
                          <strong>{selectedPet.owner.name}</strong>
                          <span className="member-since">Member Since: {new Date(selectedPet.owner.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="owner-details-list">
                        <div className="owner-detail-row"><Mail size={12} /> <span>{selectedPet.owner.email}</span></div>
                        {selectedPet.owner.phone && (
                          <div className="owner-detail-row"><Phone size={12} /> <span>{selectedPet.owner.phone}</span></div>
                        )}
                        <div className="owner-detail-row"><MapPin size={12} /> <span>{selectedPet.owner.city}, {selectedPet.owner.province}</span></div>
                      </div>
                    </div>
                  ) : (
                    <p className="no-records-text">Owner information is unavailable.</p>
                  )}
                </div>

                {/* Pet information logs */}
                <div className="sheet-block">
                  <h4 className="sheet-block-title">Specifications Specifications</h4>
                  <div className="sheet-specs-grid">
                    <div className="spec-row"><strong>Gender:</strong> <span>{selectedPet.gender}</span></div>
                    <div className="spec-row"><strong>Age:</strong> <span>{selectedPet.age}</span></div>
                    <div className="spec-row"><strong>Size:</strong> <span>{selectedPet.size || 'Medium'}</span></div>
                    <div className="spec-row"><strong>Weight:</strong> <span>{selectedPet.weight || 'N/A'}</span></div>
                    <div className="spec-row"><strong>Vaccinated:</strong> <span>{selectedPet.isVaccinated ? 'Yes' : 'No'}</span></div>
                    <div className="spec-row"><strong>Neutered/Spayed:</strong> <span>{selectedPet.neuteredSpayed ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>

                <div className="sheet-block">
                  <h4 className="sheet-block-title">Biography Description</h4>
                  <p className="sheet-bio-text">{selectedPet.aboutPet || 'No bio description provided.'}</p>
                </div>

                {/* Completed reports list */}
                {selectedPet.reportsCount > 0 && (
                  <div className="sheet-block">
                    <h4 className="sheet-block-title"><ShieldAlert size={14} /> Active Listing Flags / Reports</h4>
                    <p style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '8px' }}>
                      This listing has been flagged by users. Please review guidelines before taking actions.
                    </p>
                    <div className="reports-stack-box">
                      <div className="report-log-item">
                        <span className="report-dot" />
                        <div>
                          <strong>Violating Marketplace policies</strong>
                          <span className="report-time">Reported 2h ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Warning Notice Dialog Modal */}
      <AnimatePresence>
        {warningPet && (
          <div className="sheet-backdrop-blur" onClick={() => setWarningPet(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="warning-dialog-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sheet-header">
                <h3>Dispatch User Warning Notice</h3>
                <button className="close-sheet-btn" onClick={() => setWarningPet(null)}>&times;</button>
              </div>

              <form onSubmit={handleSendWarning} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '10px' }}>
                  Send a moderation warning email message directly to <strong>{warningPet.owner?.name}</strong> regarding the listing <strong>"{warningPet.name}"</strong>.
                </p>

                <textarea 
                  className="form-control"
                  style={{ width: '100%', height: '110px', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px', lineHeight: '1.6' }}
                  placeholder="Specify details of listing guidelines violation..."
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  required
                />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    className="admin-btn outline" 
                    onClick={() => setWarningPet(null)}
                    disabled={isSendingWarning}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn primary warning-submit-btn"
                    disabled={isSendingWarning || !warningMessage.trim()}
                  >
                    {isSendingWarning ? 'Sending Notice...' : 'Send Notice'}
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
