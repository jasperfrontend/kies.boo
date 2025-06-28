
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TemporalClustering } from '@/utils/temporalClustering';
import type { SmartCollection, Bookmark } from '@/types/smartCollections';

// Extended type for collections with bookmarks
export interface ExtendedSmartCollection extends SmartCollection {
  bookmarks?: Bookmark[];
  timeRange?: {
    start: string;
    end: string;
  };
}

export const useSmartCollections = (bookmarks: Bookmark[]) => {
  const [dbCollections, setDbCollections] = useState<ExtendedSmartCollection[]>([]);
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

      // Transform the data to match our ExtendedSmartCollection type
      const transformedCollections: ExtendedSmartCollection[] = collections?.map(collection => ({
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

  // Generate automatic collections from temporal clustering and transform them
  const autoCollections: ExtendedSmartCollection[] = bookmarks.length >= 3 
    ? TemporalClustering.generateSmartCollections(bookmarks).map(collection => ({
        ...collection,
        // Ensure all required SmartCollection properties exist
        time_range_start: collection.timeRange?.start || null,
        time_range_end: collection.timeRange?.end || null,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        bookmarks: collection.bookmarks || []
      }))
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
