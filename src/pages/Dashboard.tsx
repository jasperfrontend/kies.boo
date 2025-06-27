
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { BookmarkCard } from '@/components/BookmarkCard';
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

export const Dashboard = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  useEffect(() => {
    // Filter bookmarks based on search query
    if (!searchQuery) {
      setFilteredBookmarks(bookmarks);
    } else {
      const filtered = bookmarks.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredBookmarks(filtered);
    }
  }, [bookmarks, searchQuery]);

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bookmarks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBookmark = async (bookmarkData: Omit<Bookmark, 'id' | 'created_at'>) => {
    try {
      if (editingBookmark) {
        // Update existing bookmark
        const { error } = await supabase
          .from('bookmarks')
          .update({
            ...bookmarkData,
            user_id: user!.id
          })
          .eq('id', editingBookmark.id);

        if (error) throw error;
        toast({ title: 'Bookmark updated successfully!' });
      } else {
        // Create new bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            ...bookmarkData,
            user_id: user!.id
          });

        if (error) throw error;
        toast({ title: 'Bookmark saved successfully!' });
      }

      fetchBookmarks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save bookmark',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Bookmark deleted successfully!' });
      fetchBookmarks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bookmark',
        variant: 'destructive'
      });
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .update({ is_favorite: isFavorite })
        .eq('id', id);

      if (error) throw error;
      fetchBookmarks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorite status',
        variant: 'destructive'
      });
    }
  };

  const handleAddBookmark = () => {
    setEditingBookmark(null);
    setDialogOpen(true);
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAddBookmark={handleAddBookmark}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No bookmarks found matching your search.' : 'No bookmarks yet. Add your first bookmark!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={handleEditBookmark}
                onDelete={handleDeleteBookmark}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      <BookmarkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bookmark={editingBookmark}
        onSave={handleSaveBookmark}
      />
    </div>
  );
};
