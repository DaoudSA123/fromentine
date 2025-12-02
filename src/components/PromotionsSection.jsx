'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'

export default function PromotionsSection() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromotions()
  }, [])

  async function fetchPromotions() {
    try {
      const supabase = createBrowserClient()
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('starts_at', { ascending: false })

      if (error) throw error
      setPromotions(data || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <section id="promotions" className="py-16 bg-yellow-400">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-black mb-4 text-center">
          Promotions & Events
        </h2>
        <p className="text-center text-black mb-12 opacity-80">
          Don't miss out on our special offers!
        </p>

        {loading ? (
          <p className="text-center text-black">Loading promotions...</p>
        ) : promotions.length === 0 ? (
          <p className="text-center text-black">
            No active promotions at this time. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-lg overflow-hidden shadow-lg"
              >
                {promo.image_url && (
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-black mb-2">
                    {promo.title}
                  </h3>
                  {promo.description && (
                    <p className="text-gray-700 mb-4">{promo.description}</p>
                  )}
                  <div className="text-sm text-gray-600 mb-4">
                    <p>
                      Valid: {formatDate(promo.starts_at)} -{' '}
                      {formatDate(promo.ends_at)}
                    </p>
                  </div>
                  <a
                    href="#order"
                    className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Claim Offer
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}


