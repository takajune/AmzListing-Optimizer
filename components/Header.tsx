
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              AmzListing <span className="text-orange-600">Optimizer</span>
            </span>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">How it works</a>
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">SEO Guide</a>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">AI Analysis Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
