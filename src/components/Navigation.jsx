'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const menuItems = [
  { label: 'Home', href: '#home' },
  { label: 'Order Food', href: '#order' },
  { label: 'Groceries', href: '#groceries' },
  { label: 'Promotions', href: '#promotions' },
  { label: 'Drinks', href: '#drinks' },
  { label: 'Contact', href: '#contact' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Hide navigation on admin routes
  if (pathname?.startsWith('/admin')) {
    return null
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href) => {
    setIsOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Desktop Navigation - Rounded Container */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex fixed top-4 left-0 right-0 z-50 px-4"
      >
        <div className={`w-full max-w-7xl mx-auto rounded-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/98 backdrop-blur-xl border border-gray-300/50 shadow-xl' 
            : 'bg-orange-400/95 backdrop-blur-lg border border-gray-200/40 shadow-lg'
        }`}>
          <div className="flex items-center justify-between px-6 py-4 lg:px-10 lg:py-5 xl:px-12">
            {/* Brand Name - Left Side */}
            <motion.a
              href="#home"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('#home')
              }}
              className="text-base lg:text-lg xl:text-xl font-black text-gray-900 hover:text-yellow-500 transition-colors duration-300 flex-shrink-0 mr-4"
              style={{
                fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
                letterSpacing: '0.02em',
                fontWeight: 900,
                textTransform: 'uppercase',
                fontStretch: 'condensed',
                lineHeight: '1.2',
              }}
              whileHover={{ scale: 1.02 }}
            >
              La Fromentine Resto-Epicerie Africaine
            </motion.a>
            
            {/* Navigation Links - Right Side */}
            <div className="flex items-center gap-4 lg:gap-6 xl:gap-8 flex-shrink-0">
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(item.href)
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="text-sm lg:text-base font-semibold text-gray-800 hover:text-yellow-500 transition-all duration-300 relative group"
                  whileHover={{ y: -1 }}
                >
                  {item.label}
                  <motion.span 
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation - Menu Button Only */}
      <motion.button
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 glass-button p-3 rounded-full !bg-orange-400 hover:!bg-orange-500 active:!bg-orange-500 text-black shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed inset-0 z-50 bg-gradient-to-br from-orange-400 via-orange-400 to-orange-500 flex flex-col"
            onClick={() => setIsOpen(false)}
          >
            {/* Close Button */}
            <div className="flex justify-end p-6" onClick={(e) => e.stopPropagation()}>
              <motion.button
                onClick={() => setIsOpen(false)}
                className="glass-button p-3 rounded-xl !bg-black hover:!bg-gray-800 text-white shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Menu Items */}
            <nav 
              className="flex-1 flex flex-col items-center justify-center gap-8 px-6"
              onClick={(e) => e.stopPropagation()}
            >
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(item.href)
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="text-4xl font-bold text-black hover:text-yellow-500 transition-colors w-full text-center py-4"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

