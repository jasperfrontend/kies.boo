
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Header } from '@/components/Header';
import { BookmarkDisplay } from '@/components/BookmarkDisplay';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Bookmark, SmartCollection } from '@/types/smartCollections';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { bookmarks, loading, handleDelete, handleToggleFavorite, handleSave } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState(query);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [savingCollection, setSavingCollection] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Filter bookmarks based on search query
  const filteredBookmarks = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return bookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(searchTerm) ||
      bookmark.url.toLowerCase().includes(searchTerm) ||
      bookmark.description?.toLowerCase().includes(searchTerm) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }, [bookmarks, query]);

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

  const handleSaveAsCollection = async () => {
    if (!user || filteredBookmarks.length === 0) return;

    setSavingCollection(true);
    try {
      // Create the smart collection
      const { data: collection, error: collectionError } = await supabase
        .from('smart_collections')
        .insert({
          title: `Search Results: "${query}"`,
          type: 'search',
          confidence: 1.0,
          keywords: [query],
          user_id: user.id
        })
        .select()
        .single();

      if (collectionError) throw collectionError;

      // Add bookmarks to the collection
      const collectionBookmarks = filteredBookmarks.map(bookmark => ({
        collection_id: collection.id,
        bookmark_id: bookmark.id
      }));

      const { error: bookmarkError } = await supabase
        .from('collection_bookmarks')
        .insert(collectionBookmarks);

      if (bookmarkError) throw bookmarkError;

      toast({
        title: "Success",
        description: `Saved ${filteredBookmarks.length} bookmarks as a smart collection`,
      });
    } catch (error) {
      console.error('Error saving collection:', error);
      toast({
        title: "Error",
        description: "Failed to save collection",
        variant: "destructive"
      });
    } finally {
      setSavingCollection(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          onAddBookmark={() => setIsDialogOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onApiKeysClick={handleApiKeysClick}
          showApiKeys={showApiKeys}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onAddBookmark={() => setIsDialogOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onApiKeysClick={handleApiKeysClick}
        showApiKeys={showApiKeys}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showApiKeys ? (
          <ApiKeyManager />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Link to="/hub">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Hub
                </Button>
              </Link>
              
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-gray-500" />
                <h1 className="text-2xl font-bold">Search Results</h1>
              </div>
            </div>

            {query && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Results for "{query}"
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {filteredBookmarks.length} result{filteredBookmarks.length !== 1 ? 's' : ''}
                      </Badge>
                      {filteredBookmarks.length > 0 && (
                        <Button
                          onClick={handleSaveAsCollection}
                          disabled={savingCollection}
                          size="sm"
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {savingCollection ? 'Saving...' : 'Save as Collection'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <BookmarkDisplay
                    bookmarks={filteredBookmarks}
                    viewMode="grid"
                    loading={false}
                    searchQuery={query}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </CardContent>
              </Card>
            )}

            {!query && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Start searching
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Use the search bar above to find your bookmarks by title, URL, description, or tags.
                  </p>
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
    </div>
  );
};

export default SearchResults;
