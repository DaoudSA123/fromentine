'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase'
import { Sparkles, Calendar } from 'lucide-react'

export default function PromotionsSection() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromotions()
  }, [])

  async function fetchPromotions() {
    try {
      const supabase = createBrowserClient()
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('starts_at', { ascending: false })

      if (error) throw error
      setPromotions(data || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <section id="promotions" className="section-spacing relative bg-white bg-subtle-pattern">
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 text-premium-title">
              Promotions & Events
            </h2>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-lg md:text-xl text-gray-800 text-premium-subtitle">
            Don't miss out on our special offers!
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-gray-800">Loading promotions...</p>
          </motion.div>
        ) : promotions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-lg text-gray-800">No active promotions at this time. Check back soon!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ y: -8 }}
                className="glass-panel overflow-hidden group"
              >
                {promo.image_url && (
                  <div className="w-full h-56 overflow-hidden rounded-2xl mb-5 relative">
                    <motion.img
                      src={promo.image_url}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 text-premium-title">
                    {promo.title}
                  </h3>
                  {promo.description && (
                    <p className="text-gray-800 mb-5 leading-relaxed">{promo.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-6 font-medium">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <p>
                      Valid: {formatDate(promo.starts_at)} - {formatDate(promo.ends_at)}
                    </p>
                  </div>
                  <motion.a
                    href="#order"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-button inline-block !bg-yellow-400 hover:!bg-yellow-500 active:!bg-yellow-500 text-black px-6 py-3 font-bold rounded-xl shadow-md shadow-yellow-400/30 transition-all duration-300"
                  >
                    Claim Offer
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
