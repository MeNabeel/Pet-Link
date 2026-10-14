import React, { useEffect } from 'react';
import { Check, ShoppingCart, ArrowRight, X, Package } from 'lucide-react';
import './AddToCartPopup.css';

export default function AddToCartPopup({
  isOpen,
  onClose,
  onViewCart,
  itemInfo
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !itemInfo || !itemInfo.product) return null;

  const { product, quantity = 1, variant = null } = itemInfo;
  const imageSrc = (product.images && product.images.length > 0) ? product.images[0] : null;
  const unitPrice = Number(product.salePrice || product.regularPrice || product.price || 0);
  const totalPrice = unitPrice * Number(quantity);

  return (
    <div className="atc-popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="atc-title">
      <div className="atc-popup-container" onClick={(e) => e.stopPropagation()}>
        {/* Upper Close Button */}
        <button 
          type="button" 
          className="atc-close-btn" 
          onClick={onClose} 
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Heading Header */}
        <div className="atc-header-row">
          <div className="atc-check-icon-circle">
            <Check size={20} strokeWidth={2.5} />
          </div>
          <h3 id="atc-title" className="atc-header-title">Added to Cart</h3>
        </div>

        {/* Product Details Card */}
        <div className="atc-product-card">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={product.name || 'Product'} 
              className="atc-product-thumb" 
            />
          ) : (
            <div className="atc-product-placeholder">
              <Package size={28} />
            </div>
          )}

          <div className="atc-product-info">
            <h4 className="atc-product-name" title={product.name}>
              {product.name}
            </h4>

            <div className="atc-meta-tags">
              {variant && (
                <span className="atc-variant-pill">
                  {typeof variant === 'string' ? variant : variant.name || 'Selected Option'}
                </span>
              )}
              <span className="atc-qty-text">
                Quantity: {quantity}
              </span>
            </div>

            <div className="atc-price-text">
              {unitPrice.toLocaleString()} PKR
              {quantity > 1 && (
                <span className="atc-total-line">
                  (Total: {totalPrice.toLocaleString()} PKR)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="atc-actions-row">
          <button 
            type="button" 
            className="atc-btn-continue" 
            onClick={onClose}
          >
            Continue Shopping
          </button>
          
          <button 
            type="button" 
            className="atc-btn-view-cart" 
            onClick={() => {
              onClose();
              if (onViewCart) onViewCart();
            }}
          >
            <ShoppingCart size={16} />
            <span>View Cart</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
