// src/hooks/useAppLayout.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCompactMode } from '@/hooks/useCompactMode';
import { useViewMode } from '@/hooks/useViewMode';

interface UseAppLayoutOptions {
  enableBookmarkDialog?: boolean;
  enableSearch?: boolean;
  enableViewControls?: boolean;
  enableFavoritesFilter?: boolean;
  redirectSearchToResults?: boolean;
}

export const useAppLayout = (options: UseAppLayoutOptions = {}) => {
  const {
    enableBookmarkDialog = true,
    enableSearch = true,
    enableViewControls = false,
    enableFavoritesFilter = false,
    redirectSearchToResults = true
  } = options;

  const { bookmarks } = useBookmarks();
  const { compactMode, setCompactMode } = useCompactMode();
  const { viewMode, setViewMode } = useViewMode();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // Keyboard shortcut for adding bookmarks
  useEffect(() => {
    if (!enableBookmarkDialog) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setIsDialogOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableBookmarkDialog]);

  // Search redirect with debounce
  useEffect(() => {
    if (!enableSearch || !redirectSearchToResults || !searchQuery.trim()) return;

    const timeoutId = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, navigate, enableSearch, redirectSearchToResults]);

  const favoritesCount = bookmarks.filter(b => b.is_favorite).length;

  const headerProps = {
    onAddBookmark: enableBookmarkDialog ? () => setIsDialogOpen(true) : undefined,
    searchQuery: enableSearch ? searchQuery : '',
    onSearchChange: enableSearch ? setSearchQuery : () => {},
    viewMode: enableViewControls ? viewMode : undefined,
    onViewModeChange: enableViewControls ? setViewMode : undefined,
    compactMode: enableViewControls ? compactMode : undefined,
    onCompactModeChange: enableViewControls ? setCompactMode : undefined,
    showFavorites: enableFavoritesFilter ? showFavorites : undefined,
    onShowFavoritesChange: enableFavoritesFilter ? setShowFavorites : undefined,
    bookmarkCount: bookmarks.length,
    favoritesCount
  };

  return {
    // Header props
    headerProps,
    
    // Dialog state
    isDialogOpen,
    setIsDialogOpen,
    
    // Search state
    searchQuery,
    setSearchQuery,
    
    // View state
    viewMode,
    setViewMode,
    compactMode,
    setCompactMode,
    showFavorites,
    setShowFavorites,
    
    // Computed values
    bookmarks,
    favoritesCount
  };
};