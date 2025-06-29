
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportBookmark {
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export const useBookmarkImport = () => {
  const [importing, setImporting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const importBookmarks = async (bookmarks: ImportBookmark[]): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setImporting(true);

    try {
      // Check for duplicates before importing
      const urls = bookmarks.map(b => b.url);
      const { data: existingBookmarks } = await supabase
        .from('bookmarks')
        .select('url')
        .eq('user_id', user.id)
        .in('url', urls);

      const existingUrls = new Set(existingBookmarks?.map(b => b.url) || []);
      
      // Filter out duplicates
      const newBookmarks = bookmarks.filter(bookmark => !existingUrls.has(bookmark.url));

      if (newBookmarks.length === 0) {
        toast({
          title: "No new bookmarks",
          description: "All bookmarks from the import file already exist in your collection.",
        });
        return;
      }

      // Prepare bookmarks for insertion
      const bookmarksToInsert = newBookmarks.map(bookmark => ({
        ...bookmark,
        user_id: user.id,
      }));

      // Insert all bookmarks at once instead of in batches to avoid UI flickering
      const { error } = await supabase
        .from('bookmarks')
        .insert(bookmarksToInsert);

      if (error) {
        console.error('Import error:', error);
        throw new Error(`Failed to import bookmarks: ${error.message}`);
      }

      const skippedCount = bookmarks.length - newBookmarks.length;
      let message = `Successfully imported ${newBookmarks.length} bookmarks.`;
      if (skippedCount > 0) {
        message += ` Skipped ${skippedCount} duplicate${skippedCount === 1 ? '' : 's'}.`;
      }

      toast({
        title: "Import successful",
        description: message,
      });

    } catch (error) {
      console.error('Import error:', error);
      throw error;
    } finally {
      setImporting(false);
    }
  };

  return {
    importBookmarks,
    importing
  };
};
