'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'

export default function ProductCard({ product, onAddToCart, sizeOptions = null, baseProductName = null }) {
  const [selectedSize, setSelectedSize] = useState(null)
  
  // If this product has size options, use the selected size's price, otherwise use product price
  const displayProduct = selectedSize && sizeOptions ? sizeOptions.find(s => s.id === selectedSize) : product
  const priceDollars = ((displayProduct?.price_cents || product.price_cents) / 100).toFixed(2)
  
  const hasSizes = sizeOptions && sizeOptions.length > 0

  const handleAddToCartClick = () => {
    const productToAdd = selectedSize && sizeOptions 
      ? sizeOptions.find(s => s.id === selectedSize)
      : product
    onAddToCart(productToAdd)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="glass-panel overflow-hidden h-full flex flex-col group"
    >
      {product.image_url && (
        <div className="w-full h-56 overflow-hidden rounded-2xl mb-5 relative">
          <motion.img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-premium-title">
          {baseProductName || product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-700 mb-3 flex-1 leading-relaxed">
            {product.description}
          </p>
        )}
        
        {/* Size Selection */}
        {hasSizes && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Size:</p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((sizeOption) => (
                <button
                  key={sizeOption.id}
                  onClick={() => setSelectedSize(sizeOption.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    selectedSize === sizeOption.id
                      ? 'bg-orange-400 text-gray-900 shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sizeOption.size || sizeOption.name.split(' ').pop()}
                  <span className="ml-2 text-xs">
                    (${((sizeOption.price_cents || 0) / 100).toFixed(2)})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
          <div>
            <span className="text-3xl font-bold text-gray-900">
              ${priceDollars}
            </span>
            {product.inventory_count !== undefined && (
              <p className="text-xs text-gray-600 mt-1 font-medium">
                {product.inventory_count > 0
                  ? `${product.inventory_count} in stock`
                  : 'Out of stock'}
              </p>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCartClick}
            disabled={hasSizes && !selectedSize}
            className={`glass-button !bg-orange-400 hover:!bg-orange-500 active:!bg-orange-500 text-black px-5 py-3 font-bold rounded-xl shadow-md shadow-orange-400/30 transition-all duration-300 flex items-center gap-2 group/btn ${
              hasSizes && !selectedSize ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={`Add ${baseProductName || product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span>Add to Cart</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
