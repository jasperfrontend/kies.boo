import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(0)}
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
      
      <span className="text-sm text-muted-foreground px-2">
        Page {currentPage} of {totalPages}
      </span>
      
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
  );
};