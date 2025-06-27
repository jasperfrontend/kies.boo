
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Heart, Edit, Trash2 } from 'lucide-react';

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

interface BookmarkTableProps {
  bookmarks: Bookmark[];
  selectedBookmarks: string[];
  onSelectionChange: (bookmarkIds: string[]) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

export const BookmarkTable: React.FC<BookmarkTableProps> = ({
  bookmarks,
  selectedBookmarks,
  onSelectionChange,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank');
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

  const isAllSelected = bookmarks.length > 0 && selectedBookmarks.length === bookmarks.length;
  const isIndeterminate = selectedBookmarks.length > 0 && selectedBookmarks.length < bookmarks.length;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all bookmarks"
                {...(isIndeterminate && { 'data-state': 'indeterminate' })}
              />
            </TableHead>
            <TableHead className="w-8"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookmarks.map((bookmark) => (
            <TableRow key={bookmark.id}>
              <TableCell>
                <Checkbox
                  checked={selectedBookmarks.includes(bookmark.id)}
                  onCheckedChange={(checked) => handleSelectBookmark(bookmark.id, checked as boolean)}
                  aria-label={`Select ${bookmark.title}`}
                />
              </TableCell>
              <TableCell>
                {bookmark.favicon_url && (
                  <img 
                    src={bookmark.favicon_url} 
                    alt="" 
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium">{bookmark.title}</div>
                <div className="text-sm text-muted-foreground truncate max-w-xs">
                  {bookmark.url}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground max-w-xs truncate">
                  {bookmark.description}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {bookmark.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFavorite(bookmark.id, !bookmark.is_favorite)}
                    className={bookmark.is_favorite ? 'text-red-500' : 'text-gray-400'}
                  >
                    <Heart className={`h-4 w-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(bookmark)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(bookmark.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenUrl(bookmark.url)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
