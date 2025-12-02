'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-700 via-orange-900 to-yellow-700 opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/30 via-transparent to-orange-500/30" />
      {/* Glass overlay */}
      <div className="absolute inset-0 glass-dark opacity-20" />
      
      {/* Content */}
      <div className="container mx-auto px-6 md:px-8 py-20 text-center relative z-10 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <img
            src="/images/fromentineLogo.png"
            alt="Fromentine Logo"
            className="w-56 h-56 md:w-72 md:h-72 object-contain mx-auto drop-shadow-2xl"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-5 justify-center max-w-2xl mx-auto"
        >
          <motion.a
            href="#order"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-button !bg-yellow-400 hover:!bg-yellow-500 active:!bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-yellow-400/30 transition-all duration-300"
            aria-label="Start ordering"
          >
            Order Now
          </motion.a>
          <motion.a
            href="#promotions"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-button !bg-yellow-400 hover:!bg-yellow-500 active:!bg-yellow-500 text-black font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-yellow-400/30 transition-all duration-300"
            aria-label="View promotions"
          >
            View Promotions
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
