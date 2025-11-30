'use client';

import { useState } from 'react';
import GalleryImage from './gallery-image';
import { useAuth } from '../components/auth-context';

interface ImageData {
  pathname: string;
  url: string;
  title: string;
  order: number;
}

interface GalleryClientProps {
  images: ImageData[];
}

export default function GalleryClient({ images: initialImages }: GalleryClientProps) {
  const { isAuthenticated } = useAuth();
  const [images, setImages] = useState(initialImages);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (pathname: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    
    setDeleting(pathname);
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname }),
      });
      
      if (!res.ok) throw new Error('Delete failed');
      
      // Remove from local state
      setImages(prev => prev.filter(img => img.pathname !== pathname));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      {images.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh] sm:min-h-[50vh] lg:min-h-[60vh]">
          <div className="text-center max-w-xs sm:max-w-sm px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-stone-800 mb-2 sm:mb-3">Gallery Empty</h2>
            <p className="font-inter text-stone-500 text-xs sm:text-sm leading-relaxed">
              Begin your artistic journey by adding the first piece to your portfolio.
            </p>
            <p className="font-inter text-stone-400 text-xs mt-4 sm:mt-6">
              Tap &quot;Add Work&quot; in the top right corner to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="gallery-grid">
          {images.map((image, index) => (
            <div 
              key={image.pathname} 
              className="gallery-item"
              style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
            >
              <GalleryImage 
                url={image.url}
                title={image.title}
                pathname={image.pathname}
                isAuthenticated={isAuthenticated}
                onDelete={handleDelete}
                isDeleting={deleting === image.pathname}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
