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
    
    // Function to scroll to top
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    
    // Immediately scroll to top on mount
    scrollToTop()
    
    // Also scroll to top after a small delay to catch any late scroll events
    const timeoutId = setTimeout(scrollToTop, 50)
    
    // Handle hash navigation only if hash exists (for direct links)
    const hash = window.location.hash
    if (hash && hash !== '#home') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.querySelector(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
    }
    
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Hero />
      <OrderSection />
      <GroceriesSection />
      <PromotionsSection />
      {/* Combined Video and Drinks Section - Side by side on desktop */}
      <section className="w-full relative bg-yellow-400" style={{ minHeight: '500px' }}>
        <div className="flex flex-col lg:flex-row xl:flex-col gap-4 lg:gap-6" style={{ minHeight: '500px', height: '100%' }}>
          {/* Video Banner - First on mobile, Right side on desktop, Hidden on xl+ */}
          <div className="w-full lg:w-1/2 xl:hidden flex items-center justify-center py-4 lg:py-6 order-1 lg:order-2" style={{ minHeight: '400px' }}>
            <VideoBanner />
          </div>
          {/* Drinks Promotion - Second on mobile, Left side on desktop, Full width on xl+ */}
          <div className="w-full lg:w-1/2 xl:w-full flex items-center justify-center py-8 lg:py-6 order-2 lg:order-1">
            <DrinksPromoSection />
          </div>
        </div>
      </section>
      <ContactSection />
      <Footer />
    </main>
  )
}




