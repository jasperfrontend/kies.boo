
import React from 'react';

export const HeaderLogo: React.FC = () => {
  return (
    <div className="flex flex-col">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        Kies.boo
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 -mt-1">
        Bookmarks for nerds
      </p>
    </div>
  );
};
