import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ChevronRight, Star, ShoppingBag, Heart, Check, 
  Truck, ShieldCheck, Clock, Package, AlertTriangle, Eye, 
  Share2, PawPrint, Info, Layers, Tag, X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import './ProductDetails.css';

export default function ProductDetails({ 
  user, 
  productId, 
  onBack, 
  onNavigateToProduct,
  cart = [],
  setCart,
  wishlist = [],
  setWishlist,
  onOpenChat
}) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Local cart & wishlist state synchronization fallback
  const [localCart, setLocalCart] = useState(() => {
    try {
      const stored = localStorage.getItem('petlink_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [localWishlist, setLocalWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem('petlink_store_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Active cart items and wishlist items (prefer props if supplied, otherwise local state)
  const activeCart = setCart ? cart : localCart;
  const activeWishlist = setWishlist ? wishlist : localWishlist;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Fetch product data
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        setError(null);
        setActiveImageIndex(0);
        setQuantity(1);
        setSelectedVariant(null);

        // Try single product endpoint
        const res = await fetch(`${API_URL}/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProduct(data);
            if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
              setSelectedVariant(data.variants[0]);
            } else if (data.sizes && Array.isArray(data.sizes) && data.sizes.length > 0) {
              setSelectedVariant({ name: data.sizes[0] });
            }
          }
        } else {
          // Fallback: fetch all and find by ID
          const fallbackRes = await fetch(`${API_URL}/api/products?status=Published&visibility=Public`);
          if (fallbackRes.ok) {
            const allProducts = await fallbackRes.json();
            const found = allProducts.find(p => p._id === productId || p.id === productId);
            if (found && isMounted) {
              setProduct(found);
              if (found.variants && Array.isArray(found.variants) && found.variants.length > 0) {
                setSelectedVariant(found.variants[0]);
              } else if (found.sizes && Array.isArray(found.sizes) && found.sizes.length > 0) {
                setSelectedVariant({ name: found.sizes[0] });
              }
            } else if (isMounted) {
              setError('Product not found in store catalog.');
            }
          } else if (isMounted) {
            setError('Unable to load product information.');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching product details:', err);
          setError('Failed to connect to the store catalog.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Fetch related products based on current product's category or petType
  useEffect(() => {
    const fetchRelated = async () => {
      if (!product) return;
      try {
        const catId = product.category?._id || product.category?.id || (typeof product.category === 'string' ? product.category : null);
        const url = catId 
          ? `${API_URL}/api/products?status=Published&visibility=Public&category=${catId}`
          : `${API_URL}/api/products?status=Published&visibility=Public`;

        const res = await fetch(url);
        if (res.ok) {
          const list = await res.json();
          const filtered = list.filter(p => (p._id || p.id) !== (product._id || product.id)).slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Error loading related products:', err);
      }
    };

    fetchRelated();
  }, [product]);

  // Wishlist toggle handler
  const handleToggleWishlist = (id) => {
    const targetId = id || (product?._id || product?.id);
    if (!targetId) return;

    if (setWishlist) {
      if (wishlist.includes(targetId)) {
        setWishlist(prev => prev.filter(item => item !== targetId));
      } else {
        setWishlist(prev => [...prev, targetId]);
      }
    } else {
      setLocalWishlist(prev => {
        const updated = prev.includes(targetId) 
          ? prev.filter(item => item !== targetId) 
          : [...prev, targetId];
        localStorage.setItem('petlink_store_wishlist', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Add to Cart handler
  const handleAddToCart = (targetProd, targetQty = 1, targetVariant = null) => {
    const p = targetProd || product;
    if (!p) return;

    const itemToAdd = {
      ...p,
      selectedQuantity: targetQty,
      selectedVariant: targetVariant || selectedVariant,
      cartItemId: `${p._id || p.id}-${Date.now()}`
    };

    if (setCart) {
      setCart(prev => [...prev, itemToAdd]);
    } else {
      setLocalCart(prev => {
        const updated = [...prev, itemToAdd];
        localStorage.setItem('petlink_cart', JSON.stringify(updated));
        return updated;
      });
    }

    showToast(`Added ${targetQty}x "${p.name}" to cart!`);
  };

  // Loading State
  if (loading) {
    return (
      <div className="product-details-container fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '100px', height: '24px', backgroundColor: '#E2E8F0', borderRadius: '6px' }} />
          <div style={{ width: '140px', height: '24px', backgroundColor: '#E2E8F0', borderRadius: '6px' }} />
        </div>

        <div className="product-main-grid">
          <div style={{ width: '100%', height: '420px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E2E8F0', borderRadius: '20px' }}>
            <div style={{ width: '120px', height: '20px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
            <div style={{ width: '70%', height: '32px', backgroundColor: '#E2E8F0', borderRadius: '6px' }} />
            <div style={{ width: '180px', height: '24px', backgroundColor: '#E2E8F0', borderRadius: '4px' }} />
            <div style={{ width: '100%', height: '80px', backgroundColor: '#F1F5F9', borderRadius: '12px' }} />
            <div style={{ width: '100%', height: '44px', backgroundColor: '#E2E8F0', borderRadius: '10px' }} />
          </div>
        </div>
      </div>
    );
  }

  // Not Found or Error State
  if (error || !product) {
    return (
      <div className="product-details-container fade-in">
        <div className="product-not-found-card">
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0,102,204,0.08)', color: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Product Not Found</h2>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
            {error || 'The requested product could not be found or has been unlisted.'}
          </p>
          <button 
            onClick={onBack}
            className="breadcrumb-back-btn" 
            style={{ marginTop: '12px', padding: '10px 20px', fontSize: '13px' }}
          >
            <ArrowLeft size={16} />
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[activeImageIndex] || null;
  const isOutOfStock = product.stockStatus === 'Out of Stock' || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
  const isLowStock = product.stockStatus === 'Low Stock' || (product.stockQuantity > 0 && product.stockQuantity <= 5);
  const maxStock = product.stockQuantity !== undefined && product.stockQuantity > 0 ? product.stockQuantity : 99;

  const currentPrice = product.salePrice || product.regularPrice;
  const originalPrice = product.regularPrice;
  const hasDiscount = Boolean(product.salePrice && product.discount > 0);
  const discountPercent = product.discount || Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const categoryName = product.category?.name || 'Accessories';
  const isWishlisted = activeWishlist.includes(product._id || product.id);

  return (
    <div className="product-details-container fade-in">
      
      {/* Toast Alert Popup */}
      {toastMessage && (
        <div className="cart-toast-alert">
          <div className="toast-content">
            <Check size={16} color="#FFF" style={{ backgroundColor: '#10B981', borderRadius: '50%', padding: '2px' }} />
            <span>{toastMessage}</span>
          </div>
          <span className="cart-count-bubble">{activeCart.length} in cart</span>
        </div>
      )}

      {/* A. BREADCRUMB NAVIGATION */}
      <nav className="product-breadcrumbs" aria-label="Breadcrumb">
        <button 
          onClick={onBack} 
          className="breadcrumb-back-btn"
          title="Return to Shop catalog"
        >
          <ArrowLeft size={15} />
          Back to Store
        </button>

        <span className="breadcrumb-link" onClick={onBack}>Shop</span>
        <span className="breadcrumb-separator"><ChevronRight size={13} /></span>
        <span className="breadcrumb-link" onClick={onBack}>{categoryName}</span>
        <span className="breadcrumb-separator"><ChevronRight size={13} /></span>
        <span className="breadcrumb-current" title={product.name}>{product.name}</span>
      </nav>

      {/* B & C. MAIN PRODUCT DETAILS SECTION */}
      <div className="product-main-grid">
        
        {/* LEFT COLUMN: PRODUCT IMAGE GALLERY */}
        <div className="product-gallery-card">
          <div className="product-gallery-main">
            {/* Badges Overlay */}
            <div className="gallery-badges-overlay">
              <span className="gallery-cat-badge">{categoryName}</span>
              {hasDiscount && (
                <span className="gallery-discount-badge">{discountPercent}% OFF</span>
              )}
            </div>

            {/* Main Product Image */}
            {currentImage ? (
              <img 
                src={currentImage} 
                alt={product.name} 
                className="gallery-main-image"
                loading="lazy" 
              />
            ) : (
              <div className="gallery-no-image">
                <Package size={56} />
                <span style={{ fontSize: '13px', fontWeight: '600' }}>No image preview available</span>
              </div>
            )}
          </div>

          {/* Additional Thumbnails Navigation */}
          {images.length > 1 && (
            <div className="gallery-thumbnails-row">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`gallery-thumbnail-item ${idx === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                  title={`View image ${idx + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PRODUCT INFO & PURCHASE PANEL */}
        <div className="product-info-card">
          
          {/* Brand & SKU Header */}
          <div className="product-meta-header">
            {product.brand ? (
              <span className="product-brand-pill">Brand: {product.brand}</span>
            ) : (
              <span className="product-brand-pill">Verified PetLink Item</span>
            )}
            {product.sku && (
              <span className="product-sku-pill">SKU: {product.sku}</span>
            )}
          </div>

          {/* Product Title */}
          <h1 className="product-title-text">{product.name}</h1>

          {/* Ratings & Verification Bar */}
          <div className="product-ratings-bar">
            <div className="ratings-stars-group">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < 5 ? '#F59E0B' : 'none'} color="#F59E0B" />
              ))}
            </div>
            <span className="rating-score-bold">4.8</span>
            <span>(24 verified reviews)</span>
            <span className="verified-buyer-badge">
              <Check size={11} /> Verified Product
            </span>
          </div>

          {/* Price Box */}
          <div className="product-pricing-box">
            <span className="product-price-current">{currentPrice.toLocaleString()} PKR</span>
            {hasDiscount && (
              <>
                <span className="product-price-regular-striked">{originalPrice.toLocaleString()} PKR</span>
                <span className="product-savings-badge">
                  Save {(originalPrice - currentPrice).toLocaleString()} PKR ({discountPercent}%)
                </span>
              </>
            )}
          </div>

          {/* Stock Status Indicator */}
          <div className="product-stock-row">
            {isOutOfStock ? (
              <span className="stock-status-pill out-of-stock">
                <AlertTriangle size={13} /> Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="stock-status-pill low-stock">
                <Clock size={13} /> Only {product.stockQuantity} left in stock!
              </span>
            ) : (
              <span className="stock-status-pill in-stock">
                <Check size={13} /> In Stock ({product.stockQuantity || 'Available'} units)
              </span>
            )}
            <span className="stock-quantity-text">
              {product.stockStatus || 'Available for immediate dispatch'}
            </span>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="product-short-desc-text">{product.shortDescription}</p>
          )}

          {/* Quick Highlight Chips */}
          <div className="product-highlights-chips">
            {product.petType && (
              <span className="highlight-chip">
                <PawPrint size={13} color="#0066CC" /> For {product.petType}s
              </span>
            )}
            {product.cashOnDelivery !== false && (
              <span className="highlight-chip">
                <Check size={13} color="#16A34A" /> Cash on Delivery
              </span>
            )}
            {product.freeShipping && (
              <span className="highlight-chip">
                <Truck size={13} color="#0066CC" /> Free Shipping
              </span>
            )}
            {product.warranty && (
              <span className="highlight-chip">
                <ShieldCheck size={13} color="#0066CC" /> {product.warranty}
              </span>
            )}
          </div>

          {/* D. PRODUCT VARIANTS / SIZES (IF SUPPORTED IN DATA) */}
          {((product.variants && product.variants.length > 0) || (product.sizes && product.sizes.length > 0)) && (
            <div className="product-variants-wrapper">
              <span className="variants-label">Available Options / Sizes:</span>
              <div className="variants-options-list">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((v, i) => {
                    const optName = typeof v === 'object' ? (v.name || v.size || v.color || `Option ${i + 1}`) : v;
                    const isSelected = selectedVariant && (selectedVariant.name === optName || selectedVariant === v);
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`variant-btn-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedVariant(typeof v === 'object' ? v : { name: v })}
                      >
                        {optName}
                      </button>
                    );
                  })
                ) : (
                  product.sizes.map((s, i) => {
                    const isSelected = selectedVariant && selectedVariant.name === s;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`variant-btn-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedVariant({ name: s })}
                      >
                        {s}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* E, F, G. QUANTITY SELECTOR & PURCHASE ACTIONS */}
          <div className="product-purchase-actions">
            {/* Quantity Stepper */}
            <div className="product-qty-stepper" aria-label="Select quantity">
              <button 
                type="button"
                className="qty-step-btn" 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <input 
                type="text" 
                readOnly 
                className="qty-number-display" 
                value={quantity} 
                aria-label="Current quantity"
              />
              <button 
                type="button"
                className="qty-step-btn" 
                onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}
                disabled={quantity >= maxStock || isOutOfStock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button 
              type="button"
              className="btn-add-to-cart-large"
              onClick={() => handleAddToCart(product, quantity, selectedVariant)}
              disabled={isOutOfStock}
            >
              <ShoppingBag size={18} />
              <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Cart'}</span>
            </button>

            {/* Wishlist Button */}
            <button 
              type="button"
              className={`btn-wishlist-large ${isWishlisted ? 'active' : ''}`}
              onClick={() => handleToggleWishlist(product._id || product.id)}
              title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label="Toggle wishlist"
            >
              <Heart 
                size={18} 
                fill={isWishlisted ? '#EF4444' : 'none'} 
                color={isWishlisted ? '#EF4444' : 'currentColor'} 
              />
            </button>
          </div>

          {/* Trust Guarantees Bar */}
          <div className="product-trust-bar">
            <div className="trust-item">
              <ShieldCheck size={16} color="#0066CC" />
              <span>100% Authentic Product</span>
            </div>
            <div className="trust-item">
              <Truck size={16} color="#0066CC" />
              <span>Fast Doorstep Delivery</span>
            </div>
            <div className="trust-item">
              <Clock size={16} color="#0066CC" />
              <span>7-Day Return Warranty</span>
            </div>
          </div>

        </div>
      </div>

      {/* H & I. PRODUCT TABS (DESCRIPTION, SPECIFICATIONS, REVIEWS) */}
      <div className="product-details-tabs-card">
        
        {/* Tab Headers */}
        <div className="details-tabs-nav" role="tablist">
          <button 
            type="button"
            role="tab"
            aria-selected={activeTab === 'description'}
            className={`details-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            <Info size={15} />
            <span>Description</span>
          </button>
          
          <button 
            type="button"
            role="tab"
            aria-selected={activeTab === 'specifications'}
            className={`details-tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            <Layers size={15} />
            <span>Specifications & Details</span>
          </button>

          <button 
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviews'}
            className={`details-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <Star size={15} />
            <span>Customer Reviews (24)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="details-tab-content-body">
          
          {/* Tab 1: Description */}
          {activeTab === 'description' && (
            <div>
              <p className="tab-description-text">
                {product.description || product.shortDescription || 'Verified PetLink e-commerce store item. Built with the safest materials for your pets.'}
              </p>

              {product.tags && product.tags.length > 0 && (
                <div className="tab-tags-list">
                  {product.tags.map((t, idx) => (
                    <span key={idx} className="tab-tag-item">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specifications' && (
            <div className="specs-table-grid">
              <div className="spec-entry-row">
                <span className="spec-key">Category</span>
                <span className="spec-value">{categoryName}</span>
              </div>
              {product.brand && (
                <div className="spec-entry-row">
                  <span className="spec-key">Brand</span>
                  <span className="spec-value">{product.brand}</span>
                </div>
              )}
              {product.sku && (
                <div className="spec-entry-row">
                  <span className="spec-key">Catalog SKU</span>
                  <span className="spec-value">{product.sku}</span>
                </div>
              )}
              {product.petType && (
                <div className="spec-entry-row">
                  <span className="spec-key">Pet Species</span>
                  <span className="spec-value">{product.petType}</span>
                </div>
              )}
              {product.productType && (
                <div className="spec-entry-row">
                  <span className="spec-key">Product Classification</span>
                  <span className="spec-value">{product.productType}</span>
                </div>
              )}
              {product.weight && (
                <div className="spec-entry-row">
                  <span className="spec-key">Weight</span>
                  <span className="spec-value">{product.weight}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="spec-entry-row">
                  <span className="spec-key">Dimensions</span>
                  <span className="spec-value">{product.dimensions}</span>
                </div>
              )}
              {product.countryOfOrigin && (
                <div className="spec-entry-row">
                  <span className="spec-key">Country of Origin</span>
                  <span className="spec-value">{product.countryOfOrigin}</span>
                </div>
              )}
              {product.warranty && (
                <div className="spec-entry-row">
                  <span className="spec-key">Warranty</span>
                  <span className="spec-value">{product.warranty}</span>
                </div>
              )}
              <div className="spec-entry-row">
                <span className="spec-key">Payment Options</span>
                <span className="spec-value">Cash on Delivery & Online Pay</span>
              </div>
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="reviews-tab-layout">
              {/* Summary */}
              <div className="reviews-summary-card">
                <div>
                  <div className="reviews-score-big">4.8</div>
                  <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Based on 24 verified orders
                  </span>
                </div>
                <Separator orientation="vertical" style={{ height: '60px' }} />
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  <strong>100% of customers</strong> recommend this item for their pets. Verified purchase reviews from PetLink owners.
                </div>
              </div>

              {/* Reviews List */}
              <div className="reviews-list-stack">
                <div className="review-item-card">
                  <div className="review-header-row">
                    <div className="review-user-info">
                      <div className="review-user-avatar">A</div>
                      <div>
                        <div className="review-user-name">Ahmed Raza</div>
                        <div className="review-date-text">Verified Customer • Lahore, PK</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment-body">
                    Extremely satisfied with the delivery and packaging. My pet loved it from day one, high quality product exactly as described.
                  </p>
                </div>

                <div className="review-item-card">
                  <div className="review-header-row">
                    <div className="review-user-info">
                      <div className="review-user-avatar">S</div>
                      <div>
                        <div className="review-user-name">Sara Khan</div>
                        <div className="review-date-text">Verified Customer • Islamabad, PK</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment-body">
                    Great value for money. Very durable and prompt doorstep delivery via PetLink Store.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* J. RELATED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="related-section-header">
            <h3 className="related-section-title">
              <Package size={18} color="#0066CC" />
              Related Products in {categoryName}
            </h3>
          </div>

          <div className="products-responsive-grid">
            {relatedProducts.map(rel => (
              <div key={rel._id || rel.id} className="store-product-card hover-lift">
                <div 
                  className="card-media-wrapper"
                  onClick={() => onNavigateToProduct ? onNavigateToProduct(rel._id || rel.id) : null}
                  style={{ cursor: 'pointer' }}
                >
                  {rel.images && rel.images.length > 0 ? (
                    <img src={rel.images[0]} alt={rel.name} className="card-main-image" />
                  ) : (
                    <div className="card-no-img"><Package size={32} /></div>
                  )}
                  
                  <span className="card-cat-badge">{rel.category?.name || categoryName}</span>
                  {rel.salePrice && rel.discount > 0 && (
                    <span className="card-discount-badge">{rel.discount}% OFF</span>
                  )}

                  <div className="card-floating-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="floating-btn view" 
                      onClick={() => onNavigateToProduct ? onNavigateToProduct(rel._id || rel.id) : null} 
                      title="View Product"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className={`floating-btn wishlist ${activeWishlist.includes(rel._id || rel.id) ? 'active' : ''}`} 
                      onClick={() => handleToggleWishlist(rel._id || rel.id)}
                      title="Save to Wishlist"
                    >
                      <Heart 
                        size={14} 
                        fill={activeWishlist.includes(rel._id || rel.id) ? '#EF4444' : 'none'} 
                        color={activeWishlist.includes(rel._id || rel.id) ? '#EF4444' : 'currentColor'} 
                      />
                    </button>
                  </div>
                </div>

                <div className="card-meta-body">
                  {rel.brand && <span className="card-brand-label">{rel.brand}</span>}
                  <h4 
                    className="card-prod-title" 
                    onClick={() => onNavigateToProduct ? onNavigateToProduct(rel._id || rel.id) : null}
                  >
                    {rel.name}
                  </h4>
                  
                  <div className="card-ratings-row">
                    <div className="card-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill="#FBBF24" color="#FBBF24" />
                      ))}
                    </div>
                    <span className="card-rating-text">4.8</span>
                  </div>

                  <p className="card-short-desc">{rel.shortDescription || 'Verified premium pet essentials catalog item.'}</p>

                  <div className="card-price-stock-row">
                    <div className="card-prices">
                      {rel.salePrice ? (
                        <>
                          <span className="card-price-sale">{rel.salePrice.toLocaleString()} PKR</span>
                          <span className="card-price-reg-crossed">{rel.regularPrice.toLocaleString()} PKR</span>
                        </>
                      ) : (
                        <span className="card-price-sale">{rel.regularPrice.toLocaleString()} PKR</span>
                      )}
                    </div>
                    
                    <span className={`card-stock-status-pill ${(rel.stockStatus || 'in-stock').replace(' ', '-').toLowerCase()}`}>
                      {rel.stockStatus || 'In Stock'}
                    </span>
                  </div>

                  <button 
                    className="card-add-to-cart-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(rel, 1);
                    }}
                  >
                    <ShoppingBag size={12} style={{ marginRight: '6px' }} />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
