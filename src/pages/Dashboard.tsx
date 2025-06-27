import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { BookmarkCard } from '@/components/BookmarkCard';
import { BookmarkTable } from '@/components/BookmarkTable';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const initialBookmarkState: Bookmark = {
  id: '',
  title: '',
  url: '',
  description: '',
  favicon_url: '',
  tags: [],
  is_favorite: false,
  created_at: '',
};

export const Dashboard = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState('bookmarks');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookmarks",
        variant: "destructive"
      });
    } else {
      setBookmarks(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (bookmark: Bookmark) => {
    if (!user) return;

    setLoading(true);
    const isNew = !bookmark.id;
    const payload = {
      ...bookmark,
      user_id: user.id,
    };

    let result;
    if (isNew) {
      result = await supabase
        .from('bookmarks')
        .insert([payload])
        .select('*')
        .single();
    } else {
      result = await supabase
        .from('bookmarks')
        .update(payload)
        .eq('id', bookmark.id)
        .select('*')
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error('Error saving bookmark:', error);
      toast({
        title: "Error",
        description: `Failed to ${isNew ? 'create' : 'update'} bookmark`,
        variant: "destructive"
      });
    } else {
      fetchBookmarks();
      setIsDialogOpen(false);
      setEditingBookmark(null);
      toast({
        title: "Success",
        description: `Bookmark ${isNew ? 'created' : 'updated'} successfully`,
      });
    }
    setLoading(false);
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to delete bookmark",
        variant: "destructive"
      });
    } else {
      fetchBookmarks();
      toast({
        title: "Success",
        description: "Bookmark deleted successfully",
      });
    }
    setLoading(false);
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    setLoading(true);
    const { error } = await supabase
      .from('bookmarks')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to toggle favorite status",
        variant: "destructive"
      });
    } else {
      fetchBookmarks();
      toast({
        title: "Success",
        description: "Favorite status toggled successfully",
      });
    }
    setLoading(false);
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
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="bookmarks" className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All <Badge variant="secondary" className="ml-2">{bookmarks.length}</Badge>
                  </Button>
                  <Button
                    variant={filter === 'favorites' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('favorites')}
                  >
                    Favorites <Badge variant="secondary" className="ml-2">{favoriteCount}</Badge>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bookmarks Display */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No bookmarks found matching your search.' : 'No bookmarks yet. Add your first bookmark!'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <BookmarkTable
                bookmarks={filteredBookmarks}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </TabsContent>

          <TabsContent value="api">
            <ApiKeyManager />
          </TabsContent>
        </Tabs>
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
        onSave={handleSave}
      />
    </div>
  );
};
