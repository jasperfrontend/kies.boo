import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, Heart, Edit, Trash2, MoreVertical, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

interface BookmarkCardProps {
  bookmark: Bookmark;
  compact?: boolean;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onUpdateLastVisited?: (id: string) => void;
  onViewDetails?: (bookmark: Bookmark) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  compact = false,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateLastVisited,
  onViewDetails
}) => {
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  const handleDoubleClick = () => {
    if (onUpdateLastVisited) {
      onUpdateLastVisited(bookmark.id);
    }
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleExternalLinkClick = () => {
    if (onUpdateLastVisited) {
      onUpdateLastVisited(bookmark.id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Card 
          className="group hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer" 
          onDoubleClick={handleDoubleClick}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {bookmark.favicon_url && (
                  <img 
                    src={bookmark.favicon_url} 
                    alt="" 
                    className="w-4 h-4 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      {bookmark.title}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Double-click to open link in new tab</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleExternalLinkClick}
                      className="inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open link in new tab</p>
                  </TooltipContent>
                </Tooltip>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onToggleFavorite(bookmark.id, !bookmark.is_favorite)}
                      className="cursor-pointer"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${bookmark.is_favorite ? 'fill-current text-red-500' : ''}`} />
                      {bookmark.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit(bookmark)}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit bookmark
                    </DropdownMenuItem>
                    {onViewDetails && (
                      <DropdownMenuItem
                        onClick={() => onViewDetails(bookmark)}
                        className="cursor-pointer"
                      >
                        <Info className="h-4 w-4 mr-2" />
                        View details
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(bookmark.id)}
                      className="cursor-pointer text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete bookmark
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Card 
        className="group hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer" 
        onDoubleClick={handleDoubleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {bookmark.favicon_url && (
              <img 
                src={bookmark.favicon_url} 
                alt="" 
                className="w-4 h-4 mt-1 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{bookmark.title}</h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{bookmark.title} - Double-click to open link</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorite(bookmark.id, !bookmark.is_favorite)}
                        className={bookmark.is_favorite ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
                      >
                        <Heart className={`h-4 w-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{bookmark.is_favorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(bookmark)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit bookmark</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {onViewDetails && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => onViewDetails(bookmark)}>
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View details</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(bookmark.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete bookmark</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {bookmark.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{bookmark.description}</p>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex flex-wrap gap-1">
                  {bookmark.tags.map((tag, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="secondary" 
                          className="text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors bg-gray-100 dark:bg-gray-700"
                          onClick={() => handleTagClick(tag)}
                        >
                          {tag}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to search for this tag</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleExternalLinkClick}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open link in new tab</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{formatDate(bookmark.created_at)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Created on {formatDate(bookmark.created_at)}</p>
                    </TooltipContent>
                  </Tooltip>

                  {bookmark.last_visited_at && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{formatDate(bookmark.last_visited_at)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Last visited on {formatDate(bookmark.last_visited_at)}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};