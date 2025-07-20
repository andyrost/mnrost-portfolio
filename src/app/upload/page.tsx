'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Extend Window interface to include cloudinary
declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function UploadPage() {
  const [status, setStatus] = useState('Loading widget script...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if environment variables are available
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
    
    console.log('Environment variables:', { cloudName, uploadPreset });
    
    if (!cloudName || !uploadPreset) {
      setError(`Missing environment variables: cloudName=${cloudName}, uploadPreset=${uploadPreset}`);
      setStatus('Configuration error');
      return;
    }

    setStatus('Loading Cloudinary widget...');
    
    // Try multiple CDN URLs in case one fails
    const scriptUrls = [
      'https://upload-widget.cloudinary.com/global/all.js',
      'https://upload-widget.cloudinary.com/2.27.9/global/all.js',
      'https://res.cloudinary.com/cloudinary-js/upload-widget/global/all.js'
    ];
    
    let currentUrlIndex = 0;
    
    const loadScript = () => {
      if (currentUrlIndex >= scriptUrls.length) {
        setError('All Cloudinary widget CDN URLs failed to load. Please check your internet connection.');
        setStatus('Script loading failed');
        return;
      }
      
      const scriptUrl = scriptUrls[currentUrlIndex];
      console.log(`Trying to load script from: ${scriptUrl}`);
      
      const s = document.createElement('script');
      s.src = scriptUrl;
      s.async = true;
      s.crossOrigin = 'anonymous';
      
      s.onload = () => {
        console.log(`Successfully loaded script from: ${scriptUrl}`);
        setStatus('Widget script loaded, opening upload widget...');
        
        // Wait a bit for the script to initialize
        setTimeout(() => {
          try {
            if (typeof window.cloudinary === 'undefined') {
              throw new Error('Cloudinary widget not available after script load');
            }
            
            console.log('Opening Cloudinary upload widget...');
            window.cloudinary.openUploadWidget(
              {
                cloudName: cloudName,
                uploadPreset: uploadPreset,
                folder: 'portfolio',
                sources: ['local', 'url'],
                multiple: true,
                maxFiles: 20,
                resourceType: 'image',
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                maxImageFileSize: 20000000, // 20MB
                tags: ['portfolio'],
                context: { alt: 'Portfolio image' },
              },
              (err: any, res: any) => {
                if (err) {
                  console.error('Upload error:', err);
                  setError(`Upload error: ${err.message || 'Unknown error'}`);
                  return;
                }
                
                console.log('Upload result:', res);
                console.log('Upload event:', res.event);
                console.log('Upload info:', res.info);
                
                if (res.event === 'queues-end') {
                  console.log('All uploads completed successfully!');
                  alert('Uploads complete!');
                  // Optionally redirect to gallery after upload
                  window.location.href = '/gallery';
                } else if (res.event === 'success') {
                  console.log('Single upload successful:', res.info);
                }
              },
            );
          } catch (err) {
            console.error('Widget error:', err);
            setError(`Widget error: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }, 1000);
      };
      
      s.onerror = () => {
        console.error(`Failed to load script from: ${scriptUrl}`);
        currentUrlIndex++;
        loadScript(); // Try next URL
      };
      
      document.body.appendChild(s);
    };
    
    loadScript();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Work</h1>
          <p className="text-gray-600">{status}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          {error ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload Widget Error</h2>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <p className="text-xs text-gray-500 mb-4">
                This might be due to network issues or firewall restrictions. Please try:
              </p>
              <ul className="text-xs text-gray-500 mb-4 text-left max-w-sm mx-auto">
                <li>• Check your internet connection</li>
                <li>• Disable any ad blockers or firewalls</li>
                <li>• Try refreshing the page</li>
                <li>• Check browser console for more details</li>
              </ul>
              <div className="space-x-2">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
                <Link 
                  href="/upload/alternative" 
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Try Alternative Method
                </Link>
                <button 
                  onClick={() => window.open('https://cloudinary.com/documentation/upload_widget', '_blank')} 
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  View Documentation
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-500">Widget loading…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 