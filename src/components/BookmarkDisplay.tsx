
import React from 'react';
import { BookmarkCard } from '@/components/BookmarkCard';
import { BookmarkTable } from '@/components/BookmarkTable';

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

interface BookmarkDisplayProps {
  bookmarks: Bookmark[];
  viewMode: 'grid' | 'table';
  loading: boolean;
  searchQuery: string;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

export const BookmarkDisplay: React.FC<BookmarkDisplayProps> = ({
  bookmarks,
  viewMode,
  loading,
  searchQuery,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery ? 'No bookmarks found matching your search.' : 'No bookmarks yet. Add your first bookmark!'}
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    );
  }

  return (
    <BookmarkTable
      bookmarks={bookmarks}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleFavorite={onToggleFavorite}
    />
  );
};
