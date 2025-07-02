import React from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Footer } from '@/components/Footer';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <AppHeader variant="simple" />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Terms of Use
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Lorem ipsum dolor sit amet.
        </p>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;