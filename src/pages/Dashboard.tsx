
import React, { useState, useMemo, useEffect } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCompactMode } from '@/hooks/useCompactMode';
import { Header } from '@/components/Header';
import { BookmarkDisplay } from '@/components/BookmarkDisplay';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { useNavigate } from 'react-router-dom';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export const Dashboard: React.FC = () => {
  const { bookmarks, loading, handleDelete, handleToggleFavorite, handleSave, fetchBookmarks } = useBookmarks();
  const { compactMode, setCompactMode } = useCompactMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFavorites, setShowFavorites] = useState(false);

  const navigate = useNavigate();

  // Debounced redirect to search when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const delayedSearch = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }, 1000);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, navigate]);

  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(lowerCaseQuery) ||
        bookmark.description?.toLowerCase().includes(lowerCaseQuery) ||
        bookmark.url.toLowerCase().includes(lowerCaseQuery) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
      );
    }

    if (showFavorites) {
      filtered = filtered.filter(bookmark => bookmark.is_favorite);
    }

    return filtered;
  }, [bookmarks, searchQuery, showFavorites]);

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsDialogOpen(true);
  };

  const handleBookmarkSave = async (bookmark: Bookmark) => {
    await handleSave(bookmark);
    setIsDialogOpen(false);
    setEditingBookmark(null);
  };

  const handleApiKeysClick = () => {
    setShowApiKeys(!showApiKeys);
  };

  // Add keyboard shortcut handler
  useEffect(() => {
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
  }, []);

  const favoritesCount = bookmarks.filter(b => b.is_favorite).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onAddBookmark={() => setIsDialogOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onApiKeysClick={handleApiKeysClick}
        showApiKeys={showApiKeys}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        compactMode={compactMode}
        onCompactModeChange={setCompactMode}
        showFavorites={showFavorites}
        onShowFavoritesChange={setShowFavorites}
        bookmarkCount={bookmarks.length}
        favoritesCount={favoritesCount}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showApiKeys ? (
          <ApiKeyManager />
        ) : (
          <BookmarkDisplay
            bookmarks={filteredBookmarks}
            viewMode={viewMode}
            compactMode={compactMode}
            loading={loading}
            searchQuery={searchQuery}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      <BookmarkDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingBookmark(null);
          }
        }}
        bookmark={editingBookmark}
        onSave={handleBookmarkSave}
      />
    </div>
  );
};
