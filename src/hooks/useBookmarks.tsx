
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  last_visited_at?: string;
}

const BOOKMARKS_QUERY_KEY = 'bookmarks';

export const useBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bookmarks using React Query
  const {
    data: bookmarks = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: [BOOKMARKS_QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookmarks:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // Reduced to 1 minute to catch updates faster
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Show error toast if query fails
  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch bookmarks",
      variant: "destructive"
    });
  }

  // Manual refetch function
  const fetchBookmarks = () => {
    queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
  };

  // Save bookmark mutation
  const saveMutation = useMutation({
    mutationFn: async (bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const isNew = !bookmarkData.id;
      
      console.log('Saving bookmark:', { isNew, bookmarkData });
      
      const payload = {
        title: bookmarkData.title,
        url: bookmarkData.url,
        description: bookmarkData.description,
        favicon_url: bookmarkData.favicon_url,
        tags: bookmarkData.tags,
        is_favorite: bookmarkData.is_favorite,
        user_id: user.id,
      };

      let result;
      if (isNew) {
        console.log('Creating new bookmark with payload:', payload);
        result = await supabase
          .from('bookmarks')
          .insert([payload])
          .select('*')
          .single();
      } else {
        console.log('Updating existing bookmark with ID:', bookmarkData.id, 'and payload:', payload);
        result = await supabase
          .from('bookmarks')
          .update(payload)
          .eq('id', bookmarkData.id)
          .eq('user_id', user.id)
          .select('*')
          .single();
      }

      if (result.error) {
        console.error('Error saving bookmark:', result.error);
        throw result.error;
      }

      console.log('Bookmark saved successfully:', result.data);
      return { data: result.data, isNew };
    },
    onSuccess: ({ isNew }) => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: `Bookmark ${isNew ? 'created' : 'updated'} successfully`,
      });
    },
    onError: (error) => {
      console.error('Error saving bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to save bookmark",
        variant: "destructive"
      });
    }
  });

  // Delete bookmark mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting bookmark:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: "Bookmark deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to delete bookmark",
        variant: "destructive"
      });
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (bookmarkIds: string[]) => {
      if (bookmarkIds.length === 0) return;

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .in('id', bookmarkIds);

      if (error) {
        console.error('Error deleting bookmarks:', error);
        throw error;
      }

      return bookmarkIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: `${count} bookmark${count === 1 ? '' : 's'} deleted successfully`,
      });
    },
    onError: (error) => {
      console.error('Error deleting bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to delete selected bookmarks",
        variant: "destructive"
      });
    }
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('bookmarks')
        .update({ is_favorite: isFavorite })
        .eq('id', id);

      if (error) {
        console.error('Error toggling favorite:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: "Favorite status toggled successfully",
      });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to toggle favorite status",
        variant: "destructive"
      });
    }
  });

  // Update last visited mutation with optimistic updates
  const updateLastVisitedMutation = useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      console.log('Updating last visited for bookmark:', id, 'at time:', now);
      
      const { error } = await supabase
        .from('bookmarks')
        .update({ last_visited_at: now })
        .eq('id', id);

      if (error) {
        console.error('Error updating last visited:', error);
        throw error;
      }

      return { id, last_visited_at: now };
    },
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });

      // Snapshot the previous value
      const previousBookmarks = queryClient.getQueryData([BOOKMARKS_QUERY_KEY, user?.id]);

      // Optimistically update to the new value
      const now = new Date().toISOString();
      queryClient.setQueryData([BOOKMARKS_QUERY_KEY, user?.id], (old: Bookmark[] | undefined) => {
        if (!old) return old;
        return old.map(bookmark => 
          bookmark.id === id 
            ? { ...bookmark, last_visited_at: now }
            : bookmark
        );
      });

      console.log('Optimistically updated bookmark', id, 'with last_visited_at:', now);

      // Return a context object with the snapshotted value
      return { previousBookmarks };
    },
    onError: (err, id, context) => {
      console.error('Error in updateLastVisited mutation:', err);
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData([BOOKMARKS_QUERY_KEY, user?.id], context?.previousBookmarks);
      
      // Show error toast for debugging
      toast({
        title: "Warning",
        description: "Failed to track bookmark visit",
        variant: "destructive"
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
    }
  });

  return {
    bookmarks,
    loading: loading || saveMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending || toggleFavoriteMutation.isPending,
    fetchBookmarks,
    handleSave: (bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }) => saveMutation.mutate(bookmarkData),
    handleDelete: (id: string) => deleteMutation.mutate(id),
    handleBulkDelete: (bookmarkIds: string[]) => bulkDeleteMutation.mutate(bookmarkIds),
    handleToggleFavorite: (id: string, isFavorite: boolean) => toggleFavoriteMutation.mutate({ id, isFavorite }),
    handleUpdateLastVisited: (id: string) => {
      console.log('handleUpdateLastVisited called for bookmark:', id);
      updateLastVisitedMutation.mutate(id);
    }
  };
};
