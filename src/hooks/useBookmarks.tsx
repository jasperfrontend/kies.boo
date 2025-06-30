import { useBookmarkQueries } from './useBookmarkQueries';
import { useBookmarkMutations } from './useBookmarkMutations';
import { useBookmarkActions } from './useBookmarkActions';

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

export const useBookmarks = () => {
  const { bookmarks, loading: queryLoading } = useBookmarkQueries();
  const { handleSave, handleDelete, handleBulkDelete, handleToggleFavorite, isLoading: mutationLoading } = useBookmarkMutations();
  const { fetchBookmarks, handleUpdateLastVisited } = useBookmarkActions();

  return {
    bookmarks,
    loading: queryLoading || mutationLoading,
    fetchBookmarks,
    handleSave: (
      bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }, 
      collectionData?: CollectionData
    ) => handleSave(bookmarkData, collectionData),
    handleDelete,
    handleBulkDelete,
    handleToggleFavorite,
    handleUpdateLastVisited
  };
};