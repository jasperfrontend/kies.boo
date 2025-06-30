
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tag {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface BookmarkTag {
  id: string;
  bookmark_id: string;
  tag_id: string;
  created_at: string;
}

const TAGS_QUERY_KEY = 'tags';
const BOOKMARK_TAGS_QUERY_KEY = 'bookmark_tags';

export const useTags = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all user's tags
  const {
    data: tags = [],
    isLoading: tagsLoading,
    error: tagsError
  } = useQuery({
    queryKey: [TAGS_QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Fetch bookmark-tag relationships
  const {
    data: bookmarkTags = [],
    isLoading: bookmarkTagsLoading
  } = useQuery({
    queryKey: [BOOKMARK_TAGS_QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bookmark_tags')
        .select(`
          *,
          bookmarks!inner(user_id)
        `)
        .eq('bookmarks.user_id', user.id);

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Create or get existing tag
  const createOrGetTagMutation = useMutation({
    mutationFn: async (tagName: string) => {
      if (!user) throw new Error('User not authenticated');

      // First, try to find existing tag
      const { data: existingTag } = await supabase
        .from('tags')
        .select('*')
        .eq('name', tagName)
        .eq('user_id', user.id)
        .single();

      if (existingTag) {
        return existingTag;
      }

      // Create new tag if it doesn't exist
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name: tagName, user_id: user.id }])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY, user?.id] });
    },
  });

  // Link bookmark to tag
  const linkBookmarkToTagMutation = useMutation({
    mutationFn: async ({ bookmarkId, tagId }: { bookmarkId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from('bookmark_tags')
        .insert([{ bookmark_id: bookmarkId, tag_id: tagId }])
        .select('*');

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARK_TAGS_QUERY_KEY, user?.id] });
    },
  });

  // Unlink bookmark from tag
  const unlinkBookmarkFromTagMutation = useMutation({
    mutationFn: async ({ bookmarkId, tagId }: { bookmarkId: string; tagId: string }) => {
      const { error } = await supabase
        .from('bookmark_tags')
        .delete()
        .eq('bookmark_id', bookmarkId)
        .eq('tag_id', tagId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARK_TAGS_QUERY_KEY, user?.id] });
    },
  });

  // Delete tag and all its relationships
  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY, user?.id] });
      queryClient.invalidateQueries({ queryKey: [BOOKMARK_TAGS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive"
      });
    }
  });

  // Rename tag
  const renameTagMutation = useMutation({
    mutationFn: async ({ tagId, newName }: { tagId: string; newName: string }) => {
      const { data, error } = await supabase
        .from('tags')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', tagId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY, user?.id] });
      toast({
        title: "Success",
        description: "Tag renamed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to rename tag",
        variant: "destructive"
      });
    }
  });

  // Helper function to get tags for a specific bookmark
  const getTagsForBookmark = (bookmarkId: string): Tag[] => {
    const bookmarkTagIds = bookmarkTags
      .filter(bt => bt.bookmark_id === bookmarkId)
      .map(bt => bt.tag_id);
    
    return tags.filter(tag => bookmarkTagIds.includes(tag.id));
  };

  // Helper function to add tags to a bookmark
  const addTagsToBookmark = async (bookmarkId: string, tagNames: string[]) => {
    for (const tagName of tagNames) {
      try {
        const tag = await createOrGetTagMutation.mutateAsync(tagName);
        await linkBookmarkToTagMutation.mutateAsync({ bookmarkId, tagId: tag.id });
      } catch (error) {
        console.error('Error adding tag to bookmark:', error);
      }
    }
  };

  // Helper function to remove all tags from a bookmark
  const removeAllTagsFromBookmark = async (bookmarkId: string) => {
    const bookmarkTagIds = bookmarkTags
      .filter(bt => bt.bookmark_id === bookmarkId)
      .map(bt => bt.tag_id);
    
    for (const tagId of bookmarkTagIds) {
      try {
        await unlinkBookmarkFromTagMutation.mutateAsync({ bookmarkId, tagId });
      } catch (error) {
        console.error('Error removing tag from bookmark:', error);
      }
    }
  };

  return {
    tags,
    bookmarkTags,
    loading: tagsLoading || bookmarkTagsLoading,
    getTagsForBookmark,
    addTagsToBookmark,
    removeAllTagsFromBookmark,
    createOrGetTag: (tagName: string) => createOrGetTagMutation.mutate(tagName),
    linkBookmarkToTag: ({ bookmarkId, tagId }: { bookmarkId: string; tagId: string }) => 
      linkBookmarkToTagMutation.mutate({ bookmarkId, tagId }),
    unlinkBookmarkFromTag: ({ bookmarkId, tagId }: { bookmarkId: string; tagId: string }) => 
      unlinkBookmarkFromTagMutation.mutate({ bookmarkId, tagId }),
    deleteTag: (tagId: string) => deleteTagMutation.mutate(tagId),
    renameTag: ({ tagId, newName }: { tagId: string; newName: string }) => 
      renameTagMutation.mutate({ tagId, newName }),
  };
};
