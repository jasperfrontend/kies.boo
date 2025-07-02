import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [20, 40, 60, 80, 100];

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage = 20,
  onPageChange,
  onItemsPerPageChange,
}) => {
  if (totalPages <= 1 && !onItemsPerPageChange) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Navigation controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="px-2"
        >
          <ChevronLeft className="h-4 w-4" />
          1
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {onItemsPerPageChange && (
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="px-2"
        >
          {totalPages}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Page info */}
      {totalPages > 1 && (
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      )}
    </div>
  );
};