import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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

interface BookmarkTableProps {
  bookmarks: Bookmark[];
  selectedBookmarks: string[];
  onSelectionChange: (bookmarkIds: string[]) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onUpdateLastVisited?: (id: string) => void;
  onViewDetails?: (bookmark: Bookmark) => void;
}

export const BookmarkTable: React.FC<BookmarkTableProps> = ({
  bookmarks,
  selectedBookmarks,
  onSelectionChange,
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

  const handleRowDoubleClick = (bookmark: Bookmark) => {
    if (onUpdateLastVisited) {
      onUpdateLastVisited(bookmark.id);
    }
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleUrlClick = (bookmark: Bookmark) => {
    if (onUpdateLastVisited) {
      onUpdateLastVisited(bookmark.id);
    }
  };

  const handleExternalLinkClick = (bookmark: Bookmark) => {
    if (onUpdateLastVisited) {
      onUpdateLastVisited(bookmark.id);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(bookmarks.map(bookmark => bookmark.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectBookmark = (bookmarkId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedBookmarks, bookmarkId]);
    } else {
      onSelectionChange(selectedBookmarks.filter(id => id !== bookmarkId));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM ''yy - HH:mm");
    } catch (error) {
      return 'Invalid date';
    }
  };

  const isAllSelected = bookmarks.length > 0 && selectedBookmarks.length === bookmarks.length;
  const isIndeterminate = selectedBookmarks.length > 0 && selectedBookmarks.length < bookmarks.length;

  return (
    <TooltipProvider>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all bookmarks"
                  {...(isIndeterminate && { 'data-state': 'indeterminate' })}
                />
              </TableHead>
              <TableHead>Bookmark</TableHead>
              <TableHead className="w-1/5">Tags</TableHead>
              <TableHead className="w-28">Last Visit</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookmarks.map((bookmark) => (
              <TableRow 
                key={bookmark.id} 
                className="cursor-pointer"
                onDoubleClick={() => handleRowDoubleClick(bookmark)}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedBookmarks.includes(bookmark.id)}
                    onCheckedChange={(checked) => handleSelectBookmark(bookmark.id, checked as boolean)}
                    aria-label={`Select ${bookmark.title}`}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <p className="font-medium">{bookmark.title}</p>
                        {bookmark.description && (
                          <p className="text-sm text-muted-foreground">{bookmark.description}</p>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Double-click row to open link in new tab</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleUrlClick(bookmark)}
                      className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {bookmark.url}
                    </a>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {bookmark.tags.map((tag, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
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
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-xs text-muted-foreground">
                        {bookmark.last_visited_at ? formatDate(bookmark.last_visited_at) : 'Never'}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Added: {formatDate(bookmark.created_at)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => onToggleFavorite(bookmark.id, !bookmark.is_favorite)}
                        className="cursor-pointer"
                      >
                        <Heart className={`h-4 w-4 mr-2 ${bookmark.is_favorite ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                        {bookmark.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(bookmark)}>
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleExternalLinkClick(bookmark)}>
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center w-full"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open link in new tab
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(bookmark.id)} className="text-red-600 dark:text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete bookmark
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};