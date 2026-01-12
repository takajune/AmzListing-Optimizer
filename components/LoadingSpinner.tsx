
import React, { useState, useEffect } from 'react';

const messages = [
  "Analyzing product mockup...",
  "Extracting key features...",
  "Optimizing for Amazon SEO...",
  "Generating compelling copy...",
  "Creating backend search terms...",
  "Finalizing your listing..."
];

const LoadingSpinner: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-200 rounded-full animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-4 border-orange-600 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium animate-fade-in text-lg">
        {messages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingSpinner;
