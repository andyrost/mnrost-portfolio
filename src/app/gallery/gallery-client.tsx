'use client';

import Link from 'next/link';
import GalleryImage from './gallery-image';

interface GalleryClientProps {
  resources: any[];
  cloudName: string;
}

export default function GalleryClient({ resources, cloudName }: GalleryClientProps) {
  return (
    <>
      {resources.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-playfair text-3xl font-semibold text-gray-900 mb-4">Gallery Empty</h2>
          <p className="font-inter text-gray-600 mb-8 max-w-md mx-auto">Begin your artistic journey by adding the first piece to your portfolio collection.</p>
          <Link 
            href="/upload" 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add First Piece
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-12 text-center">
            <p className="font-inter text-gray-600 text-lg">
              {resources.length} piece{resources.length !== 1 ? 's' : ''} in the collection
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resources.map((i: any) => (
              <GalleryImage 
                key={i.public_id}
                publicId={i.public_id}
                cloudName={cloudName}
                secureUrl={i.secure_url}
                displayName={i.display_name}
              />
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link 
              href="/upload" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Piece
            </Link>
          </div>
        </>
      )}
    </>
  );
} 