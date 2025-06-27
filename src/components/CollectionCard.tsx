
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Clock, Globe, Hash } from 'lucide-react';
import { BookmarkCard } from './BookmarkCard';
import { SmartCollection } from '@/utils/temporalClustering';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

interface CollectionCardProps {
  collection: SmartCollection;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimeRange = () => {
    const start = new Date(collection.timeRange.start);
    const end = new Date(collection.timeRange.end);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return `${Math.round(diffHours * 60)} minutes`;
    } else if (diffHours < 24) {
      return `${Math.round(diffHours)} hours`;
    } else {
      return `${Math.round(diffHours / 24)} days`;
    }
  };

  const getTypeIcon = () => {
    switch (collection.type) {
      case 'domain':
        return <Globe className="h-4 w-4" />;
      case 'keyword':
        return <Hash className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = () => {
    if (collection.confidence >= 0.8) return 'bg-green-500';
    if (collection.confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-auto"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <CardTitle className="text-lg">{collection.title}</CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getConfidenceColor()}`} />
              <span className="text-xs text-muted-foreground">
                {Math.round(collection.confidence * 100)}%
              </span>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              {getTypeIcon()}
              {collection.bookmarks.length}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Saved over {formatTimeRange()}</span>
          </div>
          <span>•</span>
          <span>{new Date(collection.timeRange.start).toLocaleDateString()}</span>
        </div>

        {collection.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {collection.keywords.slice(0, 3).map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {collection.keywords.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{collection.keywords.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      {!isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {collection.bookmarks.slice(0, 3).map((bookmark) => (
              <div key={bookmark.id} className="scale-90 origin-top-left">
                <BookmarkCard
                  bookmark={bookmark}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))}
            {collection.bookmarks.length > 3 && (
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <span className="text-sm text-muted-foreground">
                  +{collection.bookmarks.length - 3} more
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
