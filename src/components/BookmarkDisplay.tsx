
import React from 'react';
import { BookmarkCard } from '@/components/BookmarkCard';
import { BookmarkTable } from '@/components/BookmarkTable';
import { BookmarkFilters } from '@/components/BookmarkFilters';
import { PaginationControls } from '@/components/PaginationControls';
import { useTipsVisibility } from '@/hooks/useTipsVisibility';
import { usePagination } from '@/hooks/usePagination';
import { Info, X } from 'lucide-react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  last_visited_at?: string;
}

interface BookmarkDisplayProps {
  bookmarks: Bookmark[];
  viewMode: 'grid' | 'table';
  compactMode?: boolean;
  loading: boolean;
  searchQuery: string;
  selectedBookmarks?: string[];
  onSelectionChange?: (bookmarkIds: string[]) => void;
  onBulkDelete?: () => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onUpdateLastVisited?: (id: string) => void;
}

export const BookmarkDisplay: React.FC<BookmarkDisplayProps> = ({
  bookmarks,
  viewMode,
  compactMode = false,
  loading,
  searchQuery,
  selectedBookmarks = [],
  onSelectionChange = () => {},
  onBulkDelete,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateLastVisited
}) => {
  const { showTips, toggleTips } = useTipsVisibility();
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    paginatedItems,
    goToPage,
    changeItemsPerPage,
  } = usePagination({
    totalItems: bookmarks.length,
    initialItemsPerPage: 20,
  });

  const displayedBookmarks = paginatedItems(bookmarks);

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

  return (
    <div className="space-y-4">
      {/* Top pagination controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={bookmarks.length}
        onPageChange={goToPage}
        onItemsPerPageChange={changeItemsPerPage}
        startIndex={startIndex}
        endIndex={endIndex}
      />

      {viewMode === 'table' && (
        <BookmarkFilters
          filter="all"
          setFilter={() => {}}
          viewMode={viewMode}
          setViewMode={() => {}}
          totalCount={bookmarks.length}
          favoriteCount={bookmarks.filter(b => b.is_favorite).length}
          onBookmarksAdded={() => {}}
          selectedBookmarks={selectedBookmarks}
          onBulkDelete={onBulkDelete}
        />
      )}

      {showTips && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300 flex-1">
            <span className="font-medium">Pro tip:</span> Double-click any{' '}
            <span className="font-semibold bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">
              {viewMode === 'grid' ? 'card' : 'table row'}
            </span>{' '}
            to open the link in a new tab!
          </p>
          <button
            onClick={() => toggleTips(false)}
            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
            aria-label="Close tip"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className={`grid gap-4 ${compactMode ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {displayedBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              compact={compactMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onUpdateLastVisited={onUpdateLastVisited}
            />
          ))}
        </div>
      ) : (
        <BookmarkTable
          bookmarks={displayedBookmarks}
          selectedBookmarks={selectedBookmarks}
          onSelectionChange={onSelectionChange}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onUpdateLastVisited={onUpdateLastVisited}
        />
      )}

      {/* Bottom pagination controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={bookmarks.length}
        onPageChange={goToPage}
        onItemsPerPageChange={changeItemsPerPage}
        startIndex={startIndex}
        endIndex={endIndex}
      />
    </div>
  );
};
