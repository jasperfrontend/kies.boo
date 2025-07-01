// src/components/HubModals.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tag, ExternalLink, Edit, Heart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface HubModalsProps {
  // Tags Modal
  tagsModalOpen: boolean;
  setTagsModalOpen: (open: boolean) => void;
  selectedBookmarkForTags: Bookmark | null;
  
  // Actions Modal
  actionsModalOpen: boolean;
  setActionsModalOpen: (open: boolean) => void;
  selectedBookmarkForActions: Bookmark | null;
  
  // Handlers
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onUpdateLastVisited: (id: string) => void;
}

export const HubModals: React.FC<HubModalsProps> = ({
  tagsModalOpen,
  setTagsModalOpen,
  selectedBookmarkForTags,
  actionsModalOpen,
  setActionsModalOpen,
  selectedBookmarkForActions,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateLastVisited,
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Tags Modal */}
      <Dialog open={tagsModalOpen} onOpenChange={setTagsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {selectedBookmarkForTags?.tags.map((tag, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(tag)}`);
                  setTagsModalOpen(false);
                }}
              >
                <Tag className="h-4 w-4 mr-2" />
                {tag}
              </Button>
            )) || (
              <p className="text-gray-500 dark:text-gray-400">No tags</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Actions Modal */}
      <Dialog open={actionsModalOpen} onOpenChange={setActionsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {selectedBookmarkForActions && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    window.open(selectedBookmarkForActions.url, '_blank');
                    onUpdateLastVisited(selectedBookmarkForActions.id);
                    setActionsModalOpen(false);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    onEdit(selectedBookmarkForActions);
                    setActionsModalOpen(false);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    onToggleFavorite(selectedBookmarkForActions.id, selectedBookmarkForActions.is_favorite);
                    setActionsModalOpen(false);
                  }}
                >
                  <Heart className={`h-4 w-4 mr-2 ${selectedBookmarkForActions.is_favorite ? 'text-red-500' : ''}`} />
                  {selectedBookmarkForActions.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => {
                    onDelete(selectedBookmarkForActions.id);
                    setActionsModalOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};