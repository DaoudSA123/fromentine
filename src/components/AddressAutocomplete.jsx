'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Loader2, X } from 'lucide-react'

export default function AddressAutocomplete({ 
  value = '', 
  onChange, 
  onAddressSelect,
  placeholder = 'Start typing your address...',
  required = false,
  id = 'address-autocomplete'
}) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [error, setError] = useState(null)
  
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const autocompleteServiceRef = useRef(null)
  const placesServiceRef = useRef(null)
  const sessionTokenRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Initialize Google Places services
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
      }
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        )
      }
    }
  }, [])

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      console.warn('Google Places API key not found. Please add NEXT_PUBLIC_GOOGLE_PLACES_API_KEY to your .env.local file')
      return
    }

    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      return
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your API key.')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Create new session token for each search session
  const createSessionToken = useCallback(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    }
  }, [])

  // Fetch address suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (!autocompleteServiceRef.current) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create session token if it doesn't exist
      if (!sessionTokenRef.current) {
        createSessionToken()
      }

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: query,
          sessionToken: sessionTokenRef.current,
          componentRestrictions: { country: 'us' }, // Restrict to US, remove if international
        },
        (predictions, status) => {
          setIsLoading(false)
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions)
            setShowSuggestions(true)
            setSelectedIndex(-1)
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setSuggestions([])
            setShowSuggestions(true)
          } else {
            setError('Unable to fetch address suggestions. Please try again.')
            setSuggestions([])
            setShowSuggestions(false)
          }
        }
      )
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setIsLoading(false)
      setError('An error occurred while fetching suggestions.')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [createSessionToken])

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (inputValue !== value) {
        fetchSuggestions(inputValue)
      }
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [inputValue, fetchSuggestions, value])

  // Get place details
  const getPlaceDetails = useCallback((placeId) => {
    if (!placesServiceRef.current || !placeId) {
      return
    }

    setIsLoading(true)
    setError(null)

    // Create new session token for place details request
    if (!sessionTokenRef.current) {
      createSessionToken()
    }

    placesServiceRef.current.getDetails(
      {
        placeId: placeId,
        sessionToken: sessionTokenRef.current,
        fields: [
          'formatted_address',
          'geometry',
          'address_components',
          'place_id'
        ],
      },
      (place, status) => {
        setIsLoading(false)
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          // Extract address components
          const addressComponents = {}
          place.address_components?.forEach((component) => {
            const types = component.types
            if (types.includes('street_number')) {
              addressComponents.street_number = component.long_name
            }
            if (types.includes('route')) {
              addressComponents.route = component.long_name
            }
            if (types.includes('locality')) {
              addressComponents.locality = component.long_name
            }
            if (types.includes('administrative_area_level_1')) {
              addressComponents.administrative_area_level_1 = component.short_name
            }
            if (types.includes('postal_code')) {
              addressComponents.postal_code = component.long_name
            }
            if (types.includes('country')) {
              addressComponents.country = component.short_name
            }
          })

          const addressData = {
            formatted_address: place.formatted_address,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
            place_id: place.place_id,
            components: addressComponents,
          }

          // Update input value
          setInputValue(place.formatted_address)
          setShowSuggestions(false)
          setSuggestions([])
          
          // Clear session token after use
          sessionTokenRef.current = null

          // Call callbacks
          if (onChange) {
            onChange(place.formatted_address)
          }
          if (onAddressSelect) {
            onAddressSelect(addressData)
          }
        } else {
          setError('Unable to fetch address details. Please try again.')
        }
      }
    )
  }, [onChange, onAddressSelect, createSessionToken])

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedIndex(-1)
    if (onChange) {
      onChange(newValue)
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (prediction) => {
    getPlaceDetails(prediction.place_id)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Sync with external value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value])

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          required={required}
          className="w-full px-5 py-4 glass rounded-xl text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none transition-all duration-300 text-base pr-10"
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          )}
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setInputValue('')
                setSuggestions([])
                setShowSuggestions(false)
                if (onChange) onChange('')
                if (onAddressSelect) onAddressSelect(null)
                inputRef.current?.focus()
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear address"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 mt-2"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.ul
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 glass rounded-xl shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
          >
            {suggestions.map((prediction, index) => (
              <li
                key={prediction.place_id}
                onClick={() => handleSelectSuggestion(prediction)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-5 py-3 cursor-pointer transition-colors flex items-start gap-3 ${
                  index === selectedIndex
                    ? 'bg-orange-500/20 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${index === 0 ? 'rounded-t-xl' : ''} ${
                  index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{prediction.description}</p>
                  {prediction.structured_formatting?.secondary_text && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {showSuggestions && suggestions.length === 0 && inputValue.length >= 3 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-full mt-2 glass rounded-xl shadow-lg px-5 py-3"
        >
          <p className="text-sm text-gray-500">No addresses found</p>
        </motion.div>
      )}
    </div>
  )
}


