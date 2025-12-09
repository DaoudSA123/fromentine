'use client'

import { useEffect } from 'react'
import Hero from '@/components/Hero'
import OrderSection from '@/components/OrderSection'
import GroceriesSection from '@/components/GroceriesSection'
import PromotionsSection from '@/components/PromotionsSection'
import VideoBanner from '@/components/VideoBanner'
import DrinksPromoSection from '@/components/DrinksPromoSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

export default function Home() {
  useEffect(() => {
    // Prevent scroll restoration and ensure page starts at the top
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    
    // Function to scroll to top - more aggressive for mobile
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      // Also try scrolling the window itself
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0)
      }
    }
    
    // Handle hash navigation - only scroll to hash if it exists and is not #home
    // Otherwise, ensure we start at the top
    const hash = window.location.hash
    if (hash && hash !== '#home') {
      // If there's a hash, wait for DOM to be ready then scroll to it
      // But only after ensuring we've scrolled to top first
      setTimeout(() => {
        const element = document.querySelector(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 300)
    } else {
      // No hash or hash is #home - ensure we're at the top
      // Clear hash if it's just #home to keep URL clean
      if (hash === '#home' && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
    
    // Immediately scroll to top on mount
    scrollToTop()
    
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      scrollToTop()
    })
    
    // Multiple attempts to scroll to top to catch any late scroll events
    // This is especially important on mobile where scroll restoration can be delayed
    const timeouts = [
      setTimeout(scrollToTop, 0),
      setTimeout(scrollToTop, 50),
      setTimeout(scrollToTop, 100),
      setTimeout(scrollToTop, 200),
      setTimeout(scrollToTop, 500),
    ]
    
    // Also listen for any scroll events and reset if needed
    let scrollCheckCount = 0
    const maxScrollChecks = 10
    const checkScroll = () => {
      if (window.scrollY > 0 && scrollCheckCount < maxScrollChecks) {
        scrollToTop()
        scrollCheckCount++
        setTimeout(checkScroll, 100)
      }
    }
    
    // Start checking scroll position after a brief delay
    const scrollCheckTimeout = setTimeout(checkScroll, 50)
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
      clearTimeout(scrollCheckTimeout)
    }
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Hero />
      <OrderSection />
      <GroceriesSection />
      <PromotionsSection />
      {/* Combined Video and Drinks Section - Side by side on desktop */}
      <section className="w-full relative bg-orange-400" style={{ minHeight: '600px' }}>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full" style={{ minHeight: '600px' }}>
          {/* Video Banner - First on mobile, Right side on desktop, Always visible */}
          <div className="w-full lg:w-1/2 flex items-center justify-center py-4 lg:py-6 xl:py-8 order-1 lg:order-2">
            <VideoBanner />
          </div>
          {/* Drinks Promotion - Second on mobile, Left side on desktop */}
          <div className="w-full lg:w-1/2 flex items-center justify-center py-8 lg:py-6 xl:py-8 order-2 lg:order-1">
            <DrinksPromoSection />
          </div>
        </div>
      </section>
      <ContactSection />
      <Footer />
    </main>
  )
}




