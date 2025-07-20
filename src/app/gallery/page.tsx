import { Suspense } from 'react';
import Link from 'next/link';
import GalleryClient from './gallery-client';

async function getGalleryImages() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gallery`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.resources || [];
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

export default async function GalleryPage() {
  const resources = await getGalleryImages();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-8 transition-colors font-inter"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-gray-900 mb-6">Portfolio Gallery</h1>
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
          <GalleryClient resources={resources} cloudName={cloudName} />
        </Suspense>
      </div>
    </div>
  );
}