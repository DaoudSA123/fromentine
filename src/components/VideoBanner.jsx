'use client'

import { useRef, useEffect, useState } from 'react'

export default function VideoBanner() {
  const videoRef = useRef(null)
  const [aspectRatio, setAspectRatio] = useState(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      if (video.videoWidth && video.videoHeight) {
        const ratio = video.videoWidth / video.videoHeight
        setAspectRatio(ratio)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    
    // If metadata is already loaded
    if (video.readyState >= 1) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  return (
    <div 
      className="w-full h-full flex items-center justify-center p-2 lg:p-4"
      style={aspectRatio ? { aspectRatio: aspectRatio.toString() } : { minHeight: '300px' }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-auto max-w-full object-contain"
        style={{
          imageRendering: 'high-quality',
          WebkitImageRendering: 'high-quality'
        }}
      >
        <source 
          src="/images/videos/sora-2_Create_a_cinematic_slow-motion_animation_starting_from_the_provided_image_of_a_g-0.mp4" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

