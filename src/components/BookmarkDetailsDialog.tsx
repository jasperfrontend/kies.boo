import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, ExternalLink, Globe, Heart, Tag, Folder } from 'lucide-react';
import { format } from 'date-fns';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  last_visited_at?: string;
}

interface SmartCollection {
  id: string;
  title: string;
  type: string;
}

interface BookmarkDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark: Bookmark | null;
  currentCollection?: SmartCollection | null;
  onOpenLink?: () => void;
}

export const BookmarkDetailsDialog: React.FC<BookmarkDetailsDialogProps> = ({
  open,
  onOpenChange,
  bookmark,
  currentCollection,
  onOpenLink
}) => {
  if (!bookmark) return null;

  const handleOpenLink = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
    if (onOpenLink) {
      onOpenLink();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {bookmark.favicon_url && (
              <img 
                src={bookmark.favicon_url} 
                alt="" 
                className="w-5 h-5 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            Bookmark Details
            {bookmark.is_favorite && (
              <Heart className="h-4 w-4 text-red-500 fill-current" />
            )}
          </DialogTitle>
          <DialogDescription>
            Complete information for this bookmark
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Title Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Title
                  </h3>
                  <p className="text-lg font-medium text-gray-900 dark:text-white break-words">
                    {bookmark.title}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    URL
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-blue-600 dark:text-blue-400 break-all flex-1 min-w-0">
                      <a href={bookmark.url} target="_blank">{bookmark.url}</a>
                    </p>
                    <Button
                      onClick={handleOpenLink}
                      size="sm"
                      variant="outline"
                      className="gap-2 flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Domain: {getDomainFromUrl(bookmark.url)}
                  </p>
                </div>
                
                {bookmark.description && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Description
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
                        {bookmark.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags and Collection Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags ({bookmark.tags.length})
                  </h3>
                  {bookmark.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {bookmark.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No tags assigned
                    </p>
                  )}
                </div>

                {currentCollection && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Smart Collection
                      </h3>
                      <Badge 
                        variant="outline" 
                        className="text-sm border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                      >
                        {currentCollection.title}
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                        Type: {currentCollection.type}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Created
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(bookmark.created_at)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Last Visited
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {bookmark.last_visited_at 
                        ? formatDate(bookmark.last_visited_at) 
                        : 'Never visited'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};