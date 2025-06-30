
import { useState, useEffect } from 'react';

type ViewMode = 'grid' | 'table';

export const useViewMode = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Get initial value from localStorage or default to 'grid'
    const saved = localStorage.getItem('dashboard-view-mode');
    return (saved as ViewMode) || 'grid';
  });

  // Save to localStorage whenever viewMode changes
  useEffect(() => {
    localStorage.setItem('dashboard-view-mode', viewMode);
  }, [viewMode]);

  return {
    viewMode,
    setViewMode
  };
};
