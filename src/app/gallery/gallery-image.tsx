'use client';

import React from 'react';

interface GalleryImageProps {
  publicId: string;
  cloudName: string;
  secureUrl?: string;
  displayName?: string;
}

export default function GalleryImage({ publicId, cloudName, secureUrl, displayName }: GalleryImageProps) {
  // If we have the secure_url from Cloudinary, use it directly
  // Otherwise, try multiple URL formats
  const urlFormats = secureUrl ? [secureUrl] : [
    `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_600/${publicId}`,
    `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_600/${publicId}.jpg`,
    `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_600/${publicId}.png`,
    `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`,
    `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`,
    `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.png`
  ];
  
  const [currentUrlIndex, setCurrentUrlIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const imageUrl = urlFormats[currentUrlIndex];
  const imageRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    // Check if image is already loaded (cached)
    if (imageRef.current && imageRef.current.complete) {
      setImageLoaded(true);
      setIsLoading(false);
    } else {
      // Show loading state after a small delay to prevent flashing
      const timer = setTimeout(() => {
        if (!imageLoaded) {
          setIsLoading(true);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [imageUrl, imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Try next URL format
    if (currentUrlIndex < urlFormats.length - 1) {
      const nextIndex = currentUrlIndex + 1;
      setCurrentUrlIndex(nextIndex);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const fileName = displayName || publicId.split('/').pop() || 'Image';

  return (
    <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
      <img
        ref={imageRef}
        src={imageUrl}
        alt={fileName}
        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-white font-semibold text-lg mb-2">{fileName}</h3>
          <p className="text-white/80 text-sm">Click to view</p>
        </div>
      </div>
      
      {/* Loading state - only show while loading and after delay */}
      {isLoading && !imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
} 