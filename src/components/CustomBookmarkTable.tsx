// src/components/CustomBookmarkTable.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tag, History, MoreVertical, Heart } from 'lucide-react';

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

interface CustomBookmarkTableProps {
  bookmarks: Bookmark[];
  selectedBookmarks: string[];
  onSelectionChange: (selected: string[]) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onUpdateLastVisited: (id: string) => void;
  onTagsClick: (bookmark: Bookmark) => void;
  onActionsClick: (bookmark: Bookmark) => void;
}

export const CustomBookmarkTable: React.FC<CustomBookmarkTableProps> = ({
  bookmarks,
  selectedBookmarks,
  onSelectionChange,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateLastVisited,
  onTagsClick,
  onActionsClick,
}) => {
  const formatTooltipDate = (bookmark: Bookmark) => {
    const created = new Date(bookmark.created_at).toLocaleDateString();
    const lastVisited = bookmark.last_visited_at 
      ? new Date(bookmark.last_visited_at).toLocaleDateString()
      : 'Never visited';
    return `Created: ${created}\nLast visited: ${lastVisited}`;
  };

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="w-8 p-2"></th>
            <th className="text-left p-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bookmark</th>
            <th className="w-8 p-2">
              <Tooltip>
                <TooltipTrigger>
                  <Tag className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>Tags</TooltipContent>
              </Tooltip>
            </th>
            <th className="w-8 p-2">
              <Tooltip>
                <TooltipTrigger>
                  <History className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>Last Visit</TooltipContent>
              </Tooltip>
            </th>
            <th className="w-8 p-2"></th>
          </tr>
        </thead>
        <tbody>
          {bookmarks.map((bookmark) => (
            <tr key={bookmark.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedBookmarks.includes(bookmark.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onSelectionChange([...selectedBookmarks, bookmark.id]);
                    } else {
                      onSelectionChange(selectedBookmarks.filter(id => id !== bookmark.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  {bookmark.favicon_url && (
                    <img 
                      src={bookmark.favicon_url} 
                      alt="" 
                      className="w-4 h-4 flex-shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onUpdateLastVisited(bookmark.id)}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                      title={bookmark.title}
                    >
                      {bookmark.title}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={bookmark.url}>
                      {bookmark.url}
                    </p>
                  </div>
                  {bookmark.is_favorite && (
                    <Heart className="h-3 w-3 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </td>
              <td className="p-2 text-center">
                {bookmark.tags.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onTagsClick(bookmark)}
                      >
                        <Tag className="h-3 w-3 text-blue-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Tagged: {bookmark.tags.join(', ')}
                    </TooltipContent>
                  </Tooltip>
                )}
              </td>
              <td className="p-2 text-center">
                <Tooltip>
                  <TooltipTrigger>
                    <History className="h-3 w-3 text-gray-400 mx-auto" />
                  </TooltipTrigger>
                  <TooltipContent className="whitespace-pre-line">
                    {formatTooltipDate(bookmark)}
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="p-2 text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onActionsClick(bookmark)}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Actions menu
                  </TooltipContent>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};