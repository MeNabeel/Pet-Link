import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  Search, Heart, ShoppingCart, Eye, Star, SlidersHorizontal, 
  Package, Check, XCircle
} from 'lucide-react';
import ProductDetails from './ProductDetails';
import AddToCartPopup from '../components/AddToCartPopup';
import { addToCart, getCart, getCartCount, subscribeToCart, openCartDrawer } from '../utils/cartManager';
import { logUserActivity } from '../utils/activityTracker';
import './StorePage.css';

export default function StorePage({ 
  user, 
  onViewProductDetails,
  onViewCart,
  cart: propCart, 
  setCart: propSetCart, 
  wishlist: propWishlist, 
  setWishlist: propSetWishlist 
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPetType, setSelectedPetType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  
  // Interaction states with local storage synchronization
  const [localWishlist, setLocalWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem('petlink_store_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const wishlist = propWishlist !== undefined ? propWishlist : localWishlist;
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const setWishlist = propSetWishlist || setLocalWishlist;

  const [localCart, setLocalCart] = useState(() => getCart());
  const cart = propCart !== undefined ? propCart : localCart;
  const setCart = propSetCart || setLocalCart;

  // Real-time cart units count (sum of quantities)
  const totalCartUnits = getCartCount(cart);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Quick Add To Cart visual feedback state
  const [justAddedId, setJustAddedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Subscribe to live cart updates across the application
  useEffect(() => {
    const unsub = subscribeToCart((updated) => {
      setLocalCart(updated);
    });
    return () => unsub();
  }, []);

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
          if (Array.isArray(prodData)) {
            setProducts(prodData);
          } else if (prodData && Array.isArray(prodData.products)) {
            setProducts(prodData.products);
          } else {
            setProducts([]);
          }
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
    if (!id) return;
    const currentList = Array.isArray(safeWishlist) ? safeWishlist : [];
    if (currentList.includes(id)) {
      const updated = currentList.filter(item => item !== id);
      if (setWishlist) {
        setWishlist(updated);
      }
      try {
        localStorage.setItem('petlink_store_wishlist', JSON.stringify(updated));
      } catch {}
    } else {
      const updated = [...currentList, id];
      if (setWishlist) {
        setWishlist(updated);
      }
      try {
        localStorage.setItem('petlink_store_wishlist', JSON.stringify(updated));
      } catch {}
      const targetProd = (products || []).find(p => (p._id || p.id) === id);
      const uid = user?._id || user?.id;
      if (uid && targetProd) {
        logUserActivity(uid, {
          type: 'favorite',
          title: 'Saved product to favorites:',
          targetName: targetProd.name || 'Pet product',
          timestamp: Date.now()
        });
      }
    }
  };

  // Add to cart from quick view or modal
  const handleAddToCart = (product, qty = 1, variant = null) => {
    const { addedItem, quantityAdded } = addToCart(product, qty, variant);
    setLastAddedItem({
      product: addedItem || product,
      quantity: quantityAdded || qty,
      variant: variant
    });
    openCartDrawer();
  };

  // Direct 1-Click "Add to Cart" directly from the product card
  const handleQuickAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    if (!product) return;

    const prodId = product._id || product.id;
    const stockStatus = (product.stockStatus || 'In Stock').toString().toLowerCase();
    const stockQty = Number(product.stock ?? product.stockQuantity ?? 10);
    const isOutOfStock = stockStatus === 'out of stock' || stockStatus === 'out-of-stock' || stockQty <= 0;

    if (isOutOfStock) return;

    // 1. Add 1 valid unit to cart
    const { addedItem, quantityAdded } = addToCart(product, 1, null);

    // 2. Button temporary confirmation state
    setJustAddedId(prodId);
    setTimeout(() => {
      setJustAddedId(null);
    }, 1600);

    // 3. Display professional success toast
    setToastMessage({
      title: 'Product added to cart',
      name: product.name,
      price: Number(product.salePrice || product.regularPrice || product.price || 0).toLocaleString()
    });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);

    // 4. Log activity
    const uid = user?._id || user?.id;
    if (uid) {
      logUserActivity(uid, {
        type: 'cart',
        title: 'Added to cart:',
        targetName: product.name,
        timestamp: Date.now()
      });
    }
  };

  const handleOpenProduct = (id) => {
    if (onViewProductDetails) {
      onViewProductDetails(id);
    } else {
      setSelectedProductId(id);
    }
  };

  // Filter products based on search inputs
  const filteredProducts = (products || []).filter(p => {
    if (!p) return false;
    const name = (p.name || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const desc = (p.description || p.shortDescription || '').toLowerCase();
    const q = (search || '').toLowerCase();
    const matchesSearch = !q || name.includes(q) || brand.includes(q) || desc.includes(q);
    
    const catId = p.category?._id || p.category?.id || (typeof p.category === 'string' ? p.category : p.category_id);
    const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;
    const petType = p.petType || p.pet_type;
    const matchesPetType = selectedPetType === 'all' || petType === selectedPetType;
    
    let matchesPrice = true;
    const price = Number(p.salePrice || p.regularPrice || p.price || 0);
    if (priceRange === 'under-1000') {
      matchesPrice = price < 1000;
    } else if (priceRange === '1000-5000') {
      matchesPrice = price >= 1000 && price <= 5000;
    } else if (priceRange === 'above-5000') {
      matchesPrice = price > 5000;
    }

    return matchesSearch && matchesCategory && matchesPetType && matchesPrice;
  });

  return (
    <div className="store-catalog-wrapper fade-in">
      
      {/* Floating Success Toast when adding product */}
      {toastMessage && (
        <div 
          className="store-floating-toast" 
          onClick={() => openCartDrawer()}
          role="status"
          aria-live="polite"
        >
          <div className="toast-check-circle">
            <Check size={16} color="#FFFFFF" strokeWidth={3} />
          </div>
          <div className="toast-info-col">
            <span className="toast-info-title">{toastMessage.title}</span>
            <span className="toast-info-desc">{toastMessage.name} • {toastMessage.price} PKR</span>
          </div>
          <button 
            type="button" 
            className="toast-open-cart-btn"
            onClick={(e) => {
              e.stopPropagation();
              openCartDrawer();
            }}
          >
            View Cart
          </button>
          <button 
            type="button" 
            className="toast-dismiss-btn"
            onClick={(e) => {
              e.stopPropagation();
              setToastMessage(null);
            }}
            aria-label="Dismiss toast"
          >
            ×
          </button>
        </div>
      )}

      {/* Add-to-Cart Confirmation Popup */}
      <AddToCartPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onViewCart={() => {
          setIsPopupOpen(false);
          if (onViewCart) onViewCart();
        }}
        itemInfo={lastAddedItem}
      />

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
                  <div className="qv-no-img"><Package size={48} /></div>
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
                  <span className="ratings-count">(4.8 rating)</span>
                </div>

                <div className="qv-price-box">
                  {quickViewProduct.salePrice ? (
                    <>
                      <span className="qv-sale-price">{Number(quickViewProduct.salePrice).toLocaleString()} PKR</span>
                      <span className="qv-reg-price-crossed">{Number(quickViewProduct.regularPrice).toLocaleString()} PKR</span>
                      <span className="qv-discount-tag">{quickViewProduct.discount}% OFF</span>
                    </>
                  ) : (
                    <span className="qv-sale-price">{Number(quickViewProduct.regularPrice).toLocaleString()} PKR</span>
                  )}
                </div>

                <p className="qv-desc">{quickViewProduct.description || quickViewProduct.shortDescription || 'No description provided for this listing.'}</p>

                <div className="qv-stock-indicator">
                  <strong>Stock:</strong> 
                  <span className={`status-badge-pill ${(quickViewProduct.stockStatus || 'In Stock').toString().replace(' ', '-').toLowerCase()}`}>
                    {quickViewProduct.stockStatus || 'In Stock'}
                  </span>
                </div>

                <div className="qv-actions-row">
                  <button className="pet-btn-primary" onClick={() => { handleAddToCart(quickViewProduct); setQuickViewProduct(null); }}>
                    <ShoppingCart size={16} style={{ marginRight: '8px' }} /> Add to Cart
                  </button>
                  <button 
                    className={`qv-wishlist-btn ${safeWishlist.includes(quickViewProduct._id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(quickViewProduct._id)}
                  >
                    <Heart size={16} fill={safeWishlist.includes(quickViewProduct._id) ? '#EF4444' : 'none'} color={safeWishlist.includes(quickViewProduct._id) ? '#EF4444' : 'currentColor'} />
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
        <div 
          className="cart-preview-summary clickable"
          onClick={() => {
            openCartDrawer();
            if (onViewCart) onViewCart();
          }}
          role="button"
          tabIndex={0}
          title="View Shopping Cart"
          style={{ position: 'relative' }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={24} color="var(--color-primary)" />
            {totalCartUnits > 0 && (
              <span className="cart-banner-badge" aria-label={`Shopping cart, ${totalCartUnits} items`}>
                {totalCartUnits > 99 ? '99+' : totalCartUnits}
              </span>
            )}
          </div>
          <div>
            <span className="cart-total-label">My Shopping Cart</span>
            <span className="cart-total-value">{totalCartUnits} {totalCartUnits === 1 ? 'item' : 'items'}</span>
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
                {filteredProducts.map(prod => {
                  const prodId = prod._id || prod.id;
                  const isWishlisted = safeWishlist.includes(prodId);
                  const isJustAdded = justAddedId === prodId;

                  const stockStatus = (prod.stockStatus || 'In Stock').toString().toLowerCase();
                  const stockQty = Number(prod.stock ?? prod.stockQuantity ?? 10);
                  const isOutOfStock = stockStatus === 'out of stock' || stockStatus === 'out-of-stock' || stockQty <= 0;

                  return (
                    <div 
                      key={prodId} 
                      className="store-product-card hover-lift"
                      onClick={() => handleOpenProduct(prodId)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Image & Badges wrapper */}
                      <div className="card-media-wrapper">
                        {prod.images && prod.images.length > 0 ? (
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name} 
                            className="card-main-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/logo/logo.jpeg';
                            }}
                          />
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
                        <div className="card-floating-actions" onClick={(e) => e.stopPropagation()}>
                          <button 
                            type="button"
                            className="floating-btn view" 
                            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(prod); }} 
                            title="Quick View Product"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            type="button"
                            className={`floating-btn wishlist ${isWishlisted ? 'active' : ''}`} 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(prodId); }}
                            title="Save to Wishlist"
                          >
                            <Heart size={14} fill={isWishlisted ? '#EF4444' : 'none'} color={isWishlisted ? '#EF4444' : 'currentColor'} />
                          </button>
                        </div>
                      </div>

                      {/* Metadata body */}
                      <div className="card-meta-body">
                        {prod.brand && <span className="card-brand-label">{prod.brand}</span>}
                        <h4 className="card-prod-title">
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
                                <span className="card-price-sale">{Number(prod.salePrice).toLocaleString()} PKR</span>
                                <span className="card-price-reg-crossed">{Number(prod.regularPrice || prod.salePrice).toLocaleString()} PKR</span>
                              </>
                            ) : (
                              <span className="card-price-sale">{Number(prod.regularPrice || prod.price || 0).toLocaleString()} PKR</span>
                            )}
                          </div>
                          
                          <span className={`card-stock-status-pill ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                            {isOutOfStock ? 'Out of Stock' : (prod.stockStatus || 'In Stock')}
                          </span>
                        </div>

                        {/* DIRECT ADD TO CART BUTTON ON CARD */}
                        <div className="card-cart-action-row" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={`card-add-to-cart-btn ${isOutOfStock ? 'out-of-stock' : ''} ${isJustAdded ? 'just-added' : ''}`}
                            onClick={(e) => handleQuickAddToCart(prod, e)}
                            disabled={isOutOfStock}
                            title={isOutOfStock ? 'This product is out of stock' : 'Add to Shopping Cart'}
                          >
                            {isOutOfStock ? (
                              <>
                                <XCircle size={15} />
                                <span>Out of Stock</span>
                              </>
                            ) : isJustAdded ? (
                              <>
                                <Check size={15} strokeWidth={2.5} />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={15} />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}

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
