'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AdminOrders from '@/components/AdminOrders'
import AdminProducts from '@/components/AdminProducts'

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError(null)

    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setUser(data.user)
    } catch (error) {
      console.error('Login error:', error)
      setLoginError(error.message || 'Failed to login')
    } finally {
      setIsLoggingIn(false)
    }
  }

  async function handleLogout() {
    try {
      const supabase = createBrowserClient()
      await supabase.auth.signOut()
      setUser(null)
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-neutral-600 text-lg"
        >
          Loading...
        </motion.p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel max-w-md w-full"
        >
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-white mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 glass rounded-xl focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500"
                style={{ 
                  color: '#111827',
                  WebkitTextFillColor: '#111827',
                  caretColor: '#111827'
                }}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-white mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 glass rounded-xl focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500"
                style={{ 
                  color: '#111827',
                  WebkitTextFillColor: '#111827',
                  caretColor: '#111827',
                  fontSize: '16px',
                  letterSpacing: '2px'
                }}
              />
            </div>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong bg-red-500/20 border-red-500/50 text-red-700 px-4 py-3 rounded-xl font-medium"
              >
                {loginError}
              </motion.div>
            )}
            <motion.button
              type="submit"
              disabled={isLoggingIn}
              whileHover={{ scale: isLoggingIn ? 1 : 1.02 }}
              whileTap={{ scale: isLoggingIn ? 1 : 0.98 }}
              className="w-full glass-button bg-yellow-500 hover:bg-orange-400 active:bg-orange-400 text-white hover:text-black active:text-black py-4 text-lg font-bold disabled:opacity-50 transition-all duration-300"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>
          <p className="mt-6 text-sm text-white/80 text-center">
            Create an admin user via Supabase Auth dashboard
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="glass-dark py-4 mb-8">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80">{user.email}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="glass-button bg-yellow-500 hover:bg-orange-400 active:bg-orange-400 text-white hover:text-black active:text-black px-6 py-2 font-semibold transition-all duration-300"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'products'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            Products
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'orders' ? <AdminOrders /> : <AdminProducts />}
      </div>
    </div>
  )
}
