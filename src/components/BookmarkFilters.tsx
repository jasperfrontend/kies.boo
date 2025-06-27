
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, List } from 'lucide-react';
import { SeedBookmarksButton } from '@/components/SeedBookmarksButton';

interface BookmarkFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  totalCount: number;
  favoriteCount: number;
  onBookmarksAdded: () => void;
}

export const BookmarkFilters: React.FC<BookmarkFiltersProps> = ({
  filter,
  setFilter,
  viewMode,
  setViewMode,
  totalCount,
  favoriteCount,
  onBookmarksAdded
}) => {
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
        <SeedBookmarksButton onBookmarksAdded={onBookmarksAdded} />
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
