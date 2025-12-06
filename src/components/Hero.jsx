'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function Hero() {
  const video1Ref = useRef(null)
  const video2Ref = useRef(null)
  const activeVideoRef = useRef(1)
  const loopCountRef = useRef(0)

  useEffect(() => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current
    if (!video1 || !video2) return

    let isTransitioning = false
    let lastCheckTime = 0
    const CHECK_INTERVAL = 100 // Check every 100ms instead of every frame

    const switchVideos = () => {
      if (isTransitioning) return
      isTransitioning = true

      const currentVideo = activeVideoRef.current === 1 ? video1 : video2
      const nextVideo = activeVideoRef.current === 1 ? video2 : video1

      // Reset and prepare next video
      nextVideo.currentTime = 0
      nextVideo.style.opacity = '0'
      
      // Start next video
      nextVideo.play().catch(() => {})

      // Crossfade transition
      const fadeDuration = 200 // 200ms crossfade
      const startTime = Date.now()
      
      const fade = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / fadeDuration, 1)
        
        currentVideo.style.opacity = String(1 - progress)
        nextVideo.style.opacity = String(progress)

        if (progress < 1) {
          requestAnimationFrame(fade)
        } else {
          // Transition complete
          currentVideo.pause()
          currentVideo.currentTime = 0
          activeVideoRef.current = activeVideoRef.current === 1 ? 2 : 1
          isTransitioning = false
          loopCountRef.current++
        }
      }

      requestAnimationFrame(fade)
    }

    const checkVideoProgress = () => {
      const now = Date.now()
      if (now - lastCheckTime < CHECK_INTERVAL) return
      lastCheckTime = now

      const currentVideo = activeVideoRef.current === 1 ? video1 : video2
      if (currentVideo.duration && currentVideo.currentTime >= currentVideo.duration - 0.5) {
        switchVideos()
      }
    }

    const handleTimeUpdate1 = () => {
      if (activeVideoRef.current === 1) checkVideoProgress()
    }

    const handleTimeUpdate2 = () => {
      if (activeVideoRef.current === 2) checkVideoProgress()
    }

    // Start first video
    const startVideo1 = () => {
      if (video1.readyState >= 2) {
        video1.play().catch(() => {})
        video1.style.opacity = '1'
      }
    }

    // Load both videos
    if (video1.readyState >= 2) {
      startVideo1()
    } else {
      video1.addEventListener('loadeddata', startVideo1, { once: true })
    }

    video1.addEventListener('timeupdate', handleTimeUpdate1)
    video2.addEventListener('timeupdate', handleTimeUpdate2)

    return () => {
      video1.removeEventListener('timeupdate', handleTimeUpdate1)
      video2.removeEventListener('timeupdate', handleTimeUpdate2)
      video1.removeEventListener('loadeddata', startVideo1)
    }
  }, [])

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video - Dual video setup for seamless looping */}
      <div className="absolute inset-0 w-full h-full z-0" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        <video
          ref={video1Ref}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          className="w-full h-full object-cover"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none',
            transform: 'translateZ(0)',
            willChange: 'auto',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            opacity: 1,
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          <source src="/videos/bgVideo.mov" type="video/quicktime" />
          <source src="/videos/bgVideo.mov" type="video/mp4" />
        </video>
        <video
          ref={video2Ref}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          className="w-full h-full object-cover"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none',
            transform: 'translateZ(0)',
            willChange: 'auto',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          <source src="/videos/bgVideo.mov" type="video/quicktime" />
          <source src="/videos/bgVideo.mov" type="video/mp4" />
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
