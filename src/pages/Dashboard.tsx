
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { BookmarkFilters } from '@/components/BookmarkFilters';
import { BookmarkDisplay } from '@/components/BookmarkDisplay';
import { useBookmarks } from '@/hooks/useBookmarks';
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

export const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [compactMode, setCompactMode] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const navigate = useNavigate();

  const {
    bookmarks,
    loading,
    fetchBookmarks,
    handleSave,
    handleDelete,
    handleBulkDelete,
    handleToggleFavorite
  } = useBookmarks();

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

  // Debounced redirect to search when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const delayedSearch = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }, 1000);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, navigate]);

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsDialogOpen(true);
  };

  const handleBookmarkSave = async (bookmark: Bookmark) => {
    await handleSave(bookmark);
    setIsDialogOpen(false);
    setEditingBookmark(null);
  };

  const handleSelectionChange = (bookmarkIds: string[]) => {
    setSelectedBookmarks(bookmarkIds);
  };

  const handleBulkDeleteClick = async () => {
    await handleBulkDelete(selectedBookmarks);
    setSelectedBookmarks([]);
  };

  const handleApiKeysClick = () => {
    setShowApiKeys(!showApiKeys);
  };

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (filter === 'favorites') {
      return bookmark.is_favorite;
    }
    return true;
  });

  const favoriteCount = bookmarks.filter((bookmark) => bookmark.is_favorite).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onAddBookmark={() => setIsDialogOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        compactMode={compactMode}
        onCompactModeChange={setCompactMode}
        showFavorites={filter === 'favorites'}
        onShowFavoritesChange={(show) => setFilter(show ? 'favorites' : 'all')}
        onBookmarkAdded={fetchBookmarks}
        onSeedBookmarksAdded={fetchBookmarks}
        onSeedFeatureRemoved={() => {}}
        bookmarkCount={bookmarks.length}
        favoritesCount={favoriteCount}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showApiKeys ? (
          <ApiKeyManager />
        ) : (
          <div className="space-y-6">
            <BookmarkDisplay
              bookmarks={filteredBookmarks}
              viewMode={viewMode}
              compactMode={compactMode}
              loading={loading}
              searchQuery=""
              selectedBookmarks={selectedBookmarks}
              onSelectionChange={handleSelectionChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
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
