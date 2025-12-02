'use client'

import { motion } from 'framer-motion'
import { GlassWater, ArrowRight } from 'lucide-react'

export default function DrinksPromoSection() {
  // TODO: Update this URL with the actual drinks website URL
  const DRINKS_URL = 'https://drinks.example.com'

  return (
    <section id="drinks" className="section-spacing relative bg-yellow-400">
      <div className="container mx-auto px-6 md:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <GlassWater className="w-16 h-16 text-orange-500 mx-auto" />
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-5 text-gray-900 text-premium-title">
            Special Drinks Promotion
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-gray-900 text-premium-subtitle leading-relaxed">
            Check out our exclusive drinks selection and special offers!
          </p>
          
          <motion.a
            href={DRINKS_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="glass-button inline-block !bg-yellow-400 hover:!bg-yellow-500 active:!bg-yellow-500 text-black px-10 py-5 text-lg font-bold rounded-xl shadow-lg shadow-yellow-400/30 transition-all duration-300 flex items-center gap-3 mx-auto"
            aria-label="Visit drinks promotion website"
          >
            <span>View Drinks Menu</span>
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
