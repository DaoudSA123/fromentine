'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase'

const STATUS_STEPS = [
  { key: 'RECEIVED', label: 'Order Received' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'COMPLETED', label: 'Completed' },
]

const STATUS_ORDER = {
  RECEIVED: 0,
  PREPARING: 1,
  READY: 2,
  OUT_FOR_DELIVERY: 3,
  COMPLETED: 4,
  CANCELLED: -1,
}

export default function TrackOrder({ orderId }) {
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [realtimeConnected, setRealtimeConnected] = useState(false)

  useEffect(() => {
    if (!orderId) return

    fetchOrder()
    setupRealtimeSubscription()

    // Fallback polling every 10 seconds
    const pollInterval = setInterval(() => {
      if (!realtimeConnected) {
        fetchOrder()
      }
    }, 10000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [orderId])

  async function fetchOrder() {
    try {
      const supabase = createBrowserClient()
      
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      if (!orderData) {
        setError('Order not found')
        setLoading(false)
        return
      }

      setOrder(orderData)

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products(*)')
        .eq('order_id', orderId)

      if (itemsError) throw itemsError
      setOrderItems(itemsData || [])

      // Fetch location
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .eq('id', orderData.location_id)
        .single()

      if (locationError) throw locationError
      setLocation(locationData)

      setError(null)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  function setupRealtimeSubscription() {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order updated via realtime:', payload)
          setOrder(payload.new)
          setRealtimeConnected(true)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true)
        } else if (status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }

  function getStatusIndex(status) {
    return STATUS_ORDER[status] ?? 0
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function getOrderToken(orderId) {
    return orderId.substring(0, 8).toUpperCase()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
            className="text-gray-700 text-lg"
        >
          Loading order details...
        </motion.p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-lg font-medium"
        >
          {error || 'Order not found'}
        </motion.p>
      </div>
    )
  }

  const currentStatusIndex = getStatusIndex(order.status)
  const totalDollars = (order.total_cents / 100).toFixed(2)

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Order Tracking</h1>
        <p className="text-gray-700 mb-3">
          Order ID: <span className="font-mono font-semibold text-gray-800">{getOrderToken(order.id)}</span>
        </p>
        <AnimatePresence>
          {realtimeConnected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-green-600 font-medium"
            >
              ✓ Live updates enabled
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Status</h2>
        <div className="space-y-4">
          {STATUS_STEPS.map((step, index) => {
            const stepIndex = STATUS_ORDER[step.key]
            const isActive = stepIndex <= currentStatusIndex
            const isCurrent = stepIndex === currentStatusIndex

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center"
              >
                <motion.div
                  animate={{
                    scale: isCurrent ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    isActive
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
                      : 'glass text-gray-600'
                  }`}
                >
                  {isActive ? '✓' : index + 1}
                </motion.div>
                <div className="ml-4 flex-1">
                  <p
                    className={`font-semibold text-lg ${
                      isCurrent
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent'
                        : isActive
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && order.updated_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      Updated: {formatDate(order.updated_at)}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h2>
        <div className="space-y-3 mb-6">
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Customer:</span> {order.customer_name}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Phone:</span> {order.customer_phone}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Type:</span>{' '}
            {order.type === 'pickup' ? 'Pickup' : 'Delivery'}
          </p>
          {order.customer_address && (
            <p className="text-gray-700">
              <span className="font-semibold text-gray-800">Address:</span> {order.customer_address}
            </p>
          )}
          {location && (
            <p className="text-gray-700">
              <span className="font-semibold text-gray-800">Location:</span> {location.name}
            </p>
          )}
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Order Date:</span>{' '}
            {formatDate(order.created_at)}
          </p>
        </div>

        <div className="border-t border-gray-300 pt-6">
          <h3 className="font-semibold text-gray-800 mb-4 text-lg">Items:</h3>
          <div className="space-y-2 mb-6">
            {orderItems.map((item) => {
              const quantity = item.qty || item.quantity || 0
              const priceCents = item.price_cents || 0
              const itemTotal = (priceCents * quantity) / 100
              
              return (
                <div key={item.id} className="flex justify-between glass rounded-xl p-3">
                  <span className="text-gray-700">
                    {item.products?.name || 'Product'} × {quantity}
                  </span>
                  <span className="font-semibold text-gray-800">
                    ${itemTotal.toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="border-t border-gray-300 pt-4 flex justify-between text-2xl font-bold">
            <span className="text-gray-800">Total:</span>
            <span className="text-yellow-500 font-bold">
              ${totalDollars}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
