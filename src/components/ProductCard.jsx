'use client'

import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'

export default function ProductCard({ product, onAddToCart }) {
  const priceDollars = (product.price_cents / 100).toFixed(2)

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
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-700 mb-5 flex-1 leading-relaxed">
            {product.description}
          </p>
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
            onClick={() => onAddToCart(product)}
            className="glass-button !bg-yellow-400 hover:!bg-yellow-500 active:!bg-yellow-500 text-black px-5 py-3 font-bold rounded-xl shadow-md shadow-yellow-400/30 transition-all duration-300 flex items-center gap-2 group/btn"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span>Add to Cart</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
