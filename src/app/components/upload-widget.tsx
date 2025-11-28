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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  // Reset authentication state on component mount
  useEffect(() => {
    setIsAuthenticated(false);
    setShowPasswordModal(false);
    setError(null);
    setPassword('');
    // Clear any potential browser storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('isAuthenticated');
    }
  }, []);

  // Server-validated password. No client-stored secret.
  const correctPassword = undefined;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        if (!res.ok) {
          setError('Incorrect password');
          return;
        }
        setIsAuthenticated(true);
        setShowPasswordModal(false);
        setError(null);
        setPassword('');
        setTimeout(() => setShowDetailsModal(true), 50);
      } catch (e) {
        setError('Login failed');
      }
    })();
  };

  const slugify = (value: string): string => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 120);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow empty titles, but prefer at least something
    setShowDetailsModal(false);
    setTimeout(() => {
      openUploadWidgetAuthenticated();
    }, 50);
  };

  // Internal function that opens the widget without auth checks
  const openUploadWidgetAuthenticated = () => {
    console.log('Opening upload widget (authenticated path)');
    // Check if environment variables are available
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
    const allowCustomPublicId = process.env.NEXT_PUBLIC_ALLOW_CUSTOM_PUBLIC_ID === 'true';
    
    console.log('Environment variables:', { cloudName: !!cloudName, uploadPreset: !!uploadPreset });
    
    if (!cloudName || !uploadPreset) {
      console.error('Upload configuration not available');
      setError('Upload configuration not available');
      return;
    }

    setStatus('Opening upload widget...');
    let successfulUploads = 0;
    let encounteredError = false;

    const caption = (title || '').trim();
    const widgetOptions: any = {
      cloudName: cloudName,
      uploadPreset: uploadPreset,
      folder: 'portfolio',
      sources: ['local'],
      multiple: false,
      maxFiles: 1,
      resourceType: 'image',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      maxImageFileSize: 20000000, // 20MB
      tags: ['portfolio'],
      // Send context as a string to maximize compatibility
      context: caption ? `caption=${caption}|alt=${caption}` : undefined,
      // Let the widget pass publicId which it maps to public_id internally when signed
      publicId: allowCustomPublicId && caption ? slugify(caption) : undefined,
      cropping: true,
      croppingCoordinatesMode: 'custom',
      croppingShowDimensions: true,
      croppingValidateDimensions: true,
      showAdvancedOptions: true,
      showUploadMoreButton: true,
      showPoweredBy: false,
      showCompletedButton: true,
      showSkipButton: false,
      autoMinimize: false,
      styles: {
        palette: {
          window: "#FFFFFF",
          sourceBg: "#F4F4F5",
          windowBorder: "#90A0B3",
          tabIcon: "#0078FF",
          inactiveTabIcon: "#69778A",
          menuIcons: "#0078FF",
          link: "#0078FF",
          action: "#0078FF",
          inProgress: "#0078FF",
          complete: "#20B832",
          error: "#EA2727",
          textDark: "#000000",
          textLight: "#FFFFFF"
        }
      }
    };

    // Optionally enable signed uploads so we can reliably set public_id and context
    const useSignedUploads = process.env.NEXT_PUBLIC_USE_SIGNED_UPLOADS === 'true';
    const publicApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    if (useSignedUploads) {
      if (!publicApiKey) {
        console.error('Missing NEXT_PUBLIC_CLOUDINARY_API_KEY for signed uploads');
        setError('Upload configuration not available');
        setStatus('');
        return;
      }
      widgetOptions.apiKey = publicApiKey;
      // Cloudinary Upload Widget v2: uploadSignature accepts a callback and paramsToSign
      widgetOptions.uploadSignature = (callback: any, paramsToSign: any) => {
        console.log('Widget requested signature for params:', paramsToSign);
        // Server will sign arbitrary params (folder, public_id, context, timestamp, etc.)
        fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paramsToSign })
        })
          .then(async (res) => {
            if (!res.ok) throw new Error('Signature request failed');
            const data = await res.json();
            if (!data.signature) throw new Error('Invalid signature response');
            // Pass back both signature and the timestamp provided by the widget
            callback(data.signature, paramsToSign.timestamp);
          })
          .catch((err) => {
            console.error('Signature error:', err);
            setError('Failed to generate upload signature');
            setStatus('');
          });
      };
    }

    const widgetCallback = (err: any, res: any) => {
      if (err) {
        encounteredError = true;
        console.error('Upload error:', err);
        setError(`Upload error: ${err.message || 'Unknown error'}`);
        setStatus('');
        return;
      }

      if (!res || !res.event) {
        return;
      }

      if (res.event === 'success') {
        successfulUploads += 1;
      }

      if (res.event === 'queues-end') {
        if (successfulUploads > 0) {
          console.log('Uploads completed with successes:', successfulUploads);
          setStatus('Updating manifest...');
          // Fetch current manifest, append if missing, then save
          (async () => {
            try {
              const manRes = await fetch('/api/admin/manifest', { cache: 'no-store' });
              const manifest = manRes.ok ? await manRes.json() : { items: [] };
              const publicId = res?.info?.public_id || res?.data?.public_id;
              if (publicId) {
                const items = Array.isArray(manifest.items) ? manifest.items : [];
                const exists = items.some((i: any) => i.key === publicId);
                const maxOrder = items.reduce((m: number, i: any) => Math.max(m, Number(i.order) || 0), 0);
                const newItem = { key: publicId, title: caption, order: exists ? undefined : maxOrder + 1 } as any;
                const nextItems = exists
                  ? items.map((i: any) => (i.key === publicId ? { ...i, title: caption } : i))
                  : [...items, newItem];
                const saveRes = await fetch('/api/admin/manifest', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ items: nextItems })
                });
                if (!saveRes.ok) throw new Error('Failed to save manifest');
              }
              setStatus('Uploads complete');
              setTimeout(() => window.location.reload(), 300);
            } catch (e) {
              console.error(e);
              setError('Upload succeeded but updating manifest failed');
              setStatus('');
            }
          })();
        } else {
          console.warn('Upload finished with no successful files');
          setError('Upload failed or was cancelled');
          setStatus('');
        }
      }
    };
    
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
      
      // If widget already loaded, skip loading script
      if (typeof window !== 'undefined' && typeof window.cloudinary !== 'undefined') {
        try {
          window.cloudinary.openUploadWidget(widgetOptions, widgetCallback);
        } catch (err) {
          console.error('Widget error:', err);
          setError(`Widget error: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setStatus('');
        }
        return;
      }

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
            
            window.cloudinary.openUploadWidget(widgetOptions, widgetCallback);
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

  // Button handler that enforces authentication before opening the widget
  const handleAddWorkClick = () => {
    console.log('handleAddWorkClick:', { isAuthenticated });
    if (!isAuthenticated) {
      setShowPasswordModal(true);
      return;
    }
    openUploadWidgetAuthenticated();
  };

  return (
    <>
      {/* Upload Button */}
      <button
        onClick={handleAddWorkClick}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-2 cursor-pointer"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-inter text-gray-900 placeholder-gray-500"
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

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-playfair text-2xl font-semibold text-gray-900 mb-4 text-center">
              Add Artwork Details
            </h3>
            <p className="font-inter text-gray-600 mb-6 text-center">
              Optionally name your artwork before uploading.
            </p>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Artwork title (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-inter text-gray-900 placeholder-gray-500"
                  autoFocus
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-inter"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-inter"
                >
                  Continue
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