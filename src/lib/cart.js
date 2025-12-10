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
 * Check if a product is out of stock
 * @param {Object} product - Product object with inventory_count
 * @returns {boolean} True if out of stock
 */
function isOutOfStock(product) {
  // null/undefined = in stock (no tracking), 0 = out of stock, > 0 = in stock
  if (product.inventory_count === null || product.inventory_count === undefined) {
    return false // null means in stock (no tracking)
  }
  return product.inventory_count === 0
}

/**
 * Add item to cart
 * @param {Object} product - Product object with id, name, price_cents, inventory_count
 * @param {number} quantity - Quantity to add
 * @returns {Array} Updated cart array, or original cart if product is out of stock
 */
export function addToCart(product, quantity = 1) {
  // Prevent adding out of stock items
  if (isOutOfStock(product)) {
    console.warn('Cannot add out of stock product to cart:', product.name)
    return getCart() // Return current cart without changes
  }

  const cart = getCart()
  // Create a unique key that includes product ID and size (if applicable)
  const itemKey = product.size ? `${product.id}_${product.size}` : product.id
  const existingItem = cart.find((item) => {
    const itemKeyToCheck = item.size ? `${item.product_id}_${item.size}` : item.product_id
    return itemKeyToCheck === itemKey
  })

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      quantity: quantity,
      size: product.size || null,
    })
  }

  saveCart(cart)
  return cart
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID to remove
 * @param {string} size - Optional size to match
 */
export function removeFromCart(productId, size = null) {
  const cart = getCart()
  const updatedCart = cart.filter((item) => {
    if (size !== null) {
      return !(item.product_id === productId && item.size === size)
    }
    return item.product_id !== productId
  })
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






