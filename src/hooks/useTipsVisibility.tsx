
import { useState, useEffect } from 'react';

const TIPS_VISIBILITY_KEY = 'bookmarks_tips_visible';

export const useTipsVisibility = () => {
  const [showTips, setShowTips] = useState(() => {
    const stored = localStorage.getItem(TIPS_VISIBILITY_KEY);
    return stored === null ? true : stored === 'true';
  });

  const toggleTips = (visible: boolean) => {
    setShowTips(visible);
    localStorage.setItem(TIPS_VISIBILITY_KEY, visible.toString());
  };

  return {
    showTips,
    toggleTips
  };
};
