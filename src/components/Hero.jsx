'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function Hero() {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Force hardware acceleration on desktop browsers
    // This helps with performance on PC
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    
    // Optimize video settings for desktop
    video.playsInline = true

    // Ensure video plays and loops smoothly
    const ensurePlaying = () => {
      if (video.paused && !video.ended) {
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Retry if play fails
            setTimeout(() => video.play().catch(() => {}), 100)
          })
        }
      }
    }

    // Handle video errors
    const handleError = () => {
      console.warn('Video failed to load - using fallback background')
    }

    // Auto-resume if paused unexpectedly (but not on mobile to save battery)
    const handlePause = () => {
      if (!video.ended) {
        // Only auto-resume on desktop (not mobile to save battery)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        if (!isMobile) {
          setTimeout(ensurePlaying, 100)
        }
      }
    }

    // Handle video stalling (common on desktop browsers)
    const handleStalled = () => {
      if (!video.ended && video.paused) {
        video.play().catch(() => {})
      }
    }

    // Handle waiting (buffering) - reduce lag
    const handleWaiting = () => {
      // Video is buffering, ensure it continues when ready
      video.addEventListener('canplay', () => {
        if (video.paused) {
          video.play().catch(() => {})
        }
      }, { once: true })
    }

    video.addEventListener('error', handleError)
    video.addEventListener('pause', handlePause)
    video.addEventListener('stalled', handleStalled)
    video.addEventListener('waiting', handleWaiting)

    // Start playing when ready - use canplaythrough for better desktop performance
    if (video.readyState >= 3) {
      video.play().catch(() => {})
    } else {
      // Wait for enough data to play smoothly
      video.addEventListener('canplaythrough', () => {
        video.play().catch(() => {})
      }, { once: true })
      
      // Fallback to canplay if canplaythrough takes too long
      const canplayTimeout = setTimeout(() => {
        if (video.readyState >= 2) {
          video.play().catch(() => {})
        }
      }, 2000)
      
      video.addEventListener('canplay', () => {
        clearTimeout(canplayTimeout)
      }, { once: true })
    }

    return () => {
      video.removeEventListener('error', handleError)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('stalled', handleStalled)
      video.removeEventListener('waiting', handleWaiting)
    }
  }, [])

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video - Single video with native loop for best performance */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Fallback background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500" />
        
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          className="w-full h-full object-cover"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
            // Force hardware acceleration on desktop
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            willChange: 'transform',
            // Optimize for desktop rendering
            imageRendering: 'auto',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            perspective: '1000px'
          }}
        >
          {/* WebM first for better performance on desktop browsers */}
          <source src="/videos/bgVIDEO.webm" type="video/webm" />
          {/* MP4 fallback for Safari and older browsers - keep this file! */}
          <source src="/videos/bgVideo.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Dark overlay to darken the video */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      
      {/* Content */}
      <div className="container mx-auto px-6 md:px-8 pt-32 pb-20 text-center relative z-[2] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <img
            src="/images/logoHD.png"
            alt="Fromentine Logo"
            className="w-56 h-56 md:w-72 md:h-72 object-contain mx-auto drop-shadow-2xl"
            style={{
              mixBlendMode: 'screen',
              filter: 'brightness(1.2) contrast(1.1)'
            }}
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
            className="glass-button !bg-orange-400 hover:!bg-orange-500 active:!bg-orange-500 text-black font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-orange-400/30 transition-all duration-300"
            aria-label="Start ordering"
          >
            Order Now
          </motion.a>
          <motion.a
            href="#promotions"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="glass-button !bg-orange-400 hover:!bg-orange-500 active:!bg-orange-500 text-black font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-orange-400/30 transition-all duration-300"
            aria-label="View promotions"
          >
            View Promotions
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
