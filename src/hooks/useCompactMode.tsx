
import { useState, useEffect } from 'react';

export const useCompactMode = () => {
  const [compactMode, setCompactMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bookmarkCompactMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('bookmarkCompactMode', JSON.stringify(compactMode));
  }, [compactMode]);

  return { compactMode, setCompactMode };
};
