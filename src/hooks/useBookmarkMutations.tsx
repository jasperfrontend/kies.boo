import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  last_visited_at?: string;
}

interface CollectionData {
  collectionId?: string;
  newCollectionTitle?: string;
}

const BOOKMARKS_QUERY_KEY = 'bookmarks';

export const useBookmarkMutations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addTagsToBookmark, removeAllTagsFromBookmark } = useTags();

  // Save bookmark mutation with optional collection handling
  const saveMutation = useMutation({
    mutationFn: async ({ 
      bookmarkData, 
      collectionData 
    }: { 
      bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }, 
      collectionData?: CollectionData 
    }) => {
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

      const bookmarkId = result.data.id;
      
      // Handle tags separately
      if (!isNew) {
        await removeAllTagsFromBookmark(bookmarkId);
      }
      
      if (bookmarkData.tags && bookmarkData.tags.length > 0) {
        await addTagsToBookmark(bookmarkId, bookmarkData.tags);
      }

      // Handle smart collection assignment (for both new and existing bookmarks)
      if (collectionData) {
        let targetCollectionId = collectionData.collectionId;

        // Create new collection if needed
        if (collectionData.newCollectionTitle && !targetCollectionId) {
          const { data: newCollection, error: collectionError } = await supabase
            .from('smart_collections')
            .insert({
              title: collectionData.newCollectionTitle,
              type: 'manual',
              user_id: user.id
            })
            .select()
            .single();

          if (collectionError) {
            console.error('Error creating collection:', collectionError);
            throw collectionError;
          }

          targetCollectionId = newCollection.id;
        }

        // Add bookmark to collection
        if (targetCollectionId) {
          // For existing bookmarks, first check if the bookmark is already in this collection
          if (!isNew) {
            const { data: existingLink } = await supabase
              .from('collection_bookmarks')
              .select('id')
              .eq('collection_id', targetCollectionId)
              .eq('bookmark_id', bookmarkId)
              .maybeSingle();

            // Only insert if the bookmark is not already in this collection
            if (!existingLink) {
              const { error: linkError } = await supabase
                .from('collection_bookmarks')
                .insert({
                  collection_id: targetCollectionId,
                  bookmark_id: bookmarkId
                });

              if (linkError) {
                console.error('Error linking bookmark to collection:', linkError);
                // Don't throw here - bookmark was saved successfully
              }
            }
          } else {
            // For new bookmarks, always add to collection
            const { error: linkError } = await supabase
              .from('collection_bookmarks')
              .insert({
                collection_id: targetCollectionId,
                bookmark_id: bookmarkId
              });

            if (linkError) {
              console.error('Error linking bookmark to collection:', linkError);
              // Don't throw here - bookmark was saved successfully
            }
          }
        }
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

  return {
    handleSave: (
      bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }, 
      collectionData?: CollectionData
    ) => saveMutation.mutate({ bookmarkData, collectionData }),
    handleDelete: (id: string) => deleteMutation.mutate(id),
    handleBulkDelete: (bookmarkIds: string[]) => bulkDeleteMutation.mutate(bookmarkIds),
    handleToggleFavorite: (id: string, isFavorite: boolean) => toggleFavoriteMutation.mutate({ id, isFavorite }),
    isLoading: saveMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending || toggleFavoriteMutation.isPending
  };
};
