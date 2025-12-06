'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase'
import { X, MapPin, Phone, User, Calendar, Package, DollarSign } from 'lucide-react'

const STATUS_OPTIONS = [
  'RECEIVED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED',
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [updateError, setUpdateError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const channelRef = useRef(null)

  useEffect(() => {
    fetchOrders()
    setupRealtimeSubscription()

    return () => {
      // Cleanup realtime subscription
      if (channelRef.current) {
        const supabase = createBrowserClient()
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  async function fetchOrders() {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*, locations(name), order_items(*, products(name))')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrderDetails(orderId) {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*, locations(*), order_items(*, products(*))')
        .eq('id', orderId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching order details:', error)
      return null
    }
  }

  function setupRealtimeSubscription() {
    const supabase = createBrowserClient()

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('New order detected:', payload)
          // Fetch full order details with items
          const newOrder = await fetchOrderDetails(payload.new.id)
          if (newOrder) {
            // Add new order to the beginning of the list
            setOrders(prevOrders => [newOrder, ...prevOrders])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order updated via realtime:', payload)
          // Update order in list if it exists
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.id === payload.new.id
                ? { ...order, ...payload.new }
                : order
            )
          )
          // Update selected order if it's the one being updated
          setSelectedOrder(prevSelected => {
            if (prevSelected && prevSelected.id === payload.new.id) {
              return { ...prevSelected, ...payload.new }
            }
            return prevSelected
          })
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    channelRef.current = channel
  }

  async function handleOrderClick(order) {
    // Fetch full order details including location and product details
    const fullOrder = await fetchOrderDetails(order.id)
    if (fullOrder) {
      setSelectedOrder(fullOrder)
      setShowModal(true)
    } else {
      // Fallback to using the order we have
      setSelectedOrder(order)
      setShowModal(true)
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    // Store previous state for potential reversion
    const previousOrders = [...orders]
    const orderToUpdate = orders.find(o => o.id === orderId)
    const previousStatus = orderToUpdate?.status

    // Optimistic update: immediately update UI
    setOrders(orders.map(o => o.id === orderId ? {...o, status: newStatus} : o))
    setUpdateError(null)
    setUpdatingStatus(orderId)

    try {
      const supabase = createBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update order status')
      }

      // Success: keep optimistic update, optionally refresh to get server state
      const { order } = await response.json()
      setOrders(orders.map(o => o.id === orderId ? {...order, order_items: orderToUpdate.order_items} : o))
    } catch (error) {
      console.error('Error updating order status:', error)
      // Revert optimistic update on error
      setOrders(previousOrders)
      setUpdateError({
        orderId,
        message: error.message || 'Failed to update order status'
      })
      // Clear error after 5 seconds
      setTimeout(() => setUpdateError(null), 5000)
    } finally {
      setUpdatingStatus(null)
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function formatOrderType(type) {
    if (!type) return type
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
  }

  if (loading) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
            className="text-center text-gray-700 text-lg"
      >
        Loading...
      </motion.p>
    )
  }

  return (
    <div className="space-y-8">
      {/* Error Message */}
      <AnimatePresence>
        {updateError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-strong bg-red-500/20 border-red-500/50 text-red-200 px-4 py-3 rounded-xl font-medium"
          >
            {updateError.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleOrderClick(order)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {order.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    {order.order_items && order.order_items.length > 0 ? (
                      <span className="inline-block">
                        {order.order_items.map((item, idx) => (
                          <span key={item.id || idx}>
                            {item.products?.name || 'Unknown'} × {item.qty}
                            {idx < order.order_items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-gray-500">No items</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.locations?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatOrderType(order.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${(order.total_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'COMPLETED'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updatingStatus === order.id}
                      className="glass rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
                <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-900 hover:text-gray-700 transition-colors bg-gray-200 hover:bg-gray-300 p-2 rounded-lg"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Order Information */}
              <div className="space-y-6">
                {/* Order ID & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
                      Order ID
                    </label>
                    <p className="text-gray-900 font-mono text-sm">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
                      Status
                    </label>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedOrder.status === 'COMPLETED'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : selectedOrder.status === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Name</label>
                      <p className="text-gray-900">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone
                      </label>
                      <p className="text-gray-900">{selectedOrder.customer_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Delivery/Pickup Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Type & Location
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Type</label>
                      <p className="text-gray-900">{formatOrderType(selectedOrder.type)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Location
                      </label>
                      <p className="text-gray-900">{selectedOrder.locations?.name || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedOrder.type === 'delivery' && selectedOrder.customer_address && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </label>
                      <p className="text-gray-900">{selectedOrder.customer_address}</p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                      selectedOrder.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-lg p-4 flex justify-between items-center border border-gray-200"
                        >
                          <div className="flex-1">
                            <p className="text-gray-900 font-semibold">
                              {item.products?.name || 'Unknown Product'}
                            </p>
                            {item.products?.description && (
                              <p className="text-gray-600 text-sm mt-1">
                                {item.products.description}
                              </p>
                            )}
                            <p className="text-gray-500 text-sm mt-1">Quantity: {item.qty}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900 font-semibold">
                              ${((item.price_cents * item.qty) / 100).toFixed(2)}
                            </p>
                            <p className="text-gray-500 text-sm">
                              ${(item.price_cents / 100).toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No items found</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="text-gray-900">
                      ${(selectedOrder.total_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-900 font-bold text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Total
                    </span>
                    <span className="text-yellow-600 font-bold text-xl">
                      ${(selectedOrder.total_cents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order Date */}
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Order placed: {formatDate(selectedOrder.created_at)}</span>
                  {selectedOrder.updated_at !== selectedOrder.created_at && (
                    <span className="ml-4">
                      Last updated: {formatDate(selectedOrder.updated_at)}
                    </span>
                  )}
                </div>

                {/* Status Update (in modal) */}
                <div className="pt-4 border-t border-gray-300">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Update Status
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value
                      updateOrderStatus(selectedOrder.id, newStatus)
                      setSelectedOrder({ ...selectedOrder, status: newStatus })
                    }}
                    disabled={updatingStatus === selectedOrder.id}
                    className="w-full glass rounded-lg px-4 py-2 text-sm text-gray-900 font-medium focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
