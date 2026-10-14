import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, ArrowLeft, Trash2, Plus, Minus, 
  ShieldCheck, Truck, CreditCard, CheckCircle2, 
  Package, X, ArrowRight, AlertTriangle
} from 'lucide-react';
import { 
  getCart, getCartCount, updateCartQuantity, 
  removeFromCart, clearCart, subscribeToCart 
} from '../utils/cartManager';
import './CartPage.css';

export default function CartPage({ 
  user, 
  onContinueShopping, 
  onViewProductDetails 
}) {
  const [cartItems, setCartItems] = useState(() => getCart());
  const [selectedItemIds, setSelectedItemIds] = useState(() => {
    // By default, select all existing items in cart for convenient checkout
    const initial = getCart();
    return initial.map(item => item.cartItemId || item._id || item.id);
  });

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderReference, setOrderReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checkout Form State (pre-filled with current user profile if available)
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(user?.address || '');
  const [customerCity, setCustomerCity] = useState(user?.city || 'Lahore');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'card'

  // Reactive subscription to cart updates
  useEffect(() => {
    const unsubscribe = subscribeToCart((updated) => {
      setCartItems(updated);
      // Clean up selected items that no longer exist in the cart
      setSelectedItemIds(prev => {
        const validIds = new Set(updated.map(i => i.cartItemId || i._id || i.id));
        return prev.filter(id => validIds.has(id));
      });
    });

    return () => unsubscribe();
  }, []);

  // Compute selected items
  const selectedItems = useMemo(() => {
    const selectedSet = new Set(selectedItemIds);
    return cartItems.filter(item => selectedSet.has(item.cartItemId || item._id || item.id));
  }, [cartItems, selectedItemIds]);

  // Total quantity count of selected units
  const selectedUnitsCount = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + Number(item.selectedQuantity || 1), 0);
  }, [selectedItems]);

  // Subtotal of selected items only
  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const price = Number(item.salePrice || item.regularPrice || item.price || 0);
      const qty = Number(item.selectedQuantity || 1);
      return acc + (price * qty);
    }, 0);
  }, [selectedItems]);

  // Overall cart units count for header pill
  const totalCartUnits = useMemo(() => {
    return getCartCount(cartItems);
  }, [cartItems]);

  // Toggle selection for an individual item
  const handleToggleItemSelection = (itemId) => {
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Toggle Select All
  const isAllSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(cartItems.map(item => item.cartItemId || item._id || item.id));
    }
  };

  // Handle Quantity Change
  const handleQuantityChange = (cartItemId, currentQty, delta) => {
    const nextQty = Math.max(1, currentQty + delta);
    updateCartQuantity(cartItemId, nextQty);
  };

  // Handle Remove Item
  const handleRemoveItem = (cartItemId) => {
    removeFromCart(cartItemId);
  };

  // Handle Remove Selected Items
  const handleRemoveSelected = () => {
    if (selectedItemIds.length === 0) return;
    clearCart(selectedItemIds);
  };

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;
    setIsCheckoutOpen(true);
  };

  // Confirm and Place Order
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Generate standard order reference ID
      const refId = `PL-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderReference(refId);

      // Remove ONLY the selected checked-out items from the cart (unselected items remain!)
      clearCart(selectedItemIds);

      setIsSubmitting(false);
      setIsOrderPlaced(true);
    }, 800);
  };

  return (
    <div className="cart-page-wrapper">
      
      {/* Top Header & Navigation */}
      <div className="cart-page-header">
        <div className="cart-header-title-group">
          <h1 className="cart-page-title">Shopping Cart</h1>
          <span className="cart-count-pill">
            {totalCartUnits} {totalCartUnits === 1 ? 'item' : 'items'}
          </span>
        </div>

        <button 
          type="button" 
          className="cart-btn-back-shop"
          onClick={onContinueShopping}
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </button>
      </div>

      {/* When Cart is Empty */}
      {cartItems.length === 0 ? (
        <div className="cart-empty-container">
          <div className="cart-empty-icon-circle">
            <ShoppingCart size={40} />
          </div>
          <h2 className="cart-empty-title">Your cart is empty</h2>
          <p className="cart-empty-desc">
            Looks like you haven't added any products to your basket yet. 
            Discover our verified food, treats, toys, and healthcare supplies for your pets.
          </p>
          <button 
            type="button" 
            className="cart-empty-btn"
            onClick={onContinueShopping}
          >
            <span>Explore Store Products</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        /* When Cart Has Items */
        <div className="cart-layout-grid">
          
          {/* Left Column: Cart Items List */}
          <div className="cart-items-section">
            
            {/* Select All Toolbar */}
            <div className="cart-select-all-bar">
              <label className="cart-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="cart-item-checkbox"
                  aria-label="Select all cart items"
                />
                <span>Select All ({cartItems.length} products)</span>
              </label>

              {selectedItemIds.length > 0 && (
                <button 
                  type="button" 
                  className="cart-btn-remove-selected"
                  onClick={handleRemoveSelected}
                >
                  <Trash2 size={13} />
                  <span>Remove Selected ({selectedItemIds.length})</span>
                </button>
              )}
            </div>

            {/* Individual Cart Items List */}
            {cartItems.map((item) => {
              const itemId = item.cartItemId || item._id || item.id;
              const isSelected = selectedItemIds.includes(itemId);
              const unitPrice = Number(item.salePrice || item.regularPrice || item.price || 0);
              const qty = Number(item.selectedQuantity || 1);
              const subtotal = unitPrice * qty;
              const imageSrc = (item.images && item.images.length > 0) ? item.images[0] : null;

              return (
                <div 
                  key={itemId} 
                  className={`cart-item-card ${isSelected ? 'selected' : ''}`}
                >
                  {/* Selection Checkbox */}
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => handleToggleItemSelection(itemId)}
                    className="cart-item-checkbox"
                    aria-label={`Select ${item.name}`}
                  />

                  {/* Thumbnail Image */}
                  <div 
                    className="cart-item-image-box"
                    onClick={() => onViewProductDetails && onViewProductDetails(item._id || item.id)}
                    title="View Product Details"
                  >
                    {imageSrc ? (
                      <img src={imageSrc} alt={item.name} className="cart-item-img" />
                    ) : (
                      <Package size={28} color="#94A3B8" />
                    )}
                  </div>

                  {/* Product Metadata Info */}
                  <div className="cart-item-info">
                    {item.brand && (
                      <div className="cart-item-brand">{item.brand}</div>
                    )}
                    
                    <h3 
                      className="cart-item-name" 
                      onClick={() => onViewProductDetails && onViewProductDetails(item._id || item.id)}
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    <div className="cart-item-meta-row">
                      {item.selectedVariant && (
                        <span className="cart-item-variant-tag">
                          Option: {typeof item.selectedVariant === 'string' ? item.selectedVariant : item.selectedVariant.name || 'Standard'}
                        </span>
                      )}

                      <span className={`cart-item-stock-tag ${item.stockStatus === 'Out of Stock' ? 'out-of-stock' : 'in-stock'}`}>
                        {item.stockStatus || 'In Stock'}
                      </span>
                    </div>

                    <div className="cart-item-pricing-row">
                      <span className="cart-item-unit-price">
                        {unitPrice.toLocaleString()} PKR
                      </span>
                      {item.salePrice && item.regularPrice && item.regularPrice > item.salePrice && (
                        <span className="cart-item-reg-price">
                          {Number(item.regularPrice).toLocaleString()} PKR
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="cart-item-actions-col">
                    <div className="cart-item-subtotal">
                      {subtotal.toLocaleString()} PKR
                    </div>

                    <div className="cart-qty-stepper">
                      <button 
                        type="button" 
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(itemId, qty, -1)}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="cart-qty-val">{qty}</span>
                      <button 
                        type="button" 
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(itemId, qty, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button 
                      type="button" 
                      className="cart-btn-remove-item"
                      onClick={() => handleRemoveItem(itemId)}
                      title="Remove from cart"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary Card */}
          <aside className="cart-summary-card">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-row">
              <span>Selected Products</span>
              <span className="cart-summary-value">{selectedItems.length} of {cartItems.length}</span>
            </div>

            <div className="cart-summary-row">
              <span>Selected Units Count</span>
              <span className="cart-summary-value">{selectedUnitsCount} units</span>
            </div>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="cart-summary-value">{selectedSubtotal.toLocaleString()} PKR</span>
            </div>

            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <span className="cart-summary-value" style={{ color: '#16A34A' }}>
                {selectedSubtotal > 0 ? 'Free Shipping' : '—'}
              </span>
            </div>

            <div className="cart-summary-row total-row">
              <span>Estimated Total</span>
              <span className="cart-summary-value">{selectedSubtotal.toLocaleString()} PKR</span>
            </div>

            {/* Checkout Action */}
            <button 
              type="button" 
              className="cart-checkout-btn"
              onClick={handleProceedToCheckout}
              disabled={selectedItems.length === 0}
            >
              <CreditCard size={18} />
              <span>Proceed to Checkout ({selectedUnitsCount})</span>
            </button>

            {selectedItems.length === 0 && (
              <p className="cart-checkout-hint">
                Select at least one product above to proceed with order checkout.
              </p>
            )}

            {/* Trust Badges */}
            <div className="cart-trust-badges">
              <div className="cart-trust-item">
                <ShieldCheck size={18} className="cart-trust-icon" />
                <span>Verified PetLink Catalog Products</span>
              </div>
              <div className="cart-trust-item">
                <Truck size={18} className="cart-trust-icon" />
                <span>Fast Nationwide Home Delivery</span>
              </div>
            </div>
          </aside>

        </div>
      )}

      {/* Checkout Dialog Modal */}
      {isCheckoutOpen && (
        <div className="cart-checkout-modal-overlay" onClick={() => !isSubmitting && setIsCheckoutOpen(false)}>
          <div className="cart-checkout-modal-box" onClick={(e) => e.stopPropagation()}>
            
            {!isOrderPlaced ? (
              <>
                <div className="cart-checkout-modal-header">
                  <h3 className="cart-checkout-modal-title">Checkout Confirmation</h3>
                  <button 
                    type="button" 
                    className="atc-close-btn" 
                    onClick={() => setIsCheckoutOpen(false)}
                    disabled={isSubmitting}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handlePlaceOrder}>
                  {/* Selected Items Review */}
                  <div className="cart-checkout-items-preview">
                    {selectedItems.map(item => (
                      <div key={item.cartItemId || item._id} className="cart-checkout-item-mini">
                        <div>
                          <strong>{item.name}</strong> × {item.selectedQuantity || 1}
                          {item.selectedVariant && (
                            <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>
                              Option: {typeof item.selectedVariant === 'string' ? item.selectedVariant : item.selectedVariant.name}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                          {(Number(item.salePrice || item.regularPrice || item.price || 0) * Number(item.selectedQuantity || 1)).toLocaleString()} PKR
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Contact & Address Form */}
                  <div className="cart-checkout-form-group">
                    <label className="cart-checkout-form-label">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="cart-checkout-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Receiver's full name"
                    />
                  </div>

                  <div className="cart-checkout-form-group">
                    <label className="cart-checkout-form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      className="cart-checkout-input"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 0300-1234567"
                    />
                  </div>

                  <div className="cart-checkout-form-group">
                    <label className="cart-checkout-form-label">Delivery Street Address</label>
                    <input 
                      type="text" 
                      required 
                      className="cart-checkout-input"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="House / Street / Area"
                    />
                  </div>

                  <div className="cart-checkout-form-group">
                    <label className="cart-checkout-form-label">City</label>
                    <input 
                      type="text" 
                      required 
                      className="cart-checkout-input"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="cart-checkout-form-group">
                    <label className="cart-checkout-form-label">Payment Method</label>
                    <div className="cart-checkout-payment-options">
                      <div 
                        className={`cart-payment-option-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        <Truck size={18} />
                        <span>Cash on Delivery</span>
                      </div>
                      <div 
                        className={`cart-payment-option-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <CreditCard size={18} />
                        <span>Card / Online Pay</span>
                      </div>
                    </div>
                  </div>

                  {/* Total banner */}
                  <div className="cart-checkout-total-banner">
                    <span>Payable Total:</span>
                    <span className="cart-checkout-total-amount">{selectedSubtotal.toLocaleString()} PKR</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="cart-checkout-modal-actions">
                    <button 
                      type="button" 
                      className="atc-btn-continue"
                      onClick={() => setIsCheckoutOpen(false)}
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="atc-btn-view-cart"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Order Confirmation Success Screen */
              <div className="cart-success-view">
                <div className="cart-success-icon-circle">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="cart-checkout-modal-title" style={{ marginBottom: '8px' }}>
                  Order Successfully Placed!
                </h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '13px', marginBottom: '16px' }}>
                  Thank you for shopping with PetLink. Your order has been registered and is being prepared for dispatch.
                </p>

                <div className="cart-success-order-id-pill">
                  Order ID: {orderReference}
                </div>

                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>
                  <div><strong>Receiver:</strong> {customerName} ({customerPhone})</div>
                  <div><strong>Address:</strong> {customerAddress}, {customerCity}</div>
                  <div><strong>Payment:</strong> {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
                  <div><strong>Items Ordered:</strong> {selectedUnitsCount} units ({selectedItems.length} products)</div>
                </div>

                <button 
                  type="button" 
                  className="cart-checkout-btn"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setIsOrderPlaced(false);
                    if (onContinueShopping) onContinueShopping();
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Return to Pet Shop</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
