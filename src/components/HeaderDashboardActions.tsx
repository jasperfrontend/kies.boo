
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Grid3X3, Table, Star, Maximize2, Minimize2 } from 'lucide-react';

interface HeaderDashboardActionsProps {
  bookmarkCount: number;
  favoritesCount: number;
  showFavorites?: boolean;
  onShowFavoritesChange?: (show: boolean) => void;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
  compactMode?: boolean;
  onCompactModeChange?: (compact: boolean) => void;
  onAddBookmark?: () => void;
}

export const HeaderDashboardActions: React.FC<HeaderDashboardActionsProps> = ({
  bookmarkCount,
  favoritesCount,
  showFavorites,
  onShowFavoritesChange,
  viewMode,
  onViewModeChange,
  compactMode,
  onCompactModeChange,
  onAddBookmark
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="gap-1">
          <span className="text-xs">Total: {bookmarkCount}</span>
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Star className="h-3 w-3" />
          <span className="text-xs">{favoritesCount}</span>
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {compactMode !== undefined && onCompactModeChange && viewMode === 'grid' && (
          <Button
            variant={compactMode ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => onCompactModeChange(!compactMode)}
            className="gap-2"
          >
            {compactMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{compactMode ? 'Extended' : 'Compact'}</span>
          </Button>
        )}
        {showFavorites !== undefined && onShowFavoritesChange && (
          <Button
            variant={showFavorites ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => onShowFavoritesChange(!showFavorites)}
            className="gap-2"
          >
            <Star className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
            {showFavorites ? 'Show All' : 'Favorites'}
          </Button>
        )}
        
        {viewMode && onViewModeChange && (
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none border-r px-2 sm:px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className="rounded-l-none px-2 sm:px-3"
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button size="sm" className="gap-2" onClick={onAddBookmark}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Bookmark</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
};
