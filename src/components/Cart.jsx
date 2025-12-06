'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Plus, Minus, User, Phone, MapPin, CreditCard } from 'lucide-react'
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  calculateCartTotal,
  getCartItemCount,
} from '@/lib/cart'
import AddressAutocomplete from './AddressAutocomplete'

export default function Cart({ cart, onCartUpdate, onCheckout }) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [orderType, setOrderType] = useState('pickup')
  const [customerAddress, setCustomerAddress] = useState('')
  const [addressData, setAddressData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalCents = calculateCartTotal(cart)
  const totalDollars = (totalCents / 100).toFixed(2)
  const itemCount = getCartItemCount(cart)

  function handleRemoveItem(productId) {
    removeFromCart(productId)
    onCartUpdate(getCart())
  }

  function handleQuantityChange(productId, newQuantity) {
    updateCartItemQuantity(productId, parseInt(newQuantity))
    onCartUpdate(getCart())
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }

    if (!customerName || !customerPhone) {
      alert('Please fill in all required fields')
      return
    }

    if (orderType === 'delivery' && !customerAddress) {
      alert('Please provide a delivery address')
      return
    }

    setIsSubmitting(true)

    try {
      await onCheckout({
        customerName,
        customerPhone,
        customerAddress: orderType === 'delivery' ? customerAddress : null,
        addressData: orderType === 'delivery' ? addressData : null,
        orderType,
        items: cart,
        totalCents,
      })
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error placing order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel text-center py-12"
      >
        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Cart</h2>
        <p className="text-gray-700">Your cart is empty</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel"
    >
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-6 h-6 text-yellow-500" />
        <h2 className="text-3xl font-bold text-gray-900 text-premium-title">
          Your Cart
        </h2>
        <span className="text-lg text-gray-600 font-medium">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
      </div>

      <div className="space-y-4 mb-8">
        <AnimatePresence>
          {cart.map((item) => (
            <motion.div
              key={item.product_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between glass rounded-xl p-4 group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-lg mb-1">
                  {item.name}
                  {item.size && (
                    <span className="text-sm text-gray-600 ml-2">({item.size})</span>
                  )}
                </p>
                <p className="text-sm text-gray-700">
                  ${((item.price_cents * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 glass rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(item.product_id, Math.max(1, item.quantity - 1))}
                    className="p-1 text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.product_id, Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-12 px-2 py-1 glass rounded text-center font-semibold text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:outline-none text-sm"
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                    className="p-1 text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveItem(item.product_id)}
                  className="text-red-500 hover:text-red-600 font-bold text-xl w-8 h-8 flex items-center justify-center transition-colors"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mb-8 p-6 glass-strong rounded-2xl border-2 border-yellow-200">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-900">Total:</span>
          <span className="text-3xl font-bold text-yellow-500">
            ${totalDollars}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customer-name" className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Name</span>
            <span className="text-yellow-500">*</span>
          </label>
          <input
            type="text"
            id="customer-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="w-full px-5 py-4 glass rounded-xl text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none transition-all duration-300 text-base"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="customer-phone" className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Phone</span>
            <span className="text-yellow-500">*</span>
          </label>
          <input
            type="tel"
            id="customer-phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            className="w-full px-5 py-4 glass rounded-xl text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none transition-all duration-300 text-base"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Order Type</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                value="pickup"
                checked={orderType === 'pickup'}
                onChange={(e) => setOrderType(e.target.value)}
                className="mr-3 w-5 h-5 accent-yellow-500 cursor-pointer"
              />
              <span className="text-gray-900 font-medium group-hover:text-yellow-500 transition-colors">Pickup</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                value="delivery"
                checked={orderType === 'delivery'}
                onChange={(e) => setOrderType(e.target.value)}
                className="mr-3 w-5 h-5 accent-yellow-500 cursor-pointer"
              />
              <span className="text-gray-900 font-medium group-hover:text-yellow-500 transition-colors">Delivery</span>
            </label>
          </div>
        </div>

        <AnimatePresence>
          {orderType === 'delivery' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="customer-address" className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Delivery Address</span>
                <span className="text-yellow-500">*</span>
              </label>
              <AddressAutocomplete
                id="customer-address"
                value={customerAddress}
                onChange={(value) => {
                  setCustomerAddress(value)
                  // Clear address data if user manually edits
                  if (!value) {
                    setAddressData(null)
                  }
                }}
                onAddressSelect={(data) => {
                  setAddressData(data)
                  if (data?.formatted_address) {
                    setCustomerAddress(data.formatted_address)
                  }
                }}
                required={orderType === 'delivery'}
                placeholder="Start typing your address..."
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02, y: -2 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full glass-button !bg-orange-400 hover:!bg-orange-500 active:!bg-orange-500 text-black py-5 text-lg font-bold rounded-xl shadow-lg shadow-orange-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Place Order</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
