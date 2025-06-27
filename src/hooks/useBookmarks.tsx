
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
      toast({
        title: "Success",
        description: `Bookmark ${isNew ? 'created' : 'updated'} successfully`,
      });
    }
    setLoading(false);
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

  const handleBulkDelete = async (bookmarkIds: string[]) => {
    if (bookmarkIds.length === 0) return;

    setLoading(true);
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .in('id', bookmarkIds);

    if (error) {
      console.error('Error deleting bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to delete selected bookmarks",
        variant: "destructive"
      });
    } else {
      fetchBookmarks();
      toast({
        title: "Success",
        description: `${bookmarkIds.length} bookmark${bookmarkIds.length === 1 ? '' : 's'} deleted successfully`,
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

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  return {
    bookmarks,
    loading,
    fetchBookmarks,
    handleSave,
    handleDelete,
    handleBulkDelete,
    handleToggleFavorite
  };
};
