
import React, { useState, useMemo, useEffect } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useSmartCollections } from '@/hooks/useSmartCollections';
import { useCompactMode } from '@/hooks/useCompactMode';
import { Header } from '@/components/Header';
import { BookmarkTable } from '@/components/BookmarkTable';
import { BookmarkCard } from '@/components/BookmarkCard';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { SmartCollectionEditDialog } from '@/components/SmartCollectionEditDialog';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { CollectionCard } from '@/components/CollectionCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trash2, Clock, Star, Shuffle, Brain } from 'lucide-react';
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

const Hub: React.FC = () => {
  const { bookmarks, loading, handleDelete, handleBulkDelete, handleToggleFavorite, handleSave, fetchBookmarks } = useBookmarks();
  const { smartCollections, loading: collectionsLoading, deleteSmartCollection, updateSmartCollection } = useSmartCollections(bookmarks);
  const { compactMode, setCompactMode } = useCompactMode();
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [oldBookmarksDays, setOldBookmarksDays] = useState<string>('100');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isCollectionEditDialogOpen, setIsCollectionEditDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<{ id: string; title: string } | null>(null);
  
  const navigate = useNavigate();

  // Debounced redirect to search when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const delayedSearch = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }, 1000);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, navigate]);

  // Get recent bookmarks (last 5)
  const recentBookmarks = useMemo(() => {
    return [...bookmarks]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [bookmarks]);

  // Get old bookmarks based on selected days
  const oldBookmarks = useMemo(() => {
    const days = parseInt(oldBookmarksDays);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return bookmarks.filter(bookmark => {
      const bookmarkDate = new Date(bookmark.created_at);
      return bookmarkDate < cutoffDate;
    });
  }, [bookmarks, oldBookmarksDays]);

  // Get one random bookmark
  const randomBookmark = useMemo(() => {
    if (bookmarks.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * bookmarks.length);
    return bookmarks[randomIndex];
  }, [bookmarks]);

  const handleBulkDeleteSelected = () => {
    handleBulkDelete(selectedBookmarks);
    setSelectedBookmarks([]);
  };

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

  const handleEditCollection = (collectionId: string, newTitle: string) => {
    const collection = smartCollections.find(c => c.id === collectionId);
    if (collection) {
      setEditingCollection({ id: collectionId, title: collection.title });
      setIsCollectionEditDialogOpen(true);
    }
  };

  const handleCollectionSave = async (collectionId: string, newTitle: string) => {
    await updateSmartCollection(collectionId, newTitle);
    setIsCollectionEditDialogOpen(false);
    setEditingCollection(null);
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

  if (loading || collectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          onAddBookmark={() => setIsDialogOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onApiKeysClick={handleApiKeysClick}
          showApiKeys={showApiKeys}
          compactMode={compactMode}
          onCompactModeChange={setCompactMode}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          onAddBookmark={() => setIsDialogOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSeedBookmarksAdded={fetchBookmarks}
          onSeedFeatureRemoved={() => {}}
          compactMode={compactMode}
          onCompactModeChange={setCompactMode}
          bookmarkCount={bookmarks.length}
          favoritesCount={bookmarks.filter(b => b.is_favorite).length}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showApiKeys ? (
            <ApiKeyManager />
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Hub</h1>
                <Badge variant="secondary" className="text-sm">
                  {bookmarks.length} total bookmarks
                </Badge>
              </div>

              {/* Smart Collections Section */}
              {smartCollections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Brain className="h-5 w-5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>AI-generated collections based on bookmark patterns</p>
                        </TooltipContent>
                      </Tooltip>
                      Smart Collections
                      <Badge variant="outline">{smartCollections.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {smartCollections.map((collection) => (
                        <CollectionCard
                          key={collection.id}
                          collection={collection}
                          compactMode={compactMode}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleFavorite={handleToggleFavorite}
                          onDeleteCollection={deleteSmartCollection}
                          onEditCollection={handleEditCollection}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Bookmarks Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Clock className="h-5 w-5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your most recently saved bookmarks</p>
                      </TooltipContent>
                    </Tooltip>
                    Recent Bookmarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentBookmarks.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No bookmarks yet.</p>
                  ) : (
                    <div className={`grid gap-4 ${compactMode ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                      {recentBookmarks.map((bookmark) => (
                        <BookmarkCard
                          key={bookmark.id}
                          bookmark={bookmark}
                          compact={compactMode}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Old Bookmarks Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Star className="h-5 w-5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Bookmarks you haven't visited in a while - rediscover them!</p>
                        </TooltipContent>
                      </Tooltip>
                      Forgotten Bookmarks
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Not visited in:</span>
                      <Select value={oldBookmarksDays} onValueChange={setOldBookmarksDays}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="100">100 days</SelectItem>
                          <SelectItem value="365">365 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedBookmarks.length > 0 && (
                    <div className="mb-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleBulkDeleteSelected}
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete {selectedBookmarks.length} Selected
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete all selected bookmarks permanently</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                  
                  {oldBookmarks.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">
                      No bookmarks older than {oldBookmarksDays} days found.
                    </p>
                  ) : (
                    <BookmarkTable
                      bookmarks={oldBookmarks}
                      selectedBookmarks={selectedBookmarks}
                      onSelectionChange={setSelectedBookmarks}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Random Bookmark Section */}
              {randomBookmark && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Shuffle className="h-5 w-5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>A randomly selected bookmark from your collection</p>
                        </TooltipContent>
                      </Tooltip>
                      Random Bookmark
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-w-md">
                      <BookmarkCard
                        bookmark={randomBookmark}
                        compact={compactMode}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
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

        <SmartCollectionEditDialog
          open={isCollectionEditDialogOpen}
          onOpenChange={(open) => {
            setIsCollectionEditDialogOpen(open);
            if (!open) {
              setEditingCollection(null);
            }
          }}
          collection={editingCollection}
          onSave={handleCollectionSave}
        />
      </div>
    </TooltipProvider>
  );
};

export default Hub;
