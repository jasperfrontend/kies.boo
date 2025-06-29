
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

  console.log('🔍 useBookmarks hook initialized, user ID:', user?.id);

  // Fetch bookmarks using React Query
  const {
    data: bookmarks = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: [BOOKMARKS_QUERY_KEY, user?.id],
    queryFn: async () => {
      console.log('📊 Fetching bookmarks for user:', user?.id);
      if (!user) return [];

      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching bookmarks:', error);
        throw error;
      }

      console.log('✅ Bookmarks fetched successfully:', data?.length, 'bookmarks');
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
    console.log('🔄 Manual refetch triggered');
    queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
  };

  // Save bookmark mutation
  const saveMutation = useMutation({
    mutationFn: async (bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const isNew = !bookmarkData.id;
      
      console.log('💾 Saving bookmark:', { isNew, bookmarkData });
      
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
        console.log('➕ Creating new bookmark with payload:', payload);
        result = await supabase
          .from('bookmarks')
          .insert([payload])
          .select('*')
          .single();
      } else {
        console.log('✏️ Updating existing bookmark with ID:', bookmarkData.id, 'and payload:', payload);
        result = await supabase
          .from('bookmarks')
          .update(payload)
          .eq('id', bookmarkData.id)
          .eq('user_id', user.id)
          .select('*')
          .single();
      }

      if (result.error) {
        console.error('❌ Error saving bookmark:', result.error);
        throw result.error;
      }

      console.log('✅ Bookmark saved successfully:', result.data);
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
      console.error('❌ Error saving bookmark:', error);
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
      console.log('🗑️ Deleting bookmark with ID:', id);
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting bookmark:', error);
        throw error;
      }
      console.log('✅ Bookmark deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: "Bookmark deleted successfully",
      });
    },
    onError: (error) => {
      console.error('❌ Error deleting bookmark:', error);
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

      console.log('🗑️ Bulk deleting bookmarks:', bookmarkIds);
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .in('id', bookmarkIds);

      if (error) {
        console.error('❌ Error deleting bookmarks:', error);
        throw error;
      }

      console.log('✅ Bulk delete successful');
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
      console.error('❌ Error deleting bookmarks:', error);
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
      console.log('⭐ Toggling favorite for bookmark:', id, 'to:', isFavorite);
      const { error } = await supabase
        .from('bookmarks')
        .update({ is_favorite: isFavorite })
        .eq('id', id);

      if (error) {
        console.error('❌ Error toggling favorite:', error);
        throw error;
      }
      console.log('✅ Favorite toggled successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: "Favorite status toggled successfully",
      });
    },
    onError: (error) => {
      console.error('❌ Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to toggle favorite status",
        variant: "destructive"
      });
    }
  });

  // Update last visited mutation with comprehensive logging
  const updateLastVisitedMutation = useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      console.log('🔗 CLICK TRACKING: Starting last_visited_at update for bookmark ID:', id);
      console.log('🕒 CLICK TRACKING: Current timestamp being set:', now);
      console.log('👤 CLICK TRACKING: Current user ID:', user?.id);
      
      if (!user?.id) {
        console.error('❌ CLICK TRACKING: No user ID available!');
        throw new Error('No user authenticated');
      }

      console.log('📡 CLICK TRACKING: About to execute Supabase update query...');
      
      const { data, error } = await supabase
        .from('bookmarks')
        .update({ last_visited_at: now })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      console.log('📡 CLICK TRACKING: Supabase response data:', data);
      console.log('📡 CLICK TRACKING: Supabase response error:', error);

      if (error) {
        console.error('❌ CLICK TRACKING: Database update failed:', error);
        console.error('❌ CLICK TRACKING: Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      if (!data) {
        console.error('❌ CLICK TRACKING: No data returned from update - bookmark may not exist or user may not own it');
        throw new Error('No bookmark found or insufficient permissions');
      }

      console.log('✅ CLICK TRACKING: Database update successful!');
      console.log('✅ CLICK TRACKING: Updated bookmark data:', data);
      console.log('✅ CLICK TRACKING: Confirmed last_visited_at value:', data.last_visited_at);

      return { id, last_visited_at: now, updatedData: data };
    },
    onMutate: async (id: string) => {
      console.log('🔄 CLICK TRACKING: onMutate called for bookmark:', id);
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });

      // Snapshot the previous value
      const previousBookmarks = queryClient.getQueryData([BOOKMARKS_QUERY_KEY, user?.id]);
      console.log('📸 CLICK TRACKING: Cached bookmarks before optimistic update:', previousBookmarks);

      // Optimistically update to the new value
      const now = new Date().toISOString();
      queryClient.setQueryData([BOOKMARKS_QUERY_KEY, user?.id], (old: Bookmark[] | undefined) => {
        if (!old) {
          console.log('⚠️ CLICK TRACKING: No cached data to update optimistically');
          return old;
        }
        
        const updated = old.map(bookmark => 
          bookmark.id === id 
            ? { ...bookmark, last_visited_at: now }
            : bookmark
        );
        
        console.log('🔄 CLICK TRACKING: Optimistically updated bookmark in cache');
        return updated;
      });

      console.log('🔄 CLICK TRACKING: Optimistic update complete');

      // Return a context object with the snapshotted value
      return { previousBookmarks };
    },
    onError: (err, id, context) => {
      console.error('❌ CLICK TRACKING: Mutation failed:', err);
      console.error('❌ CLICK TRACKING: Error details:', JSON.stringify(err, null, 2));
      console.log('🔄 CLICK TRACKING: Rolling back optimistic update...');
      
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData([BOOKMARKS_QUERY_KEY, user?.id], context?.previousBookmarks);
      
      console.log('🔄 CLICK TRACKING: Rollback complete');
      
      // Show error toast for debugging
      toast({
        title: "Click Tracking Failed",
        description: `Failed to track visit for bookmark ${id}`,
        variant: "destructive"
      });
    },
    onSuccess: (result) => {
      console.log('✅ CLICK TRACKING: Mutation onSuccess called with result:', result);
    },
    onSettled: () => {
      console.log('🔄 CLICK TRACKING: Mutation settled, invalidating queries...');
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
      console.log('🔄 CLICK TRACKING: Query invalidation complete');
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
      console.log('🎯 CLICK TRACKING: handleUpdateLastVisited called for bookmark:', id);
      console.log('🎯 CLICK TRACKING: Current user:', user?.id);
      console.log('🎯 CLICK TRACKING: About to trigger mutation...');
      updateLastVisitedMutation.mutate(id);
    }
  };
};
