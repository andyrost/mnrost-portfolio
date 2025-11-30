'use client';

import React from 'react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = React.useState(false);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Ensure we only render portal on client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setImageLoaded(true);
      setIsLoading(false);
    } else {
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen && e.key === 'Escape') {
        closeModal();
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

  // Modal component to be portaled
  const modal = isModalOpen ? (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Full size view of ${title}`}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95"
        onClick={closeModal}
        aria-hidden="true"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Close button */}
      <button
        type="button"
        onClick={closeModal}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white active:text-white z-10 p-3 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
        aria-label="Close preview"
        style={{ position: 'absolute' }}
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Image container */}
      <div 
        className="relative z-10 flex items-center justify-center w-full h-full p-4 sm:p-6 md:p-8"
        onClick={closeModal}
      >
        <div 
          className="bg-white p-2 sm:p-3 md:p-4 shadow-2xl max-w-[95vw] max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={url}
            alt={title}
            className="block max-w-full max-h-[calc(95vh-120px)] sm:max-h-[calc(95vh-140px)] object-contain"
            style={{ maxWidth: '90vw' }}
          />
          
          {/* Image info */}
          <div className="mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t border-stone-100">
            <h3 className="font-playfair text-base sm:text-lg font-semibold text-stone-900">{title}</h3>
            {imageDimensions.width > 0 && imageDimensions.height > 0 && (
              <p className="font-inter text-stone-500 text-xs mt-1">
                {imageDimensions.width} × {imageDimensions.height}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Clickable Image Card */}
      <button
        type="button"
        onClick={openModal}
        className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-sm"
        aria-label={`View ${title} in full size`}
      >
        <div className="group relative">
          {/* Clean frame with subtle shadow */}
          <div className="bg-white p-1 sm:p-1.5 artistic-shadow hover:artistic-shadow-hover transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
            <div className="relative overflow-hidden bg-stone-50">
              <img
                ref={imageRef}
                src={url}
                alt={title}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                onLoad={handleImageLoad}
                onError={handleImageError}
                draggable={false}
              />
              
              {/* Hover overlay - uses CSS class to hide on touch devices */}
              <div className="gallery-hover-overlay absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                  <h3 className="font-playfair text-white font-medium text-xs sm:text-sm line-clamp-2">{title}</h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading state */}
          {isLoading && !imageLoaded && (
            <div className="absolute inset-0 bg-stone-100 animate-pulse flex items-center justify-center rounded-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin" />
            </div>
          )}
          
          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 bg-stone-100 flex items-center justify-center rounded-sm">
              <div className="text-center text-stone-400 p-3 sm:p-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-inter text-xs">Unable to load</p>
              </div>
            </div>
          )}
        </div>
      </button>

      {/* Portal the modal to document.body so it's not constrained by parent CSS */}
      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}

