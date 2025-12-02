'use client'

import { useState, useEffect } from 'react'
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
        <p className="text-gray-600">Loading order details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600">{error || 'Order not found'}</p>
      </div>
    )
  }

  const currentStatusIndex = getStatusIndex(order.status)
  const totalDollars = (order.total_cents / 100).toFixed(2)

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Order Tracking</h1>
        <p className="text-gray-600 mb-4">
          Order ID: <span className="font-mono font-semibold">{getOrderToken(order.id)}</span>
        </p>
        {realtimeConnected && (
          <p className="text-sm text-green-600 mb-4">✓ Live updates enabled</p>
        )}
      </div>

      {/* Status Stepper */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-black mb-6">Order Status</h2>
        <div className="space-y-4">
          {STATUS_STEPS.map((step, index) => {
            const stepIndex = STATUS_ORDER[step.key]
            const isActive = stepIndex <= currentStatusIndex
            const isCurrent = stepIndex === currentStatusIndex

            return (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isActive ? '✓' : index + 1}
                </div>
                <div className="ml-4 flex-1">
                  <p
                    className={`font-semibold ${
                      isCurrent ? 'text-orange-500' : isActive ? 'text-black' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && order.updated_at && (
                    <p className="text-sm text-gray-600">
                      Updated: {formatDate(order.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-black mb-4">Order Details</h2>
        <div className="space-y-2 mb-4">
          <p>
            <span className="font-semibold">Customer:</span> {order.customer_name}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {order.customer_phone}
          </p>
          <p>
            <span className="font-semibold">Type:</span>{' '}
            {order.type === 'pickup' ? 'Pickup' : 'Delivery'}
          </p>
          {order.customer_address && (
            <p>
              <span className="font-semibold">Address:</span> {order.customer_address}
            </p>
          )}
          {location && (
            <p>
              <span className="font-semibold">Location:</span> {location.name}
            </p>
          )}
          <p>
            <span className="font-semibold">Order Date:</span>{' '}
            {formatDate(order.created_at)}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-black mb-2">Items:</h3>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.products?.name || 'Product'} × {item.quantity}
                </span>
                <span className="font-semibold">
                  ${((item.price_cents * item.quantity) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-orange-500">${totalDollars}</span>
          </div>
        </div>
      </div>
    </div>
  )
}


