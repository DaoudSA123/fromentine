const CART_STORAGE_KEY = 'fromentine_cart'

/**
 * Get cart from localStorage
 * @returns {Array} Array of cart items
 */
export function getCart() {
  if (typeof window === 'undefined') return []
  
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY)
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    return []
  }
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Array of cart items
 */
export function saveCart(cart) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

/**
 * Add item to cart
 * @param {Object} product - Product object with id, name, price_cents
 * @param {number} quantity - Quantity to add
 */
export function addToCart(product, quantity = 1) {
  const cart = getCart()
  const existingItem = cart.find((item) => item.product_id === product.id)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      quantity: quantity,
    })
  }

  saveCart(cart)
  return cart
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID to remove
 */
export function removeFromCart(productId) {
  const cart = getCart()
  const updatedCart = cart.filter((item) => item.product_id !== productId)
  saveCart(updatedCart)
  return updatedCart
}

/**
 * Update item quantity in cart
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
export function updateCartItemQuantity(productId, quantity) {
  if (quantity <= 0) {
    return removeFromCart(productId)
  }

  const cart = getCart()
  const item = cart.find((item) => item.product_id === productId)
  
  if (item) {
    item.quantity = quantity
    saveCart(cart)
  }
  
  return cart
}

/**
 * Clear cart
 */
export function clearCart() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_STORAGE_KEY)
}

/**
 * Calculate cart total in cents
 * @param {Array} cart - Cart array
 * @returns {number} Total in cents
 */
export function calculateCartTotal(cart) {
  return cart.reduce((total, item) => {
    return total + item.price_cents * item.quantity
  }, 0)
}

/**
 * Get cart item count
 * @param {Array} cart - Cart array
 * @returns {number} Total item count
 */
export function getCartItemCount(cart) {
  return cart.reduce((count, item) => count + item.quantity, 0)
}




