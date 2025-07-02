import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-4">
          <span>© {currentYear} Snapcrowd</span>
          <span className="text-gray-400">•</span>
          <Link 
            to="/about" 
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            About
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            to="/privacy" 
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Privacy
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            to="/terms" 
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};