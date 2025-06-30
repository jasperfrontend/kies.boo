import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTipsVisibility } from './useTipsVisibility';

interface Tip {
  id: string;
  text: string;
  contexts: string[];
}

type PageContext = 'dashboard' | 'hub' | 'search' | 'profile' | 'tags';

const SHOWN_TIPS_KEY = 'shown_tips';
const TIP_ROTATION_INTERVAL = 30000; // 30 seconds

// Embedded tips data since JSON import might cause issues
const tipsData: { tips: Tip[] } = {
  "tips": [
    {
      "id": "double-click-open",
      "text": "Double-click any bookmark card or table row to open the link in a new tab!",
      "contexts": ["dashboard", "hub", "search"]
    },
    {
      "id": "keyboard-shortcut",
      "text": "Press Alt+A to quickly add a new bookmark from anywhere in the app.",
      "contexts": ["dashboard", "hub", "search"]
    },
    {
      "id": "tag-search",
      "text": "Click on any tag to instantly search for all bookmarks with that tag.",
      "contexts": ["dashboard", "hub"]
    },
    {
      "id": "bulk-operations",
      "text": "In table view, use checkboxes to select multiple bookmarks for bulk deletion.",
      "contexts": ["dashboard", "hub"]
    },
    {
      "id": "smart-collections",
      "text": "The Smart Hub automatically groups related bookmarks using AI - check it out!",
      "contexts": ["dashboard"]
    },
    {
      "id": "forgotten-bookmarks",
      "text": "Visit the Smart Hub to rediscover bookmarks you haven't used in a while.",
      "contexts": ["dashboard"]
    },
    {
      "id": "clipboard-detection",
      "text": "When adding bookmarks, URLs in your clipboard are automatically detected and filled in.",
      "contexts": ["dashboard", "hub"]
    },
    {
      "id": "import-bookmarks",
      "text": "You can import bookmarks from Firefox, Chrome, or Edge using HTML export files in your profile settings.",
      "contexts": ["dashboard", "profile"]
    },
    {
      "id": "compact-mode",
      "text": "Toggle compact mode to fit more bookmarks on your screen at once.",
      "contexts": ["dashboard", "hub"]
    },
    {
      "id": "favorites-filter",
      "text": "Use the favorites filter to quickly find your most important bookmarks.",
      "contexts": ["dashboard"]
    },
    {
      "id": "auto-title-extraction",
      "text": "When adding bookmarks, titles are automatically extracted from the webpage for convenience.",
      "contexts": ["dashboard", "hub"]
    },
    {
      "id": "tag-management",
      "text": "Visit the tag management page to rename or delete tags across all your bookmarks.",
      "contexts": ["profile"]
    },
    {
      "id": "search-everything",
      "text": "The search function looks through titles, URLs, descriptions, and tags to find what you need.",
      "contexts": ["search"]
    },
    {
      "id": "collection-saving",
      "text": "Save your search results as a smart collection for easy access later.",
      "contexts": ["search"]
    },
    {
      "id": "random-bookmark",
      "text": "Check out the random bookmark section in Smart Hub to rediscover forgotten gems.",
      "contexts": ["hub"]
    },
    {
      "id": "dark-mode",
      "text": "Toggle dark mode in your profile settings for comfortable viewing in low light.",
      "contexts": ["profile"]
    },
    {
      "id": "pagination-control",
      "text": "Adjust how many bookmarks are shown per page, or view all at once using the pagination controls.",
      "contexts": ["dashboard", "hub"]
    },
    {
      "id": "view-modes",
      "text": "Switch between grid and table view to find the layout that works best for you.",
      "contexts": ["dashboard", "hub"]
    }
  ]
};

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
    return tipsData.tips.filter(tip => 
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
    setCurrentTipIndex(0); // Reset to first tip
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