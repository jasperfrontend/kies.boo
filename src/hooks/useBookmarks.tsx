
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTags } from './useTags';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[]; // This will be populated from the new tag system
  is_favorite: boolean;
  created_at: string;
  last_visited_at?: string;
}

const BOOKMARKS_QUERY_KEY = 'bookmarks';

export const useBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getTagsForBookmark, addTagsToBookmark, removeAllTagsFromBookmark } = useTags();

  // Fetch bookmarks with their tags
  const {
    data: rawBookmarks = [],
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
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Transform bookmarks to include tags from the new system
  const bookmarks: Bookmark[] = rawBookmarks.map(bookmark => ({
    ...bookmark,
    tags: getTagsForBookmark(bookmark.id).map(tag => tag.name)
  }));

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
      
      const payload = {
        title: bookmarkData.title,
        url: bookmarkData.url,
        description: bookmarkData.description,
        favicon_url: bookmarkData.favicon_url,
        is_favorite: bookmarkData.is_favorite,
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
          .eq('id', bookmarkData.id)
          .eq('user_id', user.id)
          .select('*')
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      // Handle tags separately
      const bookmarkId = result.data.id;
      
      // Remove all existing tags for this bookmark
      if (!isNew) {
        await removeAllTagsFromBookmark(bookmarkId);
      }
      
      // Add new tags
      if (bookmarkData.tags && bookmarkData.tags.length > 0) {
        await addTagsToBookmark(bookmarkId, bookmarkData.tags);
      }

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
      toast({
        title: "Error",
        description: "Failed to toggle favorite status",
        variant: "destructive"
      });
    }
  });

  // Update last visited mutation
  const updateLastVisitedMutation = useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      
      if (!user?.id) {
        throw new Error('No user authenticated');
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .update({ last_visited_at: now })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No bookmark found or insufficient permissions');
      }

      return { id, last_visited_at: now, updatedData: data };
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });

      const previousBookmarks = queryClient.getQueryData([BOOKMARKS_QUERY_KEY, user?.id]);

      const now = new Date().toISOString();
      queryClient.setQueryData([BOOKMARKS_QUERY_KEY, user?.id], (old: any[] | undefined) => {
        if (!old) {
          return old;
        }
        
        const updated = old.map(bookmark => 
          bookmark.id === id 
            ? { ...bookmark, last_visited_at: now }
            : bookmark
        );
        
        return updated;
      });

      return { previousBookmarks };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData([BOOKMARKS_QUERY_KEY, user?.id], context?.previousBookmarks);
    },
    onSettled: () => {
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
      updateLastVisitedMutation.mutate(id);
    }
  };
};
