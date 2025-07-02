import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Settings, Star, Grid3X3, Table, Maximize2, Minimize2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFABProps {
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

export const MobileFAB: React.FC<MobileFABProps> = ({
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  // Only render on mobile
  if (!isMobile) {
    return null;
  }

  // Check if we have any actions to show
  const hasActions = onAddBookmark || 
    (viewMode !== undefined && onViewModeChange) || 
    (compactMode !== undefined && onCompactModeChange) || 
    (showFavorites !== undefined && onShowFavoritesChange);

  if (!hasActions) {
    return null;
  }

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Actions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Badge variant="secondary" className="gap-1">
                <span className="text-xs">Total: {bookmarkCount}</span>
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                <span className="text-xs">{favoritesCount}</span>
              </Badge>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Add Bookmark */}
              {onAddBookmark && (
                <Button
                  onClick={() => {
                    onAddBookmark();
                    setIsModalOpen(false);
                  }}
                  className="h-16 flex-col gap-1"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Add Bookmark</span>
                </Button>
              )}

              {/* Favorites Toggle */}
              {showFavorites !== undefined && onShowFavoritesChange && (
                <Button
                  variant={showFavorites ? 'default' : 'outline'}
                  onClick={() => {
                    onShowFavoritesChange(!showFavorites);
                    setIsModalOpen(false);
                  }}
                  className="h-16 flex-col gap-1"
                >
                  <Star className={`h-5 w-5 ${showFavorites ? 'fill-current' : ''}`} />
                  <span className="text-xs">{showFavorites ? 'Show All' : 'Favorites'}</span>
                </Button>
              )}

              {/* View Mode Toggle */}
              {viewMode && onViewModeChange && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onViewModeChange(viewMode === 'grid' ? 'table' : 'grid');
                    setIsModalOpen(false);
                  }}
                  className="h-16 flex-col gap-1"
                >
                  {viewMode === 'grid' ? (
                    <Table className="h-5 w-5" />
                  ) : (
                    <Grid3X3 className="h-5 w-5" />
                  )}
                  <span className="text-xs">{viewMode === 'grid' ? 'Table View' : 'Grid View'}</span>
                </Button>
              )}

              {/* Compact Mode Toggle */}
              {compactMode !== undefined && onCompactModeChange && viewMode === 'grid' && (
                <Button
                  variant={compactMode ? 'default' : 'outline'}
                  onClick={() => {
                    onCompactModeChange(!compactMode);
                    setIsModalOpen(false);
                  }}
                  className="h-16 flex-col gap-1"
                >
                  {compactMode ? (
                    <Maximize2 className="h-5 w-5" />
                  ) : (
                    <Minimize2 className="h-5 w-5" />
                  )}
                  <span className="text-xs">{compactMode ? 'Extended' : 'Compact'}</span>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};