'use client'

import { motion } from 'framer-motion'

export default function VideoBanner() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-6 lg:p-8" style={{ position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full flex items-center justify-center"
      >
        <img
          src="/images/bissap.webp"
          alt="Bissap drink"
          className="rounded-2xl shadow-2xl"
          style={{
            maxWidth: '85%',
            maxHeight: '85%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'center',
            imageRendering: 'high-quality',
            WebkitImageRendering: 'high-quality',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
          onError={(e) => {
            console.error('Image failed to load:', e.target.src)
          }}
        />
      </motion.div>
    </div>
  )
}

