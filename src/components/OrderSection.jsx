'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
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
  const sectionRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center']
  })
  
  // Rotate image based on scroll - start at 0 (straight) and rotate as you scroll
  const topRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 180, 360])

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
    <section 
      id="order" 
      ref={sectionRef} 
      className="section-spacing relative bg-white bg-subtle-pattern"
      style={{ paddingTop: '2rem', paddingBottom: '6rem' }}
    >
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        {/* Top rotating image */}
        <div className="flex justify-center mb-6">
          <motion.div
            style={{ rotate: topRotate }}
            className="w-80 h-80 md:w-[384px] md:h-[384px] lg:w-[500px] lg:h-[500px] flex-shrink-0"
          >
            <img
              src="/images/rotatingBowl.png"
              alt="Food decoration"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </motion.div>
        </div>
        
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center mb-16"
        >
          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl md:text-6xl lg:text-7xl font-bold text-gray-900 text-premium-title text-center"
          >
            Order Food
          </motion.h2>
        </motion.div>

        {/* Location Selector */}
        <div className="max-w-4xl mx-auto mb-16">
          <LocationSelector
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-gray-700">Loading menu...</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Video Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full mb-20 rounded-2xl overflow-hidden shadow-lg flex gap-2"
          style={{ height: '250px' }}
        >
          {/* First Video */}
          <div className="flex-1 h-full overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/images/videos/MVI_5110.MOV" type="video/quicktime" />
              <source src="/images/videos/MVI_5110.MOV" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Second Video */}
          <div className="flex-1 h-full overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/images/videos/MVI_5112.MOV" type="video/quicktime" />
              <source src="/images/videos/MVI_5112.MOV" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>

        {/* Cart */}
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
