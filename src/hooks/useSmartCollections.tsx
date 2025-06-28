
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TemporalClustering } from '@/utils/temporalClustering';
import type { SmartCollection, Bookmark } from '@/types/smartCollections';

export const useSmartCollections = (bookmarks: Bookmark[]) => {
  const [dbCollections, setDbCollections] = useState<SmartCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSmartCollections = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch collections from database
      const { data: collections, error: collectionsError } = await supabase
        .from('smart_collections')
        .select(`
          *,
          collection_bookmarks (
            bookmark_id,
            bookmarks (
              id,
              title,
              url,
              description,
              favicon_url,
              tags,
              is_favorite,
              created_at
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (collectionsError) throw collectionsError;

      // Transform the data to match our SmartCollection type
      const transformedCollections = collections?.map(collection => ({
        ...collection,
        bookmarks: collection.collection_bookmarks?.map(cb => cb.bookmarks).filter(Boolean) || []
      })) || [];

      setDbCollections(transformedCollections);
    } catch (error) {
      console.error('Error fetching smart collections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch smart collections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate automatic collections from temporal clustering
  const autoCollections = bookmarks.length >= 3 
    ? TemporalClustering.generateSmartCollections(bookmarks)
    : [];

  // Combine both types of collections
  const allCollections = [...dbCollections, ...autoCollections];

  useEffect(() => {
    fetchSmartCollections();
  }, [user]);

  return {
    smartCollections: allCollections,
    loading,
    refetch: fetchSmartCollections
  };
};
