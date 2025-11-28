'use client';

import GalleryImage from './gallery-image';

interface ImageData {
  pathname: string;
  url: string;
  title: string;
  order: number;
}

interface GalleryClientProps {
  images: ImageData[];
}

export default function GalleryClient({ images }: GalleryClientProps) {
  return (
    <>
      {images.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-playfair text-3xl font-semibold text-gray-900 mb-4">Gallery Empty</h2>
          <p className="font-inter text-gray-600 mb-8 max-w-md mx-auto">
            Begin your artistic journey by adding the first piece to your portfolio collection.
          </p>
          <p className="font-inter text-gray-500 text-sm">
            Click the &quot;Add Work&quot; button in the top right to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-12 text-center">
            <p className="font-inter text-gray-600 text-lg">
              {images.length} piece{images.length !== 1 ? 's' : ''} in the collection
            </p>
          </div>
          
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
            {images.map((image) => (
              <div key={image.pathname} className="break-inside-avoid mb-3">
                <GalleryImage 
                  url={image.url}
                  title={image.title}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
