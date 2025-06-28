import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronDown, ChevronRight, Clock, Globe, Hash, Trash2, Edit, Bookmark } from 'lucide-react';
import { BookmarkCard } from './BookmarkCard';
import type { ExtendedSmartCollection } from '@/hooks/useSmartCollections';

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
  collection: ExtendedSmartCollection;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDeleteCollection?: (collectionId: string) => void;
  onEditCollection?: (collectionId: string, newTitle: string) => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onEdit,
  onDelete,
  onToggleFavorite,
  onDeleteCollection,
  onEditCollection
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimeRange = () => {
    // Handle both database collections and temporal clustering collections
    const start = collection.timeRange?.start || collection.time_range_start;
    const end = collection.timeRange?.end || collection.time_range_end;
    
    // Check if this is a database collection (has a real database ID)
    const isDatabaseCollection = collection.id && collection.id.length === 36; // UUID length
    
    // For manually created collections, show "Saved manually"
    if (isDatabaseCollection && (!start || !end)) {
      return 'Saved manually';
    }
    
    if (!start || !end) return 'Unknown duration';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    
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
      case 'search':
        return <Hash className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeTooltip = () => {
    switch (collection.type) {
      case 'domain':
        return 'Domain-based collection: Bookmarks from the same website';
      case 'keyword':
        return 'Keyword-based collection: Bookmarks with similar topics';
      case 'search':
        return 'Search-based collection: Bookmarks matching search terms';
      default:
        return 'Time-based collection: Bookmarks saved around the same time';
    }
  };

  const getConfidenceColor = () => {
    const confidence = collection.confidence || 0;
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const keywords = collection.keywords || [];
  const bookmarks = collection.bookmarks || [];
  const confidence = collection.confidence || 1;

  // Check if this is a database collection (has a real database ID)
  const isDatabaseCollection = collection.id && collection.id.length === 36; // UUID length

  const handleDeleteCollection = () => {
    if (onDeleteCollection && isDatabaseCollection) {
      onDeleteCollection(collection.id);
    }
  };

  const handleEditCollection = () => {
    if (onEditCollection && isDatabaseCollection) {
      onEditCollection(collection.id, collection.title);
    }
  };

  const handleMoreBookmarksClick = () => {
    setIsExpanded(true);
  };

  return (
    <TooltipProvider>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isExpanded ? 'Collapse collection' : 'Expand collection'}</p>
                </TooltipContent>
              </Tooltip>
              <CardTitle className="text-lg">{collection.title}</CardTitle>
            </div>
            
            <div className="flex items-center space-x-2">
              {isDatabaseCollection && onEditCollection && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCollection}
                      className="p-1 h-auto text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit collection title</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {isDatabaseCollection && onDeleteCollection && (
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-auto text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete collection</p>
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Smart Collection</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{collection.title}"? This action cannot be undone.
                        The bookmarks will not be deleted, only the collection.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteCollection} className="bg-red-500 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 cursor-help">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor()}`} />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Collection confidence score: {Math.round(confidence * 100)}%</p>
                  <p className="text-xs text-muted-foreground">
                    How confident the AI is that these bookmarks belong together
                  </p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getTypeIcon()}
                    {bookmarks.length}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getTypeTooltip()}</p>
                  <p className="text-xs text-muted-foreground">
                    Contains {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeRange()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isDatabaseCollection && (!collection.timeRange?.start && !collection.time_range_start) 
                      ? 'Manually created collection' 
                      : 'Time span when these bookmarks were saved'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span>•</span>
            <span>{new Date(collection.created_at).toLocaleDateString()}</span>
            {isDatabaseCollection && (
              <>
                <span>•</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manually created collection</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {!isDatabaseCollection && (
              <>
                <span>•</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs">Auto-generated</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Automatically generated by AI based on bookmark patterns</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>

          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {keywords.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{keywords.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        {!isExpanded && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {bookmarks.slice(0, 3).map((bookmark) => (
                <div key={bookmark.id} className="scale-90 origin-top-left">
                  <BookmarkCard
                    bookmark={bookmark}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleFavorite={onToggleFavorite}
                  />
                </div>
              ))}
              {bookmarks.length > 3 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center justify-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={handleMoreBookmarksClick}
                    >
                      <span className="text-sm text-muted-foreground">
                        +{bookmarks.length - 3} more
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to show all bookmarks in this collection</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </CardContent>
        )}

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.map((bookmark) => (
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
    </TooltipProvider>
  );
};
