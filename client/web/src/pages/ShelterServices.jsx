import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, Star, Truck, Heart, ArrowRight, Building2, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import './Marketplace.css';

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
      <div className="market-hero-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '24px 28px', color: '#FFFFFF', marginBottom: '4px' }}>
        <div className="market-hero-content">
          <Badge className="market-hero-badge" style={{ backgroundColor: 'rgba(0, 102, 204, 0.2)', color: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.3)', marginBottom: '8px' }}>
            Boarding & Temporary Lodging
          </Badge>
          <h2 className="market-hero-title" style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0' }}>Find Temporary Care For Your Pets</h2>
          <p className="market-hero-subtitle" style={{ fontSize: '13.5px', color: '#94A3B8', margin: 0 }}>
            Secure lodging services across Pakistan with verified Shelter Providers.
          </p>
        </div>
      </div>

      {/* Horizontal Filter Toolbar */}
      <div className="shelter-filter-toolbar" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        {/* Search */}
        <div className="market-search-box" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search by shelter name or location..." 
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', backgroundColor: '#F8FAFC' }}
          />
        </div>

        {/* City Filter */}
        <select 
          value={cityFilter} 
          onChange={(e) => setCityFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px', backgroundColor: '#F8FAFC', color: '#111827', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Cities</option>
          <option value="Lahore">Lahore</option>
          <option value="Karachi">Karachi</option>
          <option value="Islamabad">Islamabad</option>
          <option value="Faisalabad">Faisalabad</option>
          <option value="Rawalpindi">Rawalpindi</option>
          <option value="Multan">Multan</option>
        </select>

        {/* Species Filter */}
        <select 
          value={speciesFilter} 
          onChange={(e) => setSpeciesFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px', backgroundColor: '#F8FAFC', color: '#111827', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Animals</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
          <option value="Bird">Birds</option>
          <option value="Rabbit">Rabbits</option>
        </select>

        {/* Pickup checkbox */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#111827', userSelect: 'none', padding: '8px 12px', backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
          <input 
            type="checkbox" 
            checked={pickupFilter} 
            onChange={(e) => setPickupFilter(e.target.checked)} 
            style={{ width: '16px', height: '16px', accentColor: '#0066CC', cursor: 'pointer' }}
          />
          <span>Pickup Available</span>
        </label>

        {/* Price filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569', backgroundColor: '#F8FAFC', padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
          <span style={{ fontWeight: '600' }}>Max Price:</span>
          <input 
            type="range" 
            min="500" 
            max="10000" 
            step="100" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(parseInt(e.target.value))} 
            style={{ width: '100px', accentColor: '#0066CC', cursor: 'pointer' }}
          />
          <strong style={{ color: '#0066CC', fontWeight: '700' }}>{maxPrice} PKR</strong>
        </div>
      </div>

      {/* Shelter Grid/List */}
      {error ? (
        <div className="market-empty-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', color: '#94A3B8', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px' }}>
          <AlertCircle size={44} color="#EF4444" />
          <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '700', color: '#991B1B' }}>Unable to load shelters</p>
          <p style={{ marginTop: '4px', fontSize: '14px', color: '#7F1D1D' }}>{error}</p>
          <button 
            onClick={fetchShelters}
            style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} />
            <span>Retry Loading</span>
          </button>
        </div>
      ) : loading ? (
        <div className="market-loading-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px' }}>
          <div className="spinner-loader" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p style={{ marginTop: '16px', color: '#64748B', fontWeight: 600 }}>Discovering matching shelters in your city...</p>
        </div>
      ) : shelters.length === 0 ? (
        <div className="market-empty-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px', color: '#64748B', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px' }}>
          <Building2 size={48} color="#94A3B8" />
          <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '700', color: '#111827' }}>No shelters matching your filters found.</p>
          <p style={{ marginTop: '4px', fontSize: '13.5px', color: '#64748B' }}>Try adjusting your search query, city, or price filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {shelters.map(s => {
            const spacesAvailable = Math.max(0, (s.capacity || 0) - (s.occupiedSpaces || 0));
            return (
              <Card key={s.id} className="shelter-horizontal-card">
                <div className="shelter-card-image-box">
                  <img 
                    src={s.logo || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=320'} 
                    alt={s.name} 
                    className="shelter-card-image"
                  />
                  <Badge className="shelter-type-badge">{s.shelterTypes?.[0] || 'Boarding'}</Badge>
                </div>

                <div className="shelter-card-center">
                  <div className="shelter-card-title-row">
                    <h3 className="shelter-name">{s.name}</h3>
                    <div className="shelter-rating">
                      <Star size={14} fill="#F59E0B" color="#F59E0B" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <div className="shelter-location">
                    <MapPin size={13} />
                    <span>{s.address || 'Location'}, {s.city || 'Pakistan'}</span>
                  </div>

                  <div className="shelter-meta-row">
                    <div className="shelter-spaces-info">
                      <span className="meta-label">Spaces Available:</span>
                      <strong className={spacesAvailable > 0 ? "spaces-avail" : "spaces-full"}>
                        {spacesAvailable} / {s.capacity || 0}
                      </strong>
                    </div>

                    {s.providesPickup && (
                      <div className="pickup-badge">
                        <Truck size={12} />
                        <span>Home Pickup Available</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shelter-card-right">
                  <div className="shelter-pricing">
                    <span className="price-label">STARTING RATE</span>
                    <strong className="price-val">{s.dailyRate || 0} PKR</strong>
                  </div>

                  <button 
                    className="dash-btn-primary"
                    onClick={() => onViewDetails(s.id)}
                    style={{
                      padding: '10px 18px',
                      backgroundColor: 'var(--color-primary, #0066CC)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease-in-out'
                    }}
                  >
                    <span>View Shelter</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
