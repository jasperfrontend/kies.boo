import React, { useMemo } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCompactMode } from '@/hooks/useCompactMode';
import { useViewMode } from '@/hooks/useViewMode';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { BookmarkDisplay } from '@/components/BookmarkDisplay';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { BookmarkDetailsDialog } from '@/components/BookmarkDetailsDialog';
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

interface SmartCollection {
  id: string;
  title: string;
  type: string;
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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingBookmark, setEditingBookmark] = React.useState<Bookmark | null>(null);
  const [showFavorites, setShowFavorites] = React.useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = React.useState<string[]>([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [detailsBookmark, setDetailsBookmark] = React.useState<Bookmark | null>(null);
  const [detailsCollection, setDetailsCollection] = React.useState<SmartCollection | null>(null);
  const navigate = useNavigate();

  // Debounced redirect to search when searchQuery changes
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, navigate]);

  // Add keyboard shortcut handler
  React.useEffect(() => {
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

  const handleViewDetails = async (bookmark: Bookmark) => {
    setDetailsBookmark(bookmark);
    
    // Fetch the collection this bookmark belongs to
    if (user) {
      try {
        const { data, error } = await supabase
          .from('collection_bookmarks')
          .select(`
            collection_id,
            smart_collections (
              id,
              title,
              type
            )
          `)
          .eq('bookmark_id', bookmark.id)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching collection:', error);
          setDetailsCollection(null);
        } else if (data && data.smart_collections) {
          setDetailsCollection({
            id: data.smart_collections.id,
            title: data.smart_collections.title,
            type: data.smart_collections.type
          });
        } else {
          setDetailsCollection(null);
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        setDetailsCollection(null);
      }
    }
    
    setIsDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setIsDetailsDialogOpen(false);
    setDetailsBookmark(null);
    setDetailsCollection(null);
  };

  const handleDetailsLinkOpen = () => {
    if (detailsBookmark) {
      handleUpdateLastVisited(detailsBookmark.id);
    }
  };

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
          onViewDetails={handleViewDetails}
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

      <BookmarkDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={handleDetailsDialogClose}
        bookmark={detailsBookmark}
        currentCollection={detailsCollection}
        onOpenLink={handleDetailsLinkOpen}
      />
    </div>
  );
};

export default Dashboard;