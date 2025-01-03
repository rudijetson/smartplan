import React from 'react';
import { Heart } from 'lucide-react';

const Header = () => {
  return (
    <header className="text-center py-6 space-y-2">
      <h1 className="text-3xl font-bold text-gray-900">
        Business Plan Financial Calculators
      </h1>
      <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
        Built with <Heart className="h-4 w-4 text-red-500 fill-current" /> by{' '}
        <a 
          href="https://bzhoff.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          bzhoff
        </a>
      </p>
    </header>
  );
};

export default Header;
