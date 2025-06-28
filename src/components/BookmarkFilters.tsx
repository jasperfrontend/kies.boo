
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const [showSeedButton, setShowSeedButton] = React.useState(false);
  const [typedSequence, setTypedSequence] = React.useState('');
  const [recoveredByCode, setRecoveredByCode] = React.useState(false);

  React.useEffect(() => {
    // Load the preference from localStorage
    const saved = localStorage.getItem('showSeedBookmarksButton');
    setShowSeedButton(saved === 'true');
  }, []);

  const handleFeatureRemoved = () => {
    setShowSeedButton(false);
    setRecoveredByCode(false);
    // Update localStorage when feature is removed
    localStorage.setItem('showSeedBookmarksButton', 'false');
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newSequence = (typedSequence + event.key.toLowerCase()).slice(-7);
      setTypedSequence(newSequence);
      
      if (newSequence === 'abacabb') {
        setShowSeedButton(true);
        setRecoveredByCode(true);
        setTypedSequence('');
        // Update localStorage when recovered by code
        localStorage.setItem('showSeedBookmarksButton', 'true');
        // Add fatality-called class to body
        document.body.classList.add('fatality-called');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [typedSequence]);

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All <Badge variant="secondary" className="ml-2">{totalCount}</Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show all bookmarks</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={filter === 'favorites' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('favorites')}
                >
                  Favorites <Badge variant="secondary" className="ml-2">{favoriteCount}</Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show only favorite bookmarks</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center space-x-2">
            {showSeedButton && (
              <div className={recoveredByCode ? 'easter-egg-recovered' : ''}>
                <SeedBookmarksButton 
                  onBookmarksAdded={onBookmarksAdded}
                  onFeatureRemoved={handleFeatureRemoved}
                />
              </div>
            )}
            {selectedBookmarks.length > 0 && onBulkDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onBulkDelete}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete {selectedBookmarks.length} Selected
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete all selected bookmarks permanently</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grid view - show bookmarks as cards</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Table view - show bookmarks in a compact list</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
