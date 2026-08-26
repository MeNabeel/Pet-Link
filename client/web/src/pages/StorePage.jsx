import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  Search, Heart, ShoppingBag, Eye, Star, Filter, SlidersHorizontal, Tag, 
  Layers, Package, Check, XCircle
} from 'lucide-react';
import './StorePage.css';

export default function StorePage({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPetType, setSelectedPetType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  
  // Interaction states
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [recentAddedItem, setRecentAddedItem] = useState('');
  const [placeholderRoute, setPlaceholderRoute] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const catRes = await fetch(`${API_URL}/api/categories`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.filter(c => c.status === 'Active'));
        }

        // Fetch products (only Published & Public for store)
        const prodRes = await fetch(`${API_URL}/api/products?status=Published&visibility=Public`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
      } catch (err) {
        console.error('Error loading store catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(prev => prev.filter(item => item !== id));
    } else {
      setWishlist(prev => [...prev, id]);
    }
  };

  const handleAddToCart = (product) => {
    setCart(prev => [...prev, product]);
    setRecentAddedItem(product.name);
    setShowCartPopup(true);
    setTimeout(() => {
      setShowCartPopup(false);
    }, 3000);
  };

  // Filter products based on search inputs
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.brand.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || (p.category && p.category._id === selectedCategory);
    const matchesPetType = selectedPetType === 'all' || p.petType === selectedPetType;
    
    let matchesPrice = true;
    if (priceRange === 'under-1000') {
      const price = p.salePrice || p.regularPrice;
      matchesPrice = price < 1000;
    } else if (priceRange === '1000-5000') {
      const price = p.salePrice || p.regularPrice;
      matchesPrice = price >= 1000 && price <= 5000;
    } else if (priceRange === 'above-5000') {
      const price = p.salePrice || p.regularPrice;
      matchesPrice = price > 5000;
    }

    return matchesSearch && matchesCategory && matchesPetType && matchesPrice;
  });

  if (placeholderRoute) {
    return (
      <div className="placeholder-route-view fade-in" style={{ backgroundColor: '#FFF', padding: '48px', borderRadius: '24px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0,102,204,0.06)', color: 'var(--color-primary)', marginBottom: '20px' }}>
          <Package size={32} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-dark)', marginBottom: '8px' }}>Routing Placeholder Interface</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '13px', maxWidth: '440px', margin: '0 auto 12px auto' }}>
          You have navigated to slug endpoint: <strong style={{ color: 'var(--color-dark)', fontFamily: 'monospace' }}>/product/{placeholderRoute}</strong>
        </p>
        <div style={{ backgroundColor: 'var(--color-bg-light)', padding: '16px', borderRadius: '12px', display: 'inline-block', fontSize: '12px', fontWeight: '700', color: 'var(--color-muted)', marginBottom: '24px' }}>
          INFO: Product details view is mapped in current workspace for next sprint.
        </div>
        <br />
        <button className="pet-btn-primary" onClick={() => setPlaceholderRoute(null)} style={{ margin: '0 auto' }}>
          Return to E-Commerce Store
        </button>
      </div>
    );
  }

  return (
    <div className="store-catalog-wrapper fade-in">
      
      {/* Toast Alert Popup for Add-To-Cart */}
      {showCartPopup && (
        <div className="cart-toast-alert">
          <div className="toast-content">
            <Check size={16} color="#FFF" style={{ backgroundColor: '#10B981', borderRadius: '50%', padding: '2px' }} />
            <span>Added <strong>{recentAddedItem}</strong> to basket!</span>
          </div>
          <span className="cart-count-bubble">{cart.length} items in cart</span>
        </div>
      )}

      {/* Quick View Modal Dialog */}
      {quickViewProduct && (
        <div className="modal-backdrop" onClick={() => setQuickViewProduct(null)}>
          <div className="quick-view-content" onClick={(e) => e.stopPropagation()}>
            <button className="qv-close-btn" onClick={() => setQuickViewProduct(null)}>×</button>
            <div className="qv-grid-split">
              <div className="qv-gallery">
                {quickViewProduct.images && quickViewProduct.images.length > 0 ? (
                  <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} className="qv-main-img" />
                ) : (
                  <div className="qv-no-img"><ImageIcon size={48} /></div>
                )}
                <div className="qv-gallery-thumbs">
                  {quickViewProduct.images && quickViewProduct.images.slice(1, 4).map((img, idx) => (
                    <img key={idx} src={img} alt="Thumb" className="qv-thumb" />
                  ))}
                </div>
              </div>
              <div className="qv-meta">
                <span className="qv-cat-badge">{quickViewProduct.category?.name}</span>
                <h3 className="qv-title">{quickViewProduct.name}</h3>
                {quickViewProduct.brand && <span className="qv-brand">by {quickViewProduct.brand}</span>}
                
                <div className="qv-ratings">
                  <div className="stars-row">
                    <Star size={14} fill="#FBBF24" color="#FBBF24" />
                    <Star size={14} fill="#FBBF24" color="#FBBF24" />
                    <Star size={14} fill="#FBBF24" color="#FBBF24" />
                    <Star size={14} fill="#FBBF24" color="#FBBF24" />
                    <Star size={14} color="#D1D5DB" />
                  </div>
                  <span className="ratings-count">(4.8 rating placeholder)</span>
                </div>

                <div className="qv-price-box">
                  {quickViewProduct.salePrice ? (
                    <>
                      <span className="qv-sale-price">{quickViewProduct.salePrice.toLocaleString()} PKR</span>
                      <span className="qv-reg-price-crossed">{quickViewProduct.regularPrice.toLocaleString()} PKR</span>
                      <span className="qv-discount-tag">{quickViewProduct.discount}% OFF</span>
                    </>
                  ) : (
                    <span className="qv-sale-price">{quickViewProduct.regularPrice.toLocaleString()} PKR</span>
                  )}
                </div>

                <p className="qv-desc">{quickViewProduct.description || quickViewProduct.shortDescription || 'No description provided for this listing.'}</p>

                <div className="qv-stock-indicator">
                  <strong>Stock:</strong> 
                  <span className={`status-badge-pill ${quickViewProduct.stockStatus.replace(' ', '-').toLowerCase()}`}>
                    {quickViewProduct.stockStatus}
                  </span>
                </div>

                <div className="qv-actions-row">
                  <button className="pet-btn-primary" onClick={() => { handleAddToCart(quickViewProduct); setQuickViewProduct(null); }}>
                    <ShoppingBag size={16} style={{ marginRight: '8px' }} /> Add to Cart
                  </button>
                  <button 
                    className={`qv-wishlist-btn ${wishlist.includes(quickViewProduct._id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(quickViewProduct._id)}
                  >
                    <Heart size={16} fill={wishlist.includes(quickViewProduct._id) ? '#EF4444' : 'none'} color={wishlist.includes(quickViewProduct._id) ? '#EF4444' : 'currentColor'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="store-welcome-banner">
        <div className="banner-left">
          <h1>PetLink E-Commerce Store</h1>
          <p>Find the healthiest foods, safest toys, and verified accessories for your beloved pets. Read directly from our real database catalog.</p>
        </div>
        <div className="cart-preview-summary">
          <ShoppingBag size={24} color="var(--color-primary)" />
          <div>
            <span className="cart-total-label">My Shopping Cart</span>
            <span className="cart-total-value">{cart.length} items</span>
          </div>
        </div>
      </div>

      {/* Main Grid Filters & Columns */}
      <div className="store-body-columns">
        
        {/* Filters Sidebar */}
        <aside className="store-filters-sidebar">
          <h3 className="sidebar-filter-title">
            <SlidersHorizontal size={16} /> Filters
          </h3>

          <div className="filter-block">
            <label className="filter-label">Search Products</label>
            <div className="search-box-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '6px 12px', backgroundColor: 'var(--color-bg-light)' }}>
              <Search size={14} color="var(--color-muted)" />
              <input 
                type="text" 
                placeholder="Type keywords..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '12px' }} 
              />
            </div>
          </div>

          <div className="filter-block">
            <label className="filter-label">Categories</label>
            <div className="filter-options-stack">
              <span className={`filter-option-link ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>
                All Categories
              </span>
              {categories.map(c => (
                <span key={c._id} className={`filter-option-link ${selectedCategory === c._id ? 'active' : ''}`} onClick={() => setSelectedCategory(c._id)}>
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <label className="filter-label">Pet Species Type</label>
            <div className="filter-options-stack">
              <span className={`filter-option-link ${selectedPetType === 'all' ? 'active' : ''}`} onClick={() => setSelectedPetType('all')}>All Animals</span>
              <span className={`filter-option-link ${selectedPetType === 'Dog' ? 'active' : ''}`} onClick={() => setSelectedPetType('Dog')}>Dogs Spec</span>
              <span className={`filter-option-link ${selectedPetType === 'Cat' ? 'active' : ''}`} onClick={() => setSelectedPetType('Cat')}>Cats Spec</span>
              <span className={`filter-option-link ${selectedPetType === 'Bird' ? 'active' : ''}`} onClick={() => setSelectedPetType('Bird')}>Birds Spec</span>
            </div>
          </div>

          <div className="filter-block">
            <label className="filter-label">Price Range</label>
            <div className="filter-options-stack">
              <span className={`filter-option-link ${priceRange === 'all' ? 'active' : ''}`} onClick={() => setPriceRange('all')}>All prices</span>
              <span className={`filter-option-link ${priceRange === 'under-1000' ? 'active' : ''}`} onClick={() => setPriceRange('under-1000')}>Under 1,000 PKR</span>
              <span className={`filter-option-link ${priceRange === '1000-5000' ? 'active' : ''}`} onClick={() => setPriceRange('1000-5000')}>1,000 - 5,000 PKR</span>
              <span className={`filter-option-link ${priceRange === 'above-5000' ? 'active' : ''}`} onClick={() => setPriceRange('above-5000')}>Above 5,000 PKR</span>
            </div>
          </div>
        </aside>

        {/* Products Grid Content */}
        <main className="store-products-main">
          {loading ? (
            <div className="cat-loading" style={{ gridColumn: '1/-1' }}>Fetching store products...</div>
          ) : (
            <>
              <div className="products-grid-meta">
                <span>Showing {filteredProducts.length} published products</span>
              </div>
              
              <div className="products-responsive-grid">
                {filteredProducts.map(prod => (
                  <div key={prod._id} className="store-product-card hover-lift">
                    
                    {/* Image & Badges wrapper */}
                    <div className="card-media-wrapper">
                      {prod.images && prod.images.length > 0 ? (
                        <img src={prod.images[0]} alt={prod.name} className="card-main-image" />
                      ) : (
                        <div className="card-no-img"><Package size={32} /></div>
                      )}
                      
                      {/* Category Badge */}
                      <span className="card-cat-badge">{prod.category?.name || 'Accessories'}</span>
                      
                      {/* Discount Tag */}
                      {prod.salePrice && prod.discount > 0 && (
                        <span className="card-discount-badge">{prod.discount}% OFF</span>
                      )}

                      {/* Floating actions */}
                      <div className="card-floating-actions">
                        <button className="floating-btn view" onClick={() => setQuickViewProduct(prod)} title="Quick View Product">
                          <Eye size={14} />
                        </button>
                        <button 
                          className={`floating-btn wishlist ${wishlist.includes(prod._id) ? 'active' : ''}`} 
                          onClick={() => toggleWishlist(prod._id)}
                          title="Save to Wishlist"
                        >
                          <Heart size={14} fill={wishlist.includes(prod._id) ? '#EF4444' : 'none'} color={wishlist.includes(prod._id) ? '#EF4444' : 'currentColor'} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata body */}
                    <div className="card-meta-body">
                      {prod.brand && <span className="card-brand-label">{prod.brand}</span>}
                      <h4 className="card-prod-title" onClick={() => setPlaceholderRoute(prod._id)}>
                        {prod.name}
                      </h4>
                      
                      <div className="card-ratings-row">
                        <div className="card-stars">
                          <Star size={10} fill="#FBBF24" color="#FBBF24" />
                          <Star size={10} fill="#FBBF24" color="#FBBF24" />
                          <Star size={10} fill="#FBBF24" color="#FBBF24" />
                          <Star size={10} fill="#FBBF24" color="#FBBF24" />
                          <Star size={10} color="#D1D5DB" />
                        </div>
                        <span className="card-rating-text">4.8</span>
                      </div>

                      <p className="card-short-desc">{prod.shortDescription || 'Verified premium pet essentials catalog item.'}</p>

                      <div className="card-price-stock-row">
                        <div className="card-prices">
                          {prod.salePrice ? (
                            <>
                              <span className="card-price-sale">{prod.salePrice.toLocaleString()} PKR</span>
                              <span className="card-price-reg-crossed">{prod.regularPrice.toLocaleString()} PKR</span>
                            </>
                          ) : (
                            <span className="card-price-sale">{prod.regularPrice.toLocaleString()} PKR</span>
                          )}
                        </div>
                        
                        <span className={`card-stock-status-pill ${prod.stockStatus.replace(' ', '-').toLowerCase()}`}>
                          {prod.stockStatus}
                        </span>
                      </div>

                      <button className="card-add-to-cart-btn" onClick={() => handleAddToCart(prod)}>
                        <ShoppingBag size={12} style={{ marginRight: '6px' }} />
                        Add to Cart
                      </button>
                    </div>

                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="store-empty-state">
                    <Package size={48} color="var(--color-muted)" />
                    <h4>No Store Products Found</h4>
                    <p>Try modifying your search keywords or category filters.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

      </div>
    </div>
  );
}
