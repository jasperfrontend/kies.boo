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
  removeFromCollection?: boolean;
}

const BOOKMARKS_QUERY_KEY = 'bookmarks';

export const useBookmarkMutations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addTagsToBookmark, removeAllTagsFromBookmark } = useTags();

  // Helper function to clean up duplicate collection assignments
  const cleanupDuplicateCollectionAssignments = async (bookmarkId: string) => {
    if (!user) return;

    try {
      // First, get all collections this bookmark is assigned to
      const { data: assignments, error: fetchError } = await supabase
        .from('collection_bookmarks')
        .select('id, collection_id')
        .eq('bookmark_id', bookmarkId);

      if (fetchError) {
        console.error('Error fetching collection assignments:', fetchError);
        return;
      }

      if (!assignments || assignments.length <= 1) {
        // No duplicates, nothing to clean up
        return;
      }

      console.log(`Found ${assignments.length} collection assignments for bookmark ${bookmarkId}, cleaning up...`);

      // Keep only the first assignment, remove the rest
      const assignmentsToRemove = assignments.slice(1);
      const idsToRemove = assignmentsToRemove.map(a => a.id);

      const { error: deleteError } = await supabase
        .from('collection_bookmarks')
        .delete()
        .in('id', idsToRemove);

      if (deleteError) {
        console.error('Error removing duplicate assignments:', deleteError);
      } else {
        console.log(`Successfully removed ${idsToRemove.length} duplicate collection assignments`);
      }
    } catch (error) {
      console.error('Error in cleanupDuplicateCollectionAssignments:', error);
    }
  };

  // Helper function to handle collection assignment
  const handleCollectionAssignment = async (bookmarkId: string, collectionData?: CollectionData) => {
    if (!collectionData) return;

    console.log('Processing collection data:', collectionData);
    
    // First, clean up any existing duplicates
    await cleanupDuplicateCollectionAssignments(bookmarkId);
    
    // Remove from existing collection if needed
    if (collectionData.removeFromCollection) {
      console.log('Removing bookmark from existing collection(s)');
      const { error: removeError } = await supabase
        .from('collection_bookmarks')
        .delete()
        .eq('bookmark_id', bookmarkId);

      if (removeError) {
        console.error('Error removing from existing collections:', removeError);
        // Don't throw here - we can continue with adding to new collection
      } else {
        console.log('Successfully removed from existing collections');
      }
    }

    let targetCollectionId = collectionData.collectionId;

    // Create new collection if needed
    if (collectionData.newCollectionTitle && !targetCollectionId) {
      console.log('Creating new collection:', collectionData.newCollectionTitle);
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
      console.log('New collection created with ID:', targetCollectionId);
    }

    // Add bookmark to collection (only if we have a target collection)
    if (targetCollectionId) {
      console.log('Adding bookmark to collection:', { bookmarkId, targetCollectionId });
      
      // Check if bookmark is already in this collection
      const { data: existingLink, error: checkError } = await supabase
        .from('collection_bookmarks')
        .select('id')
        .eq('collection_id', targetCollectionId)
        .eq('bookmark_id', bookmarkId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing link:', checkError);
        // Continue anyway
      }

      console.log('Existing link check result:', existingLink);

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
        } else {
          console.log('Successfully linked bookmark to collection');
        }
      } else {
        console.log('Bookmark already in collection, skipping insert');
      }
    }
  };

  // Save bookmark mutation with improved collection handling
  const saveMutation = useMutation({
    mutationFn: async (params: { 
      bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }, 
      collectionData?: CollectionData 
    }) => {
      const { bookmarkData, collectionData } = params;
      
      if (!user) throw new Error('User not authenticated');

      console.log('Starting bookmark save mutation with data:', { bookmarkData, collectionData });

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
        console.log('Creating new bookmark with payload:', payload);
        result = await supabase
          .from('bookmarks')
          .insert([payload])
          .select('*')
          .single();
      } else {
        console.log('Updating existing bookmark with payload:', payload);
        result = await supabase
          .from('bookmarks')
          .update(payload)
          .eq('id', bookmarkData.id)
          .eq('user_id', user.id)
          .select('*')
          .single();
      }

      if (result.error) {
        console.error('Bookmark save error:', result.error);
        throw result.error;
      }

      const bookmarkId = result.data.id;
      console.log('Bookmark saved successfully with ID:', bookmarkId);
      
      // Handle tags separately
      if (!isNew) {
        await removeAllTagsFromBookmark(bookmarkId);
      }
      
      if (bookmarkData.tags && bookmarkData.tags.length > 0) {
        await addTagsToBookmark(bookmarkId, bookmarkData.tags);
      }

      // Handle smart collection assignment with improved logic
      await handleCollectionAssignment(bookmarkId, collectionData);

      return { data: result.data, isNew };
    },
    onSuccess: ({ isNew }) => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['smart_collections', user?.id] });
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
    ) => {
      console.log('handleSave called with:', { bookmarkData, collectionData });
      saveMutation.mutate({ bookmarkData, collectionData });
    },
    handleDelete: (id: string) => deleteMutation.mutate(id),
    handleBulkDelete: (bookmarkIds: string[]) => bulkDeleteMutation.mutate(bookmarkIds),
    handleToggleFavorite: (id: string, isFavorite: boolean) => toggleFavoriteMutation.mutate({ id, isFavorite }),
    isLoading: saveMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending || toggleFavoriteMutation.isPending,
    cleanupDuplicateCollectionAssignments // Expose this function for manual cleanup if needed
  };
};