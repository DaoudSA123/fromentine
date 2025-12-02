'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import { getCart, addToCart, saveCart } from '@/lib/cart'
import LocationSelector from './LocationSelector'
import ProductCard from './ProductCard'
import Cart from './Cart'
import { useRouter } from 'next/navigation'

export default function OrderSection() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load cart from localStorage
    setCart(getCart())
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'food')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleAddToCart(product) {
    const updatedCart = addToCart(product, 1)
    setCart(updatedCart)
  }

  function handleCartUpdate(updatedCart) {
    setCart(updatedCart)
  }

  async function handleCheckout(orderData) {
    if (!selectedLocation) {
      alert('Please select a location')
      return
    }

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          locationId: selectedLocation.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create order')
      }

      const { orderId } = await response.json()

      // Clear cart
      localStorage.removeItem('fromentine_cart')
      setCart([])

      // Redirect to tracking page
      router.push(`/track/${orderId}`)
    } catch (error) {
      console.error('Checkout error:', error)
      throw error
    }
  }

  return (
    <section id="order" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-black mb-8 text-center">
          Order Food
        </h2>

        <div className="max-w-4xl mx-auto mb-8">
          <LocationSelector
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading menu...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          <Cart
            cart={cart}
            onCartUpdate={handleCartUpdate}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </section>
  )
}


