import React, { useState, useEffect } from 'react';
import { AppState, AmazonListing } from './types.ts';
import { generateAmazonListing } from './services/geminiService.ts';
import Header from './components/Header.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import ListingCard from './components/ListingCard.tsx';

// Define the AIStudio interface to match the environment's global type expectations
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // Ensure the modifier and type match the environment's pre-defined aistudio property
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    mimeType: null,
    listing: null,
    isLoading: false,
    error: null,
  });
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Check for aistudio helper and its selected key status
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.error("Error checking for API key:", e);
          setHasKey(false);
        }
      } else {
        // Fallback for environments without the aistudio helper
        setHasKey(!!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume key selection was successful per guidelines to mitigate race conditions
        setHasKey(true);
      } catch (e) {
        console.error("Error opening key selection dialog:", e);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setState(prev => ({ ...prev, error: "Please upload a valid image file." }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Extract base64 part from DataURL
        const base64 = result.split(',')[1];
        setState(prev => ({
          ...prev,
          image: base64,
          mimeType: file.type,
          listing: null,
          error: null
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!state.image || !state.mimeType) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const listing = await generateAmazonListing(state.image, state.mimeType);
      setState(prev => ({ ...prev, listing, isLoading: false }));
    } catch (err: any) {
      const errorMessage = err.message || String(err);
      // Reset key selection if the request fails due to an invalid/missing key session
      if (errorMessage.includes("Requested entity was not found")) {
        setHasKey(false);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "API key session expired. Please re-connect your key." 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage || "Failed to generate listing. Please try again." 
        }));
      }
    }
  };

  const reset = () => {
    setState({
      image: null,
      mimeType: null,
      listing: null,
      isLoading: false,
      error: null,
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {hasKey === false && (
          <div className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center animate-fade-in">
            <h3 className="text-xl font-bold text-orange-900 mb-2">API Key Required</h3>
            <p className="text-orange-700 mb-6 max-w-md mx-auto">
              To use AI generation features, you must connect an API key from a paid Google Cloud project. 
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                Learn more about billing
              </a>.
            </p>
            <button
              onClick={handleSelectKey}
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg"
            >
              Connect API Key
            </button>
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">1. Upload Your Mockup</h2>
            <p className="text-gray-500">Provide a high-quality product mockup or photo to analyze.</p>
          </div>

          {!state.image ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-orange-400 transition-colors group cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-700">Click or drag to upload</p>
                <p className="text-sm text-gray-400 mt-1">PNG, JPG, or WEBP up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <img 
                src={`data:${state.mimeType};base64,${state.image}`} 
                alt="Product Mockup" 
                className="w-full h-auto max-h-[400px] object-contain bg-gray-50"
              />
              {!state.listing && !state.isLoading && (
                <button 
                  onClick={reset}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-md p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}
            </div>
          )}

          {state.error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{state.error}</p>
                </div>
              </div>
            </div>
          )}

          {!state.listing && state.image && !state.isLoading && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={hasKey === false}
                className={`bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all active:translate-y-0 ${
                  hasKey === false ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-orange-200 hover:-translate-y-1'
                }`}
              >
                {hasKey === false ? 'Connect API Key to Generate' : 'Generate Optimized Listing'}
              </button>
            </div>
          )}
        </section>

        {state.isLoading && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <LoadingSpinner />
          </div>
        )}

        {state.listing && (
          <section className="mt-12 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">2. Your Optimized Content</h2>
              <button 
                onClick={reset}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Start Over
              </button>
            </div>

            <ListingCard 
              title="Product Title" 
              content={state.listing.title} 
              type="text" 
            />
            
            <ListingCard 
              title="5 Key Feature Bullets" 
              content={state.listing.bullets} 
              type="list" 
            />

            <ListingCard 
              title="Product Description" 
              content={state.listing.description} 
              type="text" 
            />

            <ListingCard 
              title="Backend Search Terms" 
              content={state.listing.searchTerms} 
              type="text" 
            />

            <div className="mt-12 p-6 bg-orange-50 rounded-xl border border-orange-100">
              <h4 className="text-orange-800 font-bold mb-2">💡 Pro Tip</h4>
              <p className="text-orange-700 text-sm">
                For best results, always review the generated copy to ensure it aligns with your brand voice. Amazon's A10 algorithm values relevance and high click-through rates.
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-gray-200 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} AmzListing Optimizer. Powered by Gemini.</p>
      </footer>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default App;