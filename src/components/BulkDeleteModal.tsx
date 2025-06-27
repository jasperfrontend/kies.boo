
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BulkDeleteModalProps {
  isOpen: boolean;
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  selectedCount,
  onConfirm,
  onCancel
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Selected Bookmarks</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedCount} selected bookmark{selectedCount !== 1 ? 's' : ''}? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete {selectedCount} Bookmark{selectedCount !== 1 ? 's' : ''}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
