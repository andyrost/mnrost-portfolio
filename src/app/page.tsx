import { Suspense } from 'react';
import GalleryClient from './gallery/gallery-client';
import UploadWidget from './components/upload-widget';

async function getGalleryImages() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/gallery`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.images || [];
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

export default async function HomePage() {
  const images = await getGalleryImages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Upload Widget - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <UploadWidget />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gray-900 mb-6">Melissa Nielsen Rost</h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mb-6"></div>
          <p className="font-inter text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            A curated collection of artistic work and creative expressions
          </p>
        </div>

        {/* Gallery Grid */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="font-inter text-gray-600">Loading gallery...</p>
            </div>
          </div>
        }>
          <GalleryClient images={images} />
        </Suspense>
      </div>
    </div>
  );
}
