'use client'

import { useState, useEffect } from 'react'
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
    <section id="groceries" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-black mb-4 text-center">
          Groceries
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Add groceries to your cart and checkout with your food order
        </p>

        {loading ? (
          <p className="text-center text-gray-600">Loading groceries...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-600">No groceries available at this time.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}


