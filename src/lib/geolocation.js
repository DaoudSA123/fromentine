/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180
}

/**
 * Get user's current location using browser Geolocation API
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Find nearest location from user's coordinates
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {Array} locations - Array of location objects with lat, lng, id
 * @returns {Object} Nearest location object with distance
 */
export function findNearestLocation(userLat, userLng, locations) {
  if (!locations || locations.length === 0) {
    return null
  }

  let nearest = null
  let minDistance = Infinity

  locations.forEach((location) => {
    const distance = calculateDistance(
      userLat,
      userLng,
      parseFloat(location.lat),
      parseFloat(location.lng)
    )

    if (distance < minDistance) {
      minDistance = distance
      nearest = { ...location, distance }
    }
  })

  return nearest
}






