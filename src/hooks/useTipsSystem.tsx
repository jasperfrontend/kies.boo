import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTipsVisibility } from './useTipsVisibility';
import tipsConfig from '@/data/tips.json';

interface Tip {
  id: string;
  text: string;
  contexts: string[];
}

type PageContext = 'dashboard' | 'hub' | 'search' | 'profile' | 'tags';

const SHOWN_TIPS_KEY = 'shown_tips';
const TIP_ROTATION_INTERVAL = 30000; // 30 seconds

export const useTipsSystem = () => {
  const { showTips } = useTipsVisibility();
  const location = useLocation();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [shownTips, setShownTips] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(SHOWN_TIPS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Determine current page context
  const currentContext: PageContext = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/hub') return 'hub';
    if (path === '/search') return 'search';
    if (path === '/profile') return 'profile';
    if (path === '/tags') return 'tags';
    return 'dashboard'; // Default fallback
  }, [location.pathname]);

  // Filter tips relevant to current context
  const contextualTips = useMemo(() => {
    return (tipsConfig.tips as Tip[]).filter(tip => 
      tip.contexts.includes(currentContext)
    );
  }, [currentContext]);

  // Get current tip
  const currentTip = useMemo(() => {
    if (contextualTips.length === 0) return null;
    return contextualTips[currentTipIndex % contextualTips.length];
  }, [contextualTips, currentTipIndex]);

  // Rotate tips automatically
  useEffect(() => {
    if (!showTips || contextualTips.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % contextualTips.length);
    }, TIP_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [showTips, contextualTips.length]);

  // Mark tip as shown and persist to localStorage
  const markTipAsShown = (tipId: string) => {
    const newShownTips = new Set([...shownTips, tipId]);
    setShownTips(newShownTips);
    localStorage.setItem(SHOWN_TIPS_KEY, JSON.stringify([...newShownTips]));
  };

  // Reset shown tips (useful for debugging or user preference)
  const resetShownTips = () => {
    setShownTips(new Set());
    localStorage.removeItem(SHOWN_TIPS_KEY);
  };

  // Get a random tip from contextual tips (alternative to rotation)
  const getRandomTip = () => {
    if (contextualTips.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * contextualTips.length);
    return contextualTips[randomIndex];
  };

  // Navigate to next tip manually
  const nextTip = () => {
    if (contextualTips.length > 1) {
      setCurrentTipIndex(prev => (prev + 1) % contextualTips.length);
    }
  };

  // Navigate to previous tip manually
  const previousTip = () => {
    if (contextualTips.length > 1) {
      setCurrentTipIndex(prev => 
        prev === 0 ? contextualTips.length - 1 : prev - 1
      );
    }
  };

  return {
    showTips,
    currentTip,
    currentContext,
    contextualTips,
    totalTips: contextualTips.length,
    currentTipIndex: currentTipIndex % contextualTips.length,
    shownTips,
    markTipAsShown,
    resetShownTips,
    getRandomTip,
    nextTip,
    previousTip,
    hasMultipleTips: contextualTips.length > 1
  };
};