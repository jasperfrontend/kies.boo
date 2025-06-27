
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
import { Button } from '@/components/ui/button';

interface SeedBookmarksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onRemoveFeature: () => void;
}

export const SeedBookmarksModal: React.FC<SeedBookmarksModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onRemoveFeature
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add 100 Random Bookmarks?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you really sure you want to add 100 random websites to your bookmark list? 
            This will clutter your bookmarks with sample data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <AlertDialogAction onClick={onConfirm}>
            Yes, add them
          </AlertDialogAction>
          <AlertDialogCancel>
            No, I don't want this right now
          </AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={onRemoveFeature}
            className="w-full"
          >
            No, remove this stupid feature :D
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
