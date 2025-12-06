'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Phone, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase'
import { getCurrentLocation, findNearestLocation } from '@/lib/geolocation'

export default function LocationSelector({ selectedLocation, onLocationChange }) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [geolocationError, setGeolocationError] = useState(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      autoSelectLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations])

  async function fetchLocations() {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name')

      if (error) throw error
      setLocations(data || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function autoSelectLocation() {
    try {
      const userLocation = await getCurrentLocation()
      const nearest = findNearestLocation(
        userLocation.lat,
        userLocation.lng,
        locations
      )

      if (nearest) {
        onLocationChange(nearest)
      }
    } catch (error) {
      console.log('Geolocation not available or denied:', error)
      setGeolocationError('Location access denied. Please select manually.')
      // Auto-select first location as fallback
      if (locations.length > 0) {
        onLocationChange(locations[0])
      }
    }
  }

  function handleManualSelect(e) {
    const locationId = e.target.value
    const location = locations.find((loc) => loc.id === locationId)
    if (location) {
      onLocationChange(location)
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel mb-8"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
          <label className="block text-sm font-semibold text-gray-900">
            Loading locations...
          </label>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel mb-12"
    >
      <label
        htmlFor="location-select"
        className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"
      >
        <MapPin className="w-5 h-5 text-yellow-500" />
        Select Location
      </label>
      
      <AnimatePresence>
        {geolocationError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-yellow-500 mb-4 font-medium bg-yellow-50 px-4 py-2 rounded-lg"
          >
            {geolocationError}
          </motion.p>
        )}
      </AnimatePresence>
      
      <select
        id="location-select"
        value={selectedLocation?.id || ''}
        onChange={handleManualSelect}
        className="w-full px-5 py-4 glass rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none transition-all duration-300 text-base"
        aria-label="Select restaurant location"
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name} - {location.address}
          </option>
        ))}
      </select>
      
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-5 glass rounded-xl space-y-3"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-900 leading-relaxed">
                {selectedLocation.address}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-900 leading-relaxed">
                {selectedLocation.phone}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
