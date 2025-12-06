'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Order Food', href: '#order' },
    { label: 'Groceries', href: '#groceries' },
    { label: 'Promotions', href: '#promotions' },
    { label: 'Drinks', href: '#drinks' },
    { label: 'Contact', href: '#contact' },
  ]

  const handleLinkClick = (href) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="relative bg-black text-white">
      <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <h3 className="text-2xl font-bold mb-4 text-orange-400">La Fromentine</h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Épicerie et Restaurant - Authentic flavors and fresh groceries
            </p>
            <a
              href="https://fromentinejuice.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-sm font-medium"
            >
              Visit Our Drinks Site
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>Visit us at our locations</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>Call for orders</span>
              </li>
              <li>
                <button
                  onClick={() => {
                    const element = document.querySelector('#contact')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="flex items-center gap-3 text-gray-400 hover:text-orange-400 transition-colors text-sm"
                >
                  <Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <span>Contact Us</span>
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Hours/Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-white">About</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Serving authentic cuisine and fresh groceries. Order online for pickup or delivery.
            </p>
            <div className="text-gray-400 text-sm">
              <p className="font-medium text-white mb-1">Order Online</p>
              <p>Available for pickup and delivery</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-gray-800 pt-8 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} La Fromentine. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <button
                onClick={() => handleLinkClick('#contact')}
                className="hover:text-orange-400 transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => handleLinkClick('#contact')}
                className="hover:text-orange-400 transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

