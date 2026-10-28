import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ShoppingCart, Trash2, Plus, Minus, Check, ArrowRight, ShieldCheck, 
  Package, AlertCircle, Loader2, Sparkles, ExternalLink 
} from 'lucide-react';
import API_URL from '@/config';
import { 
  getCart, 
  updateCartQuantity, 
  removeFromCart, 
  clearCart, 
  subscribeToCart, 
  closeCartDrawer,
  getCartCount
} from '../utils/cartManager';
import './CartDrawer.css';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  user, 
  onViewProductDetails 
}) {
  const [cartItems, setCartItems] = useState(() => getCart());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync with live cart changes
  useEffect(() => {
    const unsub = subscribeToCart((updated) => {
      setCartItems(updated);
    });
    return () => unsub();
  }, []);

  // Initialize all items as selected by default when cart loads or changes
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedIds(prev => {
        const next = new Set();
        cartItems.forEach(item => {
          const key = item.cartItemId || item._id || item.id;
          // Retain previous selection if valid, or default to selected
          if (prev.has(key) || prev.size === 0) {
            next.add(key);
          }
        });
        return next.size > 0 ? next : new Set(cartItems.map(i => i.cartItemId || i._id || i.id));
      });
    } else {
      setSelectedIds(new Set());
    }
  }, [cartItems]);

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setErrorMessage(null);
    if (onClose) {
      onClose();
    } else {
      closeCartDrawer();
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === cartItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map(i => i.cartItemId || i._id || i.id)));
    }
  };

  const handleToggleItem = (key) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleQuantityChange = (cartItemId, currentQty, delta) => {
    const nextQty = Math.max(1, currentQty + delta);
    updateCartQuantity(cartItemId, nextQty);
  };

  const handleRemove = (cartItemId) => {
    removeFromCart(cartItemId);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(cartItemId);
      return next;
    });
  };

  // Authoritative calculations
  const totalUnits = useMemo(() => getCartCount(cartItems), [cartItems]);

  const selectedItems = useMemo(() => {
    return cartItems.filter(i => selectedIds.has(i.cartItemId || i._id || i.id));
  }, [cartItems, selectedIds]);

  const selectedUnits = useMemo(() => getCartCount(selectedItems), [selectedItems]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const price = Number(item.salePrice || item.regularPrice || item.price || 0);
      const qty = Math.max(1, Number(item.selectedQuantity || item.quantity || 1));
      return acc + (price * qty);
    }, 0);
  }, [selectedItems]);

  // Initiate Stripe Checkout flow for selected items only
  const handleProceedToCheckout = async () => {
    if (selectedItems.length === 0) return;
    setErrorMessage(null);
    setIsCheckingOut(true);

    try {
      const payloadItems = selectedItems.map(item => ({
        productId: item._id || item.id,
        cartItemId: item.cartItemId || `${item._id || item.id}-${item.selectedVariant || 'default'}`,
        name: item.name,
        quantity: Math.max(1, Number(item.selectedQuantity || item.quantity || 1)),
        selectedVariant: typeof item.selectedVariant === 'string' ? item.selectedVariant : item.selectedVariant?.name || null
      }));

      // Store selected cartItemIds in sessionStorage so after Stripe redirect back, only these are cleared
      const selectedItemKeys = selectedItems.map(item => item.cartItemId || item._id || item.id);
      sessionStorage.setItem('petlink_pending_checkout_items', JSON.stringify(selectedItemKeys));

      const authHeaders = {
        'Content-Type': 'application/json'
      };
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
      const userId = user?._id || user?.id || localStorage.getItem('userId');
      if (userId) {
        authHeaders['x-requester-id'] = userId;
      }

      const returnOrigin = window.location.origin;
      const response = await fetch(`${API_URL}/api/checkout/create-session`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          items: payloadItems,
          customerEmail: user?.email || '',
          customerName: user?.name || '',
          successUrl: `${returnOrigin}/#/shop?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${returnOrigin}/#/shop?checkout=cancel`
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.url) {
        // Redirect directly to Stripe Checkout hosted page
        window.location.href = data.url;
      } else {
        setIsCheckingOut(false);
        const msg = data.message || 'Unable to initiate Stripe checkout. Please try again or contact support.';
        setErrorMessage(msg);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setIsCheckingOut(false);
      setErrorMessage(err.message || 'Connection error while communicating with checkout server.');
    }
  };

  const handleOpenProduct = (productId) => {
    if (onViewProductDetails) {
      handleClose();
      onViewProductDetails(productId);
    } else {
      window.location.hash = `#/shop/${productId}`;
      handleClose();
    }
  };

  if (!isOpen) return null;

  const isAllSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

  return (
    <div className="cart-drawer-root">
      {/* Backdrop */}
      <div 
        className="cart-drawer-backdrop" 
        onClick={handleClose} 
        aria-label="Close cart drawer"
      />

      {/* Drawer slide-out panel */}
      <aside className="cart-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        {/* Drawer Header */}
        <header className="cart-drawer-header">
          <div className="cart-drawer-header-title">
            <ShoppingCart size={20} className="cart-drawer-header-icon" />
            <h2 id="cart-drawer-title">Shopping Cart</h2>
            <span className="cart-drawer-badge">
              {totalUnits} {totalUnits === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button 
            type="button" 
            className="cart-drawer-close-btn" 
            onClick={handleClose}
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </header>

        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="cart-drawer-error-banner" role="alert">
            <AlertCircle size={18} className="cart-drawer-error-icon" />
            <div className="cart-drawer-error-text">
              <span>{errorMessage}</span>
            </div>
            <button 
              type="button" 
              className="cart-drawer-error-dismiss" 
              onClick={() => setErrorMessage(null)}
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {cartItems.length === 0 ? (
          <div className="cart-drawer-empty">
            <div className="cart-drawer-empty-icon-wrap">
              <ShoppingCart size={48} className="cart-drawer-empty-icon" />
            </div>
            <h3>Your cart is empty</h3>
            <p>Explore our pet products store to find wholesome food, toys, and healthcare supplies for your companion.</p>
            <button 
              type="button" 
              className="cart-drawer-browse-btn"
              onClick={() => {
                handleClose();
                window.location.hash = '#/shop';
              }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Selection Toolbar */}
            <div className="cart-drawer-toolbar">
              <label className="cart-drawer-select-all-label">
                <input 
                  type="checkbox" 
                  className="cart-drawer-checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                />
                <span>Select All ({cartItems.length})</span>
              </label>

              <span className="cart-drawer-selected-count">
                {selectedIds.size} of {cartItems.length} selected
              </span>
            </div>

            {/* Scrollable Items List */}
            <div className="cart-drawer-items-list">
              {cartItems.map((item) => {
                const key = item.cartItemId || item._id || item.id;
                const isSelected = selectedIds.has(key);
                const price = Number(item.salePrice || item.regularPrice || item.price || 0);
                const qty = Math.max(1, Number(item.selectedQuantity || item.quantity || 1));
                const itemTotal = price * qty;
                const imageSrc = Array.isArray(item.images) && item.images.length > 0 
                  ? item.images[0] 
                  : (item.image || null);

                return (
                  <div 
                    key={key} 
                    className={`cart-drawer-item-row ${isSelected ? 'selected' : ''}`}
                  >
                    {/* Item checkbox */}
                    <div className="cart-drawer-item-check">
                      <input 
                        type="checkbox" 
                        className="cart-drawer-checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleItem(key)}
                        aria-label={`Select ${item.name}`}
                      />
                    </div>

                    {/* Thumbnail */}
                    <div 
                      className="cart-drawer-item-thumb" 
                      onClick={() => handleOpenProduct(item._id || item.id)}
                      title="View product details"
                    >
                      {imageSrc ? (
                        <img src={imageSrc} alt={item.name} />
                      ) : (
                        <div className="cart-drawer-no-thumb">
                          <Package size={22} />
                        </div>
                      )}
                    </div>

                    {/* Metadata & Controls */}
                    <div className="cart-drawer-item-info">
                      <div className="cart-drawer-item-head">
                        <span 
                          className="cart-drawer-item-name" 
                          onClick={() => handleOpenProduct(item._id || item.id)}
                          title="View product details"
                        >
                          {item.name}
                        </span>
                        <button 
                          type="button" 
                          className="cart-drawer-item-delete"
                          onClick={() => handleRemove(key)}
                          title="Remove item"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Brand & Variant pills */}
                      <div className="cart-drawer-item-tags">
                        {item.brand && <span className="cart-drawer-brand-pill">{item.brand}</span>}
                        {item.selectedVariant && (
                          <span className="cart-drawer-variant-pill">
                            {typeof item.selectedVariant === 'string' ? item.selectedVariant : item.selectedVariant.name}
                          </span>
                        )}
                      </div>

                      {/* Pricing and Quantity row */}
                      <div className="cart-drawer-item-bottom">
                        <div className="cart-drawer-item-pricing">
                          <span className="cart-drawer-unit-price">
                            {price.toLocaleString()} PKR
                          </span>
                          {qty > 1 && (
                            <span className="cart-drawer-total-price">
                              ({itemTotal.toLocaleString()} PKR total)
                            </span>
                          )}
                        </div>

                        {/* Quantity Counter */}
                        <div className="cart-drawer-qty-group">
                          <button 
                            type="button" 
                            className="cart-drawer-qty-btn"
                            disabled={qty <= 1}
                            onClick={() => handleQuantityChange(key, qty, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="cart-drawer-qty-value">{qty}</span>
                          <button 
                            type="button" 
                            className="cart-drawer-qty-btn"
                            onClick={() => handleQuantityChange(key, qty, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Drawer Footer */}
            <footer className="cart-drawer-footer">
              <div className="cart-drawer-summary-card">
                <div className="cart-drawer-summary-row">
                  <span>Selected Items</span>
                  <span className="cart-drawer-summary-val">{selectedUnits} units ({selectedItems.length} products)</span>
                </div>
                <div className="cart-drawer-summary-row">
                  <span>Estimated Shipping</span>
                  <span className="cart-drawer-summary-val free-highlight">Calculated at checkout</span>
                </div>
                <div className="cart-drawer-summary-row total">
                  <span>Subtotal</span>
                  <span className="cart-drawer-total-amount">
                    {selectedSubtotal.toLocaleString()} PKR
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button 
                type="button" 
                className="cart-drawer-checkout-btn"
                disabled={selectedItems.length === 0 || isCheckingOut}
                onClick={handleProceedToCheckout}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 size={18} className="cart-drawer-spinner" />
                    <span>Preparing Secure Checkout...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Checkout Selected ({selectedItems.length})</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="cart-drawer-footer-actions">
                <button 
                  type="button" 
                  className="cart-drawer-continue-btn"
                  onClick={handleClose}
                >
                  Continue Shopping
                </button>
              </div>

              <div className="cart-drawer-trust-badge">
                <ShieldCheck size={14} />
                <span>Powered by Stripe • 256-bit Encrypted Checkout</span>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

