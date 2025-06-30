
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTags } from './useTags';

interface BookmarkRaw {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  is_favorite: boolean;
  created_at: string;
  last_visited_at?: string;
  user_id: string;
}

interface Bookmark extends Omit<BookmarkRaw, 'user_id'> {
  tags: string[];
}

const BOOKMARKS_QUERY_KEY = 'bookmarks';

export const useBookmarkQueries = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getTagsForBookmark } = useTags();

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

  return {
    bookmarks,
    loading,
    queryKey: [BOOKMARKS_QUERY_KEY, user?.id]
  };
};
