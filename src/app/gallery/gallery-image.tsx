'use client';

import React from 'react';

interface GalleryImageProps {
  url: string;
  title: string;
}

export default function GalleryImage({ url, title }: GalleryImageProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [imageDimensions, setImageDimensions] = React.useState({ width: 0, height: 0 });
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
  }, [url, imageLoaded]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen && e.key === 'Escape') {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Calculate aspect ratio for better sizing
  const aspectRatio = imageDimensions.height > 0 ? imageDimensions.width / imageDimensions.height : 1;
  const isPortrait = aspectRatio < 1;
  const isLandscape = aspectRatio > 1.5;

  return (
    <>
      <div 
        className="group relative cursor-pointer"
        onClick={handleClick}
      >
        {/* Minimal frame */}
        <div className="bg-white p-1 artistic-shadow hover:artistic-shadow-hover transition-all duration-500 transform hover:-translate-y-1 gallery-image-enter">
          {/* Minimal inner matting */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-1">
            <div className="relative overflow-hidden">
              <img
                ref={imageRef}
                src={url}
                alt={title}
                className={`w-full transition-all duration-700 group-hover:scale-105 ${
                  isPortrait ? 'h-auto max-h-[500px]' : 
                  isLandscape ? 'h-auto max-h-[400px]' : 
                  'h-auto max-h-[450px]'
                } object-contain`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {/* Elegant overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="font-playfair text-white font-semibold text-base mb-1">{title}</h3>
                  <p className="font-inter text-white/90 text-xs">Click to view full size</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading && !imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 animate-pulse flex items-center justify-center">
            <div className="text-purple-400">
              <svg className="w-12 h-12 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500 p-6">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-inter text-sm">Unable to load artwork</p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 lightbox-backdrop"
          onClick={handleCloseModal}
        >
          {/* Close button */}
          <button
            onClick={handleCloseModal}
            className="fixed top-4 right-4 text-white hover:text-gray-300 transition-all duration-200 z-10 bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative max-w-7xl max-h-full lightbox-content">
            {/* Image container */}
            <div 
              className="bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={url}
                alt={title}
                className="max-w-full max-h-[80vh] object-contain"
              />
              
              {/* Image info */}
              <div className="mt-4 text-center">
                <h3 className="font-playfair text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="font-inter text-gray-600 text-sm">
                  {imageDimensions.width > 0 && imageDimensions.height > 0 && 
                    `${imageDimensions.width} × ${imageDimensions.height} pixels`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
