
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { BookmarkFilters } from '@/components/BookmarkFilters';
import { BookmarkDisplay } from '@/components/BookmarkDisplay';
import { useBookmarks } from '@/hooks/useBookmarks';

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
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);

  const {
    bookmarks,
    loading,
    fetchBookmarks,
    handleSave,
    handleDelete,
    handleBulkDelete,
    handleToggleFavorite
  } = useBookmarks();

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
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchTerm) ||
      bookmark.url.toLowerCase().includes(searchTerm) ||
      (bookmark.description?.toLowerCase().includes(searchTerm) ?? false) ||
      bookmark.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

    if (filter === 'favorites') {
      return bookmark.is_favorite && matchesSearch;
    }

    return matchesSearch;
  });

  const favoriteCount = bookmarks.filter((bookmark) => bookmark.is_favorite).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onAddBookmark={() => setIsDialogOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onApiKeysClick={handleApiKeysClick}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showApiKeys ? (
          <ApiKeyManager />
        ) : (
          <div className="space-y-6">
            <BookmarkFilters
              filter={filter}
              setFilter={setFilter}
              viewMode={viewMode}
              setViewMode={setViewMode}
              totalCount={bookmarks.length}
              favoriteCount={favoriteCount}
              onBookmarksAdded={fetchBookmarks}
              selectedBookmarks={selectedBookmarks}
              onBulkDelete={handleBulkDeleteClick}
            />

            <BookmarkDisplay
              bookmarks={filteredBookmarks}
              viewMode={viewMode}
              loading={loading}
              searchQuery={searchQuery}
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
