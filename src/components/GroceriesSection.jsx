'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase'
import { getCart, addToCart } from '@/lib/cart'
import ProductCard from './ProductCard'

export default function GroceriesSection() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCart(getCart())
    fetchGroceries()
  }, [])

  async function fetchGroceries() {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'groceries')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching groceries:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleAddToCart(product) {
    const updatedCart = addToCart(product, 1)
    setCart(updatedCart)
  }

  return (
    <section id="groceries" className="section-spacing relative bg-orange-400">
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-5 text-gray-900 text-premium-title">
            Groceries
          </h2>
          <p className="text-lg md:text-xl text-gray-900 max-w-2xl mx-auto text-premium-subtitle">
            Add groceries to your cart and checkout with your food order
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-gray-900">Loading groceries...</p>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-gray-900">No groceries available at this time.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      </div>
    </section>
  )
}
