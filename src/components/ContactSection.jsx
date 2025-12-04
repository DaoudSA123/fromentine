'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit contact form')
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      console.error('Contact form error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="section-spacing relative bg-white bg-subtle-pattern">
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-5">
            <Mail className="w-8 h-8 text-orange-500 mr-1 md:mr-3" />
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 text-premium-title">
              Catering & Enquiries
            </h2>
          </div>
          <p className="text-lg md:text-xl text-gray-800 text-premium-subtitle">
            Contact us for catering services or any questions
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="glass-panel space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>Name</span>
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 glass rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none transition-all duration-300 text-base"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
                <span className="text-orange-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 glass rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none transition-all duration-300 text-base"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-4 glass rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none transition-all duration-300 text-base"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
                <span className="text-orange-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-5 py-4 glass rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none transition-all duration-300 resize-none text-base"
                placeholder="Tell us about your catering needs..."
              />
            </div>

            <AnimatePresence>
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-strong bg-green-50 border-2 border-green-200 text-green-800 px-5 py-4 rounded-xl font-medium flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Thank you! Your message has been sent successfully.</span>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-strong bg-red-50 border-2 border-red-200 text-red-800 px-5 py-4 rounded-xl font-medium flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Error submitting form. Please try again.</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02, y: -2 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="w-full glass-button !bg-yellow-400 hover:!bg-yellow-500 active:!bg-yellow-500 text-black py-4 text-lg font-bold rounded-xl shadow-md shadow-yellow-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
