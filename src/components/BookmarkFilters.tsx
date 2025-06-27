
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Trash2 } from 'lucide-react';
import { SeedBookmarksButton } from '@/components/SeedBookmarksButton';

interface BookmarkFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  totalCount: number;
  favoriteCount: number;
  onBookmarksAdded: () => void;
  selectedBookmarks?: string[];
  onBulkDelete?: () => void;
}

export const BookmarkFilters: React.FC<BookmarkFiltersProps> = ({
  filter,
  setFilter,
  viewMode,
  setViewMode,
  totalCount,
  favoriteCount,
  onBookmarksAdded,
  selectedBookmarks = [],
  onBulkDelete
}) => {
  const [showSeedButton, setShowSeedButton] = React.useState(true);
  const [typedSequence, setTypedSequence] = React.useState('');

  const handleFeatureRemoved = () => {
    setShowSeedButton(false);
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newSequence = (typedSequence + event.key.toLowerCase()).slice(-7);
      setTypedSequence(newSequence);
      
      if (newSequence === 'abacabb') {
        setShowSeedButton(true);
        setTypedSequence('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [typedSequence]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All <Badge variant="secondary" className="ml-2">{totalCount}</Badge>
          </Button>
          <Button
            variant={filter === 'favorites' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('favorites')}
          >
            Favorites <Badge variant="secondary" className="ml-2">{favoriteCount}</Badge>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {showSeedButton && (
            <SeedBookmarksButton 
              onBookmarksAdded={onBookmarksAdded}
              onFeatureRemoved={handleFeatureRemoved}
            />
          )}
          {selectedBookmarks.length > 0 && onBulkDelete && (
            <Button
              onClick={onBulkDelete}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedBookmarks.length} Selected
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
