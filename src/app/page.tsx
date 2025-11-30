import { Suspense } from 'react';
import Image from 'next/image';
import GalleryClient from './gallery/gallery-client';
import UploadWidget from './components/upload-widget';
import { list } from '@vercel/blob';

// This page fetches fresh data on every request (gallery images from blob storage)
export const dynamic = 'force-dynamic';

const MANIFEST_FILENAME = 'manifest.json';

interface ManifestItem {
  key: string;
  url: string;
  title: string;
  order: number;
}

interface Manifest {
  items: ManifestItem[];
}

async function getManifest(): Promise<Manifest> {
  try {
    const { blobs } = await list({ prefix: MANIFEST_FILENAME });
    const manifestBlob = blobs.find(b => b.pathname === MANIFEST_FILENAME);
    
    if (!manifestBlob) {
      return { items: [] };
    }
    
    const cacheBustUrl = `${manifestBlob.url}?_=${Date.now()}`;
    const response = await fetch(cacheBustUrl, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch manifest:', response.status, response.statusText);
      return { items: [] };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching manifest:', error);
    return { items: [] };
  }
}

async function getGalleryImages() {
  try {
    // Call blob API directly instead of going through HTTP fetch
    const [{ blobs }, manifest] = await Promise.all([
      list({ prefix: 'portfolio/' }),
      getManifest()
    ]);

    // Create a map for quick lookup
    const manifestMap = new Map(
      manifest.items.map(item => [item.key, item])
    );

    // Filter to only image files and enrich with manifest data
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const images = blobs
      .filter(blob => {
        const ext = blob.pathname.toLowerCase().slice(blob.pathname.lastIndexOf('.'));
        return imageExtensions.includes(ext);
      })
      .map(blob => {
        const manifestItem = manifestMap.get(blob.pathname);
        return {
          pathname: blob.pathname,
          url: blob.url,
          uploadedAt: blob.uploadedAt,
          size: blob.size,
          title: manifestItem?.title || blob.pathname.split('/').pop()?.replace(/\.[^.]+$/, '') || 'Untitled',
          order: manifestItem?.order ?? 999999,
        };
      })
      .sort((a, b) => a.order - b.order);

    return images;
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

export default async function HomePage() {
  const images = await getGalleryImages();

  return (
    <div className="min-h-screen bg-[#faf1e0]">
      {/* Upload Widget - Top Right */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <UploadWidget />
      </div>

      {/* Mobile & Tablet: Stacked Layout | Desktop: Side-by-side */}
      <div className="lg:flex">
        
        {/* Sidebar - Static on mobile/tablet, Sticky on desktop */}
        <aside className="
          w-full lg:w-[30%] lg:min-w-[300px] lg:max-w-[400px] 
          lg:h-screen lg:sticky lg:top-0 
          border-b lg:border-b-0 lg:border-r border-stone-200/60
        ">
          <div className="flex flex-col lg:justify-center px-6 sm:px-8 lg:px-8 xl:px-10 py-8 sm:py-10 lg:py-12 lg:h-full">
            
            {/* Mobile/Tablet: Horizontal layout | Desktop: Vertical */}
            <div className="flex flex-row lg:flex-col items-center lg:items-start gap-6 sm:gap-8 lg:gap-0">
              
              {/* Logo/Portrait */}
              <div className="shrink-0 lg:mb-8 lg:w-full">
                <div className="relative overflow-hidden rounded-sm shadow-lg w-24 h-24 sm:w-32 sm:h-32 lg:w-full lg:h-auto">
                  <Image
                    src="/mrostart.jpeg"
                    alt="Melissa Nielsen Rost"
                    width={400}
                    height={500}
                    className="w-full h-full lg:h-auto object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Name & Subtitle */}
              <div className="flex-1 lg:flex-none space-y-3 sm:space-y-4 lg:space-y-6">
                <div>
                  <h1 className="font-playfair text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-stone-900 leading-tight tracking-tight">
                    <span className="lg:block">Melissa</span>
                    <span className="lg:hidden"> </span>
                    <span className="lg:block">Nielsen Rost</span>
                  </h1>
                  <div className="mt-3 lg:mt-4 w-12 lg:w-16 h-0.5 bg-gradient-to-r from-amber-700 to-amber-500" />
                </div>
                
                <p className="font-inter text-stone-600 text-sm sm:text-base lg:text-base xl:text-lg leading-relaxed max-w-xs hidden sm:block">
                  A curated collection of artistic work and creative expressions
                </p>
              </div>
            </div>

            {/* Collection count - Hidden on mobile, shown on larger screens */}
            <div className="hidden lg:block mt-10 xl:mt-12 pt-6 xl:pt-8 border-t border-stone-200/60">
              <p className="font-inter text-stone-500 text-sm tracking-wide uppercase">
                Portfolio
              </p>
              <p className="font-inter text-stone-400 text-sm mt-1">
                {images.length} work{images.length !== 1 ? 's' : ''} in collection
              </p>
            </div>

            {/* Mobile collection count */}
            <div className="lg:hidden mt-4 sm:mt-6">
              <p className="font-inter text-stone-400 text-xs sm:text-sm">
                {images.length} work{images.length !== 1 ? 's' : ''} in collection
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content - Scrollable Gallery */}
        <main className="flex-1 min-h-[50vh] lg:min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-12">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20 lg:py-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-2 border-stone-300 border-t-amber-600 mx-auto mb-4"></div>
                  <p className="font-inter text-stone-500 text-xs sm:text-sm">Loading gallery...</p>
                </div>
              </div>
            }>
              <GalleryClient images={images} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
