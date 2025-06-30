
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const BOOKMARKS_QUERY_KEY = 'bookmarks';

export const useBookmarkActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Manual refetch function
  const fetchBookmarks = () => {
    queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
  };

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
    fetchBookmarks,
    handleUpdateLastVisited: (id: string) => {
      updateLastVisitedMutation.mutate(id);
    }
  };
};
