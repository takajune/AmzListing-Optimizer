
import React, { useState } from 'react';

interface ListingCardProps {
  title: string;
  content: string | string[];
  type: 'text' | 'list';
}

const ListingCard: React.FC<ListingCardProps> = ({ title, content, type }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = Array.isArray(content) ? content.join('\n') : content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{title}</h3>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            copied ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="p-6">
        {type === 'text' ? (
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <ul className="space-y-3">
            {(content as string[]).map((bullet, idx) => (
              <li key={idx} className="flex gap-3 text-gray-800 leading-relaxed">
                <span className="text-orange-500 font-bold">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
