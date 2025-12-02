'use client'

import { useState, useEffect } from 'react'
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
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loading locations...
        </label>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <label
        htmlFor="location-select"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Select Location
      </label>
      {geolocationError && (
        <p className="text-sm text-orange-500 mb-2">{geolocationError}</p>
      )}
      <select
        id="location-select"
        value={selectedLocation?.id || ''}
        onChange={handleManualSelect}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        aria-label="Select restaurant location"
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name} - {location.address}
          </option>
        ))}
      </select>
      {selectedLocation && (
        <p className="mt-2 text-sm text-gray-600">
          📍 {selectedLocation.address} | 📞 {selectedLocation.phone}
        </p>
      )}
    </div>
  )
}

