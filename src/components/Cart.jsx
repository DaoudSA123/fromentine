'use client'

import { useState } from 'react'
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  calculateCartTotal,
  getCartItemCount,
} from '@/lib/cart'

export default function Cart({ cart, onCartUpdate, onCheckout }) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [orderType, setOrderType] = useState('pickup')
  const [customerAddress, setCustomerAddress] = useState('')
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
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-black mb-4">Your Cart</h2>
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-black mb-4">Your Cart ({itemCount} items)</h2>

      <div className="space-y-3 mb-6">
        {cart.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center justify-between border-b border-gray-200 pb-3"
          >
            <div className="flex-1">
              <p className="font-semibold text-black">{item.name}</p>
              <p className="text-sm text-gray-600">
                ${((item.price_cents * item.quantity) / 100).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(item.product_id, e.target.value)
                }
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                aria-label={`Quantity for ${item.name}`}
              />
              <button
                onClick={() => handleRemoveItem(item.product_id)}
                className="text-red-500 hover:text-red-700"
                aria-label={`Remove ${item.name} from cart`}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center text-xl font-bold text-black mb-4">
          <span>Total:</span>
          <span className="text-orange-500">${totalDollars}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="customer-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            type="tel"
            id="customer-phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Type *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="pickup"
                checked={orderType === 'pickup'}
                onChange={(e) => setOrderType(e.target.value)}
                className="mr-2"
              />
              Pickup
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="delivery"
                checked={orderType === 'delivery'}
                onChange={(e) => setOrderType(e.target.value)}
                className="mr-2"
              />
              Delivery
            </label>
          </div>
        </div>

        {orderType === 'delivery' && (
          <div>
            <label htmlFor="customer-address" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address *
            </label>
            <textarea
              id="customer-address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              required={orderType === 'delivery'}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  )
}


