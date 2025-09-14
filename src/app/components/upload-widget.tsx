'use client';
import { useEffect, useState } from 'react';

// Extend Window interface to include cloudinary
declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function UploadWidget() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  // Simple password check - you might want to make this more secure
  const correctPassword = process.env.NEXT_PUBLIC_UPLOAD_PASSWORD || 'admin123';

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setError(null);
      setPassword('');
    } else {
      setError('Incorrect password');
    }
  };

  const openUploadWidget = () => {
    if (!isAuthenticated) {
      setShowPasswordModal(true);
      return;
    }

    // Check if environment variables are available
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      setError('Upload configuration not available');
      return;
    }

    setStatus('Opening upload widget...');
    
    // Try multiple CDN URLs in case one fails
    const scriptUrls = [
      'https://upload-widget.cloudinary.com/global/all.js',
      'https://upload-widget.cloudinary.com/2.27.9/global/all.js',
      'https://res.cloudinary.com/cloudinary-js/upload-widget/global/all.js'
    ];
    
    let currentUrlIndex = 0;
    
    const loadScript = () => {
      if (currentUrlIndex >= scriptUrls.length) {
        setError('Failed to load upload widget');
        setStatus('');
        return;
      }
      
      const scriptUrl = scriptUrls[currentUrlIndex];
      
      const s = document.createElement('script');
      s.src = scriptUrl;
      s.async = true;
      s.crossOrigin = 'anonymous';
      
      s.onload = () => {
        setTimeout(() => {
          try {
            if (typeof window.cloudinary === 'undefined') {
              throw new Error('Cloudinary widget not available');
            }
            
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
                  setStatus('');
                  return;
                }
                
                if (res.event === 'queues-end') {
                  console.log('All uploads completed successfully!');
                  alert('Uploads complete!');
                  // Refresh the page to show new images
                  window.location.reload();
                }
              },
            );
          } catch (err) {
            console.error('Widget error:', err);
            setError(`Widget error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setStatus('');
          }
        }, 1000);
      };
      
      s.onerror = () => {
        currentUrlIndex++;
        loadScript(); // Try next URL
      };
      
      document.body.appendChild(s);
    };
    
    loadScript();
  };

  return (
    <>
      {/* Upload Button */}
      <button
        onClick={openUploadWidget}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-2"
        title="Add new work to portfolio"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="hidden sm:inline">Add Work</span>
      </button>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-playfair text-2xl font-semibold text-gray-900 mb-4 text-center">
              Authentication Required
            </h3>
            <p className="font-inter text-gray-600 mb-6 text-center">
              Please enter the password to add new work to the portfolio.
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-inter"
                  autoFocus
                />
              </div>
              
              {error && (
                <p className="text-red-600 text-sm font-inter">{error}</p>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-inter"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-inter"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status/Error Display */}
      {(status || error) && (
        <div className="fixed top-20 right-4 z-40">
          <div className={`px-4 py-3 rounded-lg shadow-lg max-w-sm ${
            error ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            <p className="font-inter text-sm">
              {error || status}
            </p>
            {error && (
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
} 