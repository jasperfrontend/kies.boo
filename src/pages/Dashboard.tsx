import React, { useState, useMemo, useEffect } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCompactMode } from '@/hooks/useCompactMode';
import { useViewMode } from '@/hooks/useViewMode';
import { Header } from '@/components/Header';
import { BookmarkDisplay } from '@/components/BookmarkDisplay';
import { BookmarkDialog } from '@/components/BookmarkDialog';
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

interface CollectionData {
  collectionId?: string;
  newCollectionTitle?: string;
  removeFromCollection?: boolean;
}

export const Dashboard: React.FC = () => {
  const { bookmarks, loading, handleDelete, handleBulkDelete, handleToggleFavorite, handleSave, handleUpdateLastVisited } = useBookmarks();
  const { compactMode, setCompactMode } = useCompactMode();
  const { viewMode, setViewMode } = useViewMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const navigate = useNavigate();

  // Debounced redirect to search when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, navigate]);

  const filteredBookmarks = useMemo(() => {
    let filtered = [...bookmarks];

    if (showFavorites) {
      filtered = filtered.filter(bookmark => bookmark.is_favorite);
    }

    return filtered;
  }, [bookmarks, showFavorites]);

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsDialogOpen(true);
  };

  const handleBookmarkSave = async (
    bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }, 
    collectionData?: CollectionData
  ) => {
    console.log('Dashboard handleBookmarkSave called with:', { bookmarkData, collectionData });
    handleSave(bookmarkData, collectionData);
    setIsDialogOpen(false);
    setEditingBookmark(null);
  };

  const handleSelectionChange = (bookmarkIds: string[]) => {
    setSelectedBookmarks(bookmarkIds);
  };

  const handleBulkDeleteClick = async () => {
    handleBulkDelete(selectedBookmarks);
    setSelectedBookmarks([]);
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
        <BookmarkDisplay
          bookmarks={filteredBookmarks}
          viewMode={viewMode}
          compactMode={compactMode}
          loading={loading}
          searchQuery=""
          selectedBookmarks={selectedBookmarks}
          onSelectionChange={handleSelectionChange}
          onBulkDelete={handleBulkDeleteClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
          onUpdateLastVisited={handleUpdateLastVisited}
        />
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
        existingBookmarks={bookmarks}
        onSave={handleBookmarkSave}
      />
    </div>
  );
};

export default Dashboard;