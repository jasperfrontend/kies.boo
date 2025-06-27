
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface BookmarkStatsProps {
  totalCount: number;
  favoriteCount: number;
}

export const BookmarkStats: React.FC<BookmarkStatsProps> = ({ 
  totalCount, 
  favoriteCount 
}) => {
  return (
    <>
      <Badge variant="secondary" className="ml-2">{totalCount}</Badge>
      <Badge variant="secondary" className="ml-2">{favoriteCount}</Badge>
    </>
  );
};
