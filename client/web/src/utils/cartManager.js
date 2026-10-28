/**
 * Centralized Shopping Cart Manager for PetLink Web Application
 * Handles synchronized persistence in localStorage and cross-component reactive updates
 * via custom Window events.
 */

export const CART_STORAGE_KEY = 'petlink_cart';
export const CART_UPDATE_EVENT = 'petlink_cart_updated';

/**
 * Retrieves the current cart array from localStorage.
 * Ensures consistent data types and non-null values.
 */
export function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading PetLink cart from storage:', err);
    return [];
  }
}

/**
 * Calculates total units in the cart (sum of item quantities).
 * E.g., 2 items with qty 2 and qty 1 => returns 3.
 */
export function getCartCount(cartItems = null) {
  const items = cartItems || getCart();
  return items.reduce((total, item) => {
    const qty = Number(item.selectedQuantity || item.quantity || 1);
    return total + (isNaN(qty) ? 1 : Math.max(1, qty));
  }, 0);
}

/**
 * Persists cart items and emits reactive window events for live synchronization.
 */
export function saveCart(items) {
  try {
    const sanitized = Array.isArray(items) ? items : [];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(sanitized));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT, { detail: sanitized }));
    }
    return sanitized;
  } catch (err) {
    console.error('Error saving PetLink cart to storage:', err);
    return items;
  }
}

/**
 * Adds an item to the cart or merges quantity if the exact same product and variant already exist.
 */
export function addToCart(product, quantity = 1, variant = null) {
  if (!product) return { updatedCart: getCart(), addedItem: null };

  const currentCart = getCart();
  const prodId = product._id || product.id;
  const variantName = typeof variant === 'string' ? variant : variant?.name || null;
  const numQty = Math.max(1, Number(quantity) || 1);

  // Check if identical product and variant already exist in the cart
  const existingIdx = currentCart.findIndex(item => {
    const itemId = item._id || item.id;
    const itemVar = typeof item.selectedVariant === 'string' ? item.selectedVariant : item.selectedVariant?.name || null;
    return itemId === prodId && itemVar === variantName;
  });

  let updatedCart;
  let finalCartItem;

  if (existingIdx >= 0) {
    // Merge quantity with existing item
    const existingItem = currentCart[existingIdx];
    const newQty = (Number(existingItem.selectedQuantity) || 1) + numQty;
    
    updatedCart = [...currentCart];
    updatedCart[existingIdx] = {
      ...existingItem,
      ...product, // refresh product metadata (prices, photos, etc.)
      selectedQuantity: newQty,
      selectedVariant: variantName,
    };
    finalCartItem = updatedCart[existingIdx];
  } else {
    // Create new distinct cart item
    const newItem = {
      ...product,
      _id: prodId,
      id: prodId,
      selectedQuantity: numQty,
      selectedVariant: variantName,
      cartItemId: `${prodId}-${variantName || 'default'}-${Date.now()}`
    };
    updatedCart = [...currentCart, newItem];
    finalCartItem = newItem;
  }

  saveCart(updatedCart);
  return { updatedCart, addedItem: finalCartItem, quantityAdded: numQty };
}

/**
 * Updates the quantity for a specific cartItemId. Prevents quantity from dropping below 1.
 */
export function updateCartQuantity(cartItemId, newQuantity) {
  const currentCart = getCart();
  const safeQty = Math.max(1, Number(newQuantity) || 1);

  const updatedCart = currentCart.map(item => {
    if (item.cartItemId === cartItemId || (item._id === cartItemId && !item.cartItemId)) {
      return { ...item, selectedQuantity: safeQty };
    }
    return item;
  });

  saveCart(updatedCart);
  return updatedCart;
}

/**
 * Removes a specific item from the cart.
 */
export function removeFromCart(cartItemId) {
  const currentCart = getCart();
  const updatedCart = currentCart.filter(item => {
    return item.cartItemId !== cartItemId && item._id !== cartItemId && item.id !== cartItemId;
  });

  saveCart(updatedCart);
  return updatedCart;
}

/**
 * Clears the shopping cart.
 * If specific cartItemIds are provided, only removes those (useful when checking out selected items).
 */
export function clearCart(cartItemIdsToRemove = null) {
  if (Array.isArray(cartItemIdsToRemove) && cartItemIdsToRemove.length > 0) {
    const currentCart = getCart();
    const updatedCart = currentCart.filter(item => !cartItemIdsToRemove.includes(item.cartItemId || item._id || item.id));
    saveCart(updatedCart);
    return updatedCart;
  }

  saveCart([]);
  return [];
}

/**
 * Subscribes a React component to cart changes from any page/component or window.
 * Returns an unsubscription function.
 */
export function subscribeToCart(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e) => {
    if (callback) callback(e.detail || getCart());
  };

  const handleStorageEvent = (e) => {
    if (e.key === CART_STORAGE_KEY) {
      if (callback) callback(getCart());
    }
  };

  window.addEventListener(CART_UPDATE_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(CART_UPDATE_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export const CART_DRAWER_EVENT = 'petlink_cart_drawer_toggle';

/**
 * Triggers the right-side shopping cart drawer to open.
 */
export function openCartDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_DRAWER_EVENT, { detail: { open: true } }));
  }
}

/**
 * Triggers the right-side shopping cart drawer to close.
 */
export function closeCartDrawer() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_DRAWER_EVENT, { detail: { open: false } }));
  }
}

/**
 * Subscribes to open/close cart drawer requests across components.
 */
export function subscribeToCartDrawer(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleDrawerEvent = (e) => {
    if (callback) {
      callback(e.detail ? Boolean(e.detail.open) : true);
    }
  };

  window.addEventListener(CART_DRAWER_EVENT, handleDrawerEvent);
  return () => {
    window.removeEventListener(CART_DRAWER_EVENT, handleDrawerEvent);
  };
}

