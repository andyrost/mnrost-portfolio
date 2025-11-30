'use client';

import { useState, useRef } from 'react';
import { useAuth } from './auth-context';

export default function UploadWidget() {
  const { isAuthenticated, setAuthenticated } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError('Incorrect password');
        return;
      }

      setAuthenticated(true);
      setShowPasswordModal(false);
      setPassword('');
      setTimeout(() => setShowUploadModal(true), 50);
    } catch {
      setError('Login failed');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }

    setUploading(true);
    setStatus('Uploading...');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setStatus('Upload complete!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStatus('');
    } finally {
      setUploading(false);
    }
  };

  const handleAddWorkClick = () => {
    if (!isAuthenticated) {
      setShowPasswordModal(true);
      return;
    }
    setShowUploadModal(true);
  };

  const resetUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setPreview(null);
    setTitle('');
    setError(null);
    setStatus('');
  };

  return (
    <>
      {/* Upload/Login Button - Responsive */}
      <button
        onClick={handleAddWorkClick}
        className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:from-amber-800 active:to-amber-900 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-1.5 sm:space-x-2 cursor-pointer text-sm sm:text-base"
        title={isAuthenticated ? "Add new work to portfolio" : "Login to manage portfolio"}
      >
        {isAuthenticated ? (
          <>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-inter font-medium">Add Work</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="font-inter font-medium">Login</span>
          </>
        )}
      </button>

      {/* Password Modal - Responsive */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-playfair text-xl sm:text-2xl font-semibold text-stone-900 mb-3 sm:mb-4 text-center">
              Admin Access
            </h3>
            <p className="font-inter text-stone-600 mb-5 sm:mb-6 text-center text-sm sm:text-base">
              Enter the password to upload new artwork.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-inter text-stone-900 placeholder-stone-500 text-sm sm:text-base"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-red-600 text-xs sm:text-sm font-inter">{error}</p>
              )}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setError(null);
                  }}
                  className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 active:bg-stone-400 transition-colors font-inter text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-inter text-sm sm:text-base"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal - Responsive */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-playfair text-xl sm:text-2xl font-semibold text-stone-900 mb-4 text-center">
              Upload Artwork
            </h3>

            <form onSubmit={handleUpload} className="space-y-5 sm:space-y-6">
              {/* File Input */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-48 sm:max-h-64 object-contain rounded-lg border border-stone-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 active:bg-red-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 sm:py-12 border-2 border-dashed border-stone-300 rounded-lg hover:border-amber-500 active:border-amber-600 transition-colors flex flex-col items-center justify-center gap-2 sm:gap-3 text-stone-500 hover:text-amber-600"
                  >
                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-inter text-sm sm:text-base">Tap to select an image</span>
                    <span className="font-inter text-xs sm:text-sm text-stone-400">JPG, PNG, GIF, or WebP • Max 20MB</span>
                  </button>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1.5 sm:mb-2 font-inter">
                  Artwork Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this artwork"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-inter text-stone-900 placeholder-stone-500 text-sm sm:text-base"
                />
              </div>

              {/* Error/Status Messages */}
              {error && (
                <p className="text-red-600 text-xs sm:text-sm font-inter">{error}</p>
              )}
              {status && !error && (
                <p className="text-amber-600 text-xs sm:text-sm font-inter">{status}</p>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={resetUploadModal}
                  disabled={uploading}
                  className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 active:bg-stone-400 transition-colors font-inter disabled:opacity-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-inter disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {uploading ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="hidden sm:inline">Uploading...</span>
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
