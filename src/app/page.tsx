import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-20">
          <div className="mb-8">
            <h1 className="font-playfair text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Melissa Nielsen Rost
            </h1>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mb-6"></div>
            <p className="font-inter text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              A curated collection of artistic work and creative expressions
            </p>
          </div>
        </header>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-20">
          <Link 
            href="/gallery" 
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-playfair text-3xl font-semibold text-gray-900 mb-4">Portfolio Gallery</h2>
              <p className="font-inter text-gray-600 leading-relaxed">
                Explore a carefully curated collection of artistic work and creative projects
              </p>
            </div>
          </Link>

          <Link 
            href="/upload" 
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="font-playfair text-3xl font-semibold text-gray-900 mb-4">Add New Work</h2>
              <p className="font-inter text-gray-600 leading-relaxed">
                Contribute new pieces to the evolving collection of artistic expressions
              </p>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto mb-6"></div>
          <p className="font-inter text-gray-500 text-sm">
            © 2024 Melissa Nielsen Rost. Crafted with creativity and purpose.
          </p>
        </footer>
      </div>
    </div>
  );
}