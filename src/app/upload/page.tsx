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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-12">
            <Link 
              href="/" 
              className="inline-flex items-center text-emerald-600 hover:text-emerald-800 mb-8 transition-colors font-inter"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">Add New Work</h1>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mb-6"></div>
            <p className="font-inter text-xl text-gray-700 mb-4">{status}</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-lg mx-auto border border-white/20">
            {error ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-playfair text-2xl font-semibold text-gray-900 mb-4">Upload Widget Error</h2>
                <p className="font-inter text-red-600 mb-6">{error}</p>
                <p className="font-inter text-sm text-gray-600 mb-6">
                  This might be due to network issues or firewall restrictions. Please try:
                </p>
                <ul className="font-inter text-sm text-gray-600 mb-8 text-left max-w-sm mx-auto space-y-2">
                  <li>• Check your internet connection</li>
                  <li>• Disable any ad blockers or firewalls</li>
                  <li>• Try refreshing the page</li>
                  <li>• Check browser console for more details</li>
                </ul>
                <div className="space-y-3">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Refresh Page
                  </button>
                  <Link 
                    href="/upload/alternative" 
                    className="inline-block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Try Alternative Method
                  </Link>
                  <button 
                    onClick={() => window.open('https://cloudinary.com/documentation/upload_widget', '_blank')} 
                    className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    View Documentation
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-pulse">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="font-inter text-gray-600">Widget loading…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 