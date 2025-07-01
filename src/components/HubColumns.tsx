// src/components/HubColumns.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Clock, Star, Plus, Minus } from 'lucide-react';
import { CustomBookmarkTable } from './CustomBookmarkTable';

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
  bookmarks?: Bookmark[]; // Make bookmarks optional to match ExtendedSmartCollection
}

interface SmartCollectionsColumnProps {
  smartCollections: SmartCollection[];
  expandedCollections: Set<string>;
  selectedBookmarks: string[];
  onToggleExpanded: (collectionId: string, isExpanded: boolean) => void;
  onDeleteCollection: (collectionId: string) => void;
  onSelectionChange: (selected: string[]) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onUpdateLastVisited: (id: string) => void;
  onTagsClick: (bookmark: Bookmark) => void;
  onActionsClick: (bookmark: Bookmark) => void;
}

interface RecentBookmarksColumnProps {
  recentBookmarks: Bookmark[];
  recentBookmarksCount: number;
  selectedBookmarks: string[];
  setRecentBookmarksCount: (count: number) => void;
  onSelectionChange: (selected: string[]) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onUpdateLastVisited: (id: string) => void;
  onTagsClick: (bookmark: Bookmark) => void;
  onActionsClick: (bookmark: Bookmark) => void;
}

interface ForgottenBookmarksColumnProps {
  forgottenBookmarks: Bookmark[];
  oldBookmarksDays: string;
  selectedBookmarks: string[];
  setOldBookmarksDays: (days: string) => void;
  onSelectionChange: (selected: string[]) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onUpdateLastVisited: (id: string) => void;
  onTagsClick: (bookmark: Bookmark) => void;
  onActionsClick: (bookmark: Bookmark) => void;
}

export const SmartCollectionsColumn: React.FC<SmartCollectionsColumnProps> = ({
  smartCollections,
  expandedCollections,
  selectedBookmarks,
  onToggleExpanded,
  onDeleteCollection,
  onSelectionChange,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateLastVisited,
  onTagsClick,
  onActionsClick,
}) => {
  return (
    <div className="w-1/3 min-w-0 flex flex-col">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-blue-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Smart Collections</h2>
          <Badge variant="outline" className="text-xs">{smartCollections.length}</Badge>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {smartCollections.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No smart collections yet</p>
          </div>
        ) : (
          smartCollections.map((collection) => (
            <div key={collection.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Collection Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onToggleExpanded(collection.id, !expandedCollections.has(collection.id))}
                        >
                          {expandedCollections.has(collection.id) ? '▼' : '▶'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {expandedCollections.has(collection.id) ? 'Collapse collection' : 'Expand collection'}
                      </TooltipContent>
                    </Tooltip>
                    <h3 className="font-medium text-sm">{collection.title}</h3>
                    <Badge variant="outline" className="text-xs">{collection.bookmarks?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={() => onDeleteCollection(collection.id)}
                        >
                          ×
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Delete collection
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              
              {/* Collection Content */}
              {expandedCollections.has(collection.id) && (
                <div className="overflow-hidden">
                  <CustomBookmarkTable
                    bookmarks={collection.bookmarks || []} // Handle optional bookmarks
                    selectedBookmarks={selectedBookmarks}
                    onSelectionChange={onSelectionChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleFavorite={onToggleFavorite}
                    onUpdateLastVisited={onUpdateLastVisited}
                    onTagsClick={onTagsClick}
                    onActionsClick={onActionsClick}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const RecentBookmarksColumn: React.FC<RecentBookmarksColumnProps> = ({
  recentBookmarks,
  recentBookmarksCount,
  selectedBookmarks,
  setRecentBookmarksCount,
  onSelectionChange,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateLastVisited,
  onTagsClick,
  onActionsClick,
}) => {
  return (
    <div className="w-1/3 min-w-0 flex flex-col">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Bookmarks</h2>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setRecentBookmarksCount(Math.max(4, recentBookmarksCount - 2))}
                  disabled={recentBookmarksCount <= 4}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Show fewer bookmarks</TooltipContent>
            </Tooltip>
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[2rem] text-center">
              {recentBookmarksCount}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setRecentBookmarksCount(Math.min(20, recentBookmarksCount + 2))}
                  disabled={recentBookmarksCount >= 20}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Show more bookmarks</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
        {recentBookmarks.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No bookmarks yet</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <CustomBookmarkTable
              bookmarks={recentBookmarks}
              selectedBookmarks={selectedBookmarks}
              onSelectionChange={onSelectionChange}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onUpdateLastVisited={onUpdateLastVisited}
              onTagsClick={onTagsClick}
              onActionsClick={onActionsClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const ForgottenBookmarksColumn: React.FC<ForgottenBookmarksColumnProps> = ({
  forgottenBookmarks,
  oldBookmarksDays,
  selectedBookmarks,
  setOldBookmarksDays,
  onSelectionChange,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateLastVisited,
  onTagsClick,
  onActionsClick,
}) => {
  return (
    <div className="w-1/3 min-w-0 flex flex-col">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Forgotten Bookmarks</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Not visited in:</span>
          <Select value={oldBookmarksDays} onValueChange={setOldBookmarksDays}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="100">100 days</SelectItem>
              <SelectItem value="365">365 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2">
        {forgottenBookmarks.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No forgotten bookmarks in {oldBookmarksDays} days</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <CustomBookmarkTable
              bookmarks={forgottenBookmarks}
              selectedBookmarks={selectedBookmarks}
              onSelectionChange={onSelectionChange}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onUpdateLastVisited={onUpdateLastVisited}
              onTagsClick={onTagsClick}
              onActionsClick={onActionsClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};