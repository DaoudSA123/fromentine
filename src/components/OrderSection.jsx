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
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const sectionRef = useRef(null)
  const video1Ref = useRef(null)
  const video2Ref = useRef(null)
  
  const ITEMS_PER_PAGE = 6
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center']
  })
  
  // Rotate image based on scroll - start at 0 (straight) and rotate as you scroll
  const topRotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 180, 360])

  useEffect(() => {
    // Load cart from localStorage
    setCart(getCart())
    fetchAllProducts()
  }, [])

  useEffect(() => {
    // Ensure videos loop seamlessly
    const video1 = video1Ref.current
    const video2 = video2Ref.current

    const handleEnded1 = () => {
      if (video1) {
        video1.currentTime = 0
      }
    }

    const handleEnded2 = () => {
      if (video2) {
        video2.currentTime = 0
      }
    }

    if (video1) {
      video1.addEventListener('ended', handleEnded1)
    }
    if (video2) {
      video2.addEventListener('ended', handleEnded2)
    }

    return () => {
      if (video1) {
        video1.removeEventListener('ended', handleEnded1)
      }
      if (video2) {
        video2.removeEventListener('ended', handleEnded2)
      }
    }
  }, [])

  // Group products by base name to detect sizes
  function groupProductsBySize(productsList) {
    const grouped = {}
    const sizeKeywords = ['Petit', 'Moyen', 'Grand', 'Small', 'Medium', 'Large']
    
    productsList.forEach(product => {
      // Check if product has a size field
      if (product.size) {
        const baseName = product.name.replace(/\s+(Petit|Moyen|Grand|Small|Medium|Large).*$/i, '').trim()
        if (!grouped[baseName]) {
          grouped[baseName] = {
            baseName: baseName,
            sizes: [],
            baseProduct: product
          }
        }
        grouped[baseName].sizes.push({
          id: product.id,
          size: product.size,
          name: product.name,
          price_cents: product.price_cents,
          ...product
        })
      } else {
        // Try to detect sizes from product name
        const hasSizeKeyword = sizeKeywords.some(keyword => 
          product.name.includes(keyword)
        )
        
        if (hasSizeKeyword) {
          // Extract base name (remove size keywords)
          const baseName = product.name
            .replace(/\s+(Petit|Moyen|Grand|Small|Medium|Large).*$/i, '')
            .trim()
          
          if (!grouped[baseName]) {
            grouped[baseName] = {
              baseName: baseName,
              sizes: [],
              baseProduct: product
            }
          }
          
          // Extract size from name
          const sizeMatch = product.name.match(/(Petit|Moyen|Grand|Small|Medium|Large)/i)
          const size = sizeMatch ? sizeMatch[1] : null
          
          grouped[baseName].sizes.push({
            id: product.id,
            size: size,
            name: product.name,
            price_cents: product.price_cents,
            ...product
          })
        } else {
          // Product without sizes - use as-is
          grouped[product.id] = {
            baseName: product.name,
            sizes: null,
            baseProduct: product
          }
        }
      }
    })
    
    return Object.values(grouped)
  }

  useEffect(() => {
    // Filter products by selected category
    if (selectedCategory && allProducts.length > 0) {
      const filtered = allProducts.filter(p => p.category === selectedCategory)
      setProducts(filtered)
      // Reset show all when category changes
      setShowAllProducts(false)
    }
  }, [selectedCategory, allProducts])

  async function fetchAllProducts() {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      const productsData = data || []
      setAllProducts(productsData)
      
      // Extract unique categories from products
      const uniqueCategories = [...new Set(productsData.map(p => p.category))]
        .filter(Boolean)
        .sort()
        .map(cat => ({ id: cat, label: cat }))
      
      setCategories(uniqueCategories)
      
      // Set first category as default if none selected
      if (uniqueCategories.length > 0 && !selectedCategory) {
        const firstCategory = uniqueCategories[0].id
        setSelectedCategory(firstCategory)
        // Set initial filtered products
        const initialFiltered = productsData.filter(p => p.category === firstCategory)
        setProducts(initialFiltered)
      }
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
      style={{ paddingTop: '2rem', paddingBottom: '6rem', position: 'relative' }}
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
            Order Now!
          </motion.h2>
        </motion.div>

        {/* Location Selector */}
        <div className="max-w-4xl mx-auto mb-12">
          <LocationSelector
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
          />
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-12"
          >
            <div className="inline-flex bg-gray-100 rounded-xl p-2 gap-2 shadow-lg flex-wrap justify-center max-w-5xl">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-lg transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-yellow-400 text-gray-900 shadow-md scale-105'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-gray-700">Loading menu...</p>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-gray-700">
              No {categories.find(c => c.id === selectedCategory)?.label || 'items'} available at this time.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {groupProductsBySize(products)
                .slice(0, showAllProducts ? products.length : ITEMS_PER_PAGE)
                .map((productGroup, index) => (
                  <motion.div
                    key={productGroup.baseProduct.id}
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
                      product={productGroup.baseProduct}
                      baseProductName={productGroup.baseName}
                      sizeOptions={productGroup.sizes}
                      onAddToCart={handleAddToCart}
                    />
                  </motion.div>
                ))}
            </div>
            
            {/* See More Button */}
            {groupProductsBySize(products).length > ITEMS_PER_PAGE && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mb-20"
              >
                <motion.button
                  onClick={() => setShowAllProducts(!showAllProducts)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-button !bg-yellow-400 hover:!bg-yellow-500 active:!bg-yellow-500 text-black px-8 py-3 font-bold rounded-xl shadow-md shadow-yellow-400/30 transition-all duration-300"
                >
                  {showAllProducts ? 'Show Less' : 'See More'}
                </motion.button>
              </motion.div>
            )}
          </>
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
              ref={video1Ref}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src="/videos/MVI_5110.mov" type="video/quicktime" />
              <source src="/videos/MVI_5110.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Second Video */}
          <div className="flex-1 h-full overflow-hidden">
            <video
              ref={video2Ref}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src="/videos/MVI_5112.mov" type="video/quicktime" />
              <source src="/videos/MVI_5112.mov" type="video/mp4" />
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
