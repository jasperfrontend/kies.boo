// src/pages/Dashboard.tsx (Updated)
import React, { useMemo } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAppLayout } from '@/hooks/useAppLayout';
import { AppHeader } from '@/components/AppHeader';
import { BookmarkDisplay } from '@/components/BookmarkDisplay';
import { BookmarkDialog } from '@/components/BookmarkDialog';

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
  
  // Use the app layout hook with dashboard-specific options
  const {
    isDialogOpen,
    setIsDialogOpen,
    viewMode,
    compactMode,
    showFavorites,

  } = useAppLayout({
    enableBookmarkDialog: true,
    enableSearch: true,
    enableViewControls: true,
    enableFavoritesFilter: true,
    redirectSearchToResults: true
  });

  const [editingBookmark, setEditingBookmark] = React.useState<Bookmark | null>(null);
  const [selectedBookmarks, setSelectedBookmarksState] = React.useState<string[]>([]);

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
    setSelectedBookmarksState(bookmarkIds);
  };

  const handleBulkDeleteClick = async () => {
    handleBulkDelete(selectedBookmarks);
    setSelectedBookmarksState([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader variant="dashboard" />
      
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