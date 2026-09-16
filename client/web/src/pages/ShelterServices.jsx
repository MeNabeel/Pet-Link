import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, Star, Truck, Heart, ArrowRight, Building2, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import './Marketplace.css'; // Leverage existing page styles for grids and search bars

export default function ShelterServices({ user, onViewDetails }) {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [pickupFilter, setPickupFilter] = useState(false);
  const [maxPrice, setMaxPrice] = useState(10000);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `${API_URL}/api/shelter/public/list?`;
      if (cityFilter) url += `city=${encodeURIComponent(cityFilter)}&`;
      if (speciesFilter) url += `species=${encodeURIComponent(speciesFilter)}&`;
      if (pickupFilter) url += `pickup=true&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        let list = Array.isArray(data) ? data : (data.shelters || []);
        let filtered = list;
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(s => 
            (s.name && s.name.toLowerCase().includes(term)) || 
            (s.city && s.city.toLowerCase().includes(term)) ||
            (s.address && s.address.toLowerCase().includes(term))
          );
        }
        
        filtered = filtered.filter(s => (s.dailyRate || 0) <= maxPrice);

        setShelters(filtered);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || 'Unable to load shelter boarding services at this time.');
      }
    } catch (err) {
      console.error('Error fetching discovery shelters:', err);
      setError('Network or server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, [searchTerm, cityFilter, speciesFilter, pickupFilter, maxPrice]);

  return (
    <div className="marketplace-container">
      {/* Top Banner */}
      <div className="market-hero-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="market-hero-content">
          <Badge className="market-hero-badge">Boarding & Temporary Lodging</Badge>
          <h2 className="market-hero-title">Find Temporary Care For Your Pets</h2>
          <p className="market-hero-subtitle">
            Secure lodging services across Pakistan with verified Shelter Providers.
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="market-controls-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', margin: '24px 0' }}>
        {/* Search */}
        <div className="market-search-box" style={{ flex: 1, minWidth: '240px' }}>
          <Search size={18} />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search by shelter name or location..." 
          />
        </div>

        {/* City Filter */}
        <select 
          value={cityFilter} 
          onChange={(e) => setCityFilter(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
        >
          <option value="">All Cities</option>
          <option value="Lahore">Lahore</option>
          <option value="Karachi">Karachi</option>
          <option value="Islamabad">Islamabad</option>
          <option value="Faisalabad">Faisalabad</option>
        </select>

        {/* Species Filter */}
        <select 
          value={speciesFilter} 
          onChange={(e) => setSpeciesFilter(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }}
        >
          <option value="">All Animals</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
          <option value="Bird">Birds</option>
          <option value="Rabbit">Rabbits</option>
        </select>

        {/* Pickup checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
          <input 
            type="checkbox" 
            checked={pickupFilter} 
            onChange={(e) => setPickupFilter(e.target.checked)} 
            style={{ width: '16px', height: '16px' }}
          />
          <span>Pickup Available</span>
        </label>

        {/* Price filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span>Max Price:</span>
          <input 
            type="range" 
            min="500" 
            max="10000" 
            step="100" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(parseInt(e.target.value))} 
            style={{ width: '120px' }}
          />
          <span>{maxPrice} PKR</span>
        </div>
      </div>

      {/* Shelter Grid list */}
      {error ? (
        <div className="market-empty-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', color: '#94A3B8', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px' }}>
          <AlertCircle size={48} color="#EF4444" />
          <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '600', color: '#991B1B' }}>Unable to load shelters</p>
          <p style={{ marginTop: '4px', fontSize: '14px', color: '#7F1D1D' }}>{error}</p>
          <button 
            onClick={fetchShelters}
            style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} />
            <span>Retry Loading</span>
          </button>
        </div>
      ) : loading ? (
        <div className="market-loading-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px' }}>
          <div className="spinner-loader" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p style={{ marginTop: '16px', color: '#64748B' }}>Discovering matching shelters in your city...</p>
        </div>
      ) : shelters.length === 0 ? (
        <div className="market-empty-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', color: '#64748B' }}>
          <Building2 size={48} color="#94A3B8" />
          <p style={{ marginTop: '16px', fontSize: '15px' }}>No shelters matching your filters found.</p>
        </div>
      ) : (
        <div className="market-grid">
          {shelters.map(s => {
            const spacesAvailable = Math.max(0, (s.capacity || 0) - (s.occupiedSpaces || 0));
            return (
              <Card key={s.id} className="pet-card fade-in" style={{ cursor: 'default' }}>
                <div className="pet-card-image-wrapper">
                  <img 
                    src={s.logo || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=320'} 
                    alt="Shelter" 
                    className="pet-card-image"
                  />
                  <div className="pet-card-tag-wrapper">
                    <Badge className="pet-card-gender-badge">{s.shelterTypes?.[0] || 'Boarding'}</Badge>
                  </div>
                </div>

                <CardContent className="pet-card-content" style={{ padding: '20px' }}>
                  <div className="pet-card-header">
                    <h3 className="pet-card-name" style={{ fontSize: '18px', fontWeight: '700' }}>{s.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>4.8</span>
                    </div>
                  </div>

                  <div className="pet-card-location" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                    <MapPin size={12} />
                    <span>{s.address || 'Location'}, {s.city || 'Pakistan'}</span>
                  </div>

                  <Separator style={{ margin: '14px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#475569' }}>
                    <span>Spaces Available:</span>
                    <strong style={{ color: spacesAvailable > 0 ? '#16A34A' : '#EF4444' }}>
                      {spacesAvailable} / {s.capacity || 0}
                    </strong>
                  </div>

                  {s.providesPickup && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#059669', background: '#ECFDF5', padding: '4px 8px', borderRadius: '6px', marginTop: '8px', width: 'fit-content' }}>
                      <Truck size={12} />
                      <span>Home Pickup Available</span>
                    </div>
                  )}

                  <div className="pet-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Starting Rate</span>
                      <strong style={{ fontSize: '18px', color: '#0F172A' }}>{s.dailyRate || 0} PKR</strong>
                    </div>

                    <button 
                      onClick={() => onViewDetails(s.id)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'var(--color-primary)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>View Shelter</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

