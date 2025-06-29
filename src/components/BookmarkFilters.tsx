
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Grid, List, Trash2 } from 'lucide-react';

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
  totalCount,
  favoriteCount,
  selectedBookmarks = [],
  onBulkDelete
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
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
        
      </div>
    </TooltipProvider>
  );
};
