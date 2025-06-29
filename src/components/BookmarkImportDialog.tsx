
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookmarkImporter } from './BookmarkImporter';

interface BookmarkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (bookmarks: any[]) => Promise<void>;
}

export const BookmarkImportDialog: React.FC<BookmarkImportDialogProps> = ({
  open,
  onOpenChange,
  onImport
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Bookmarks</DialogTitle>
          <DialogDescription>
            Import bookmarks from your browser's HTML export file. Folders will be converted to tags, 
            and original creation dates will be preserved.
          </DialogDescription>
        </DialogHeader>
        
        <BookmarkImporter onImport={onImport} />
      </DialogContent>
    </Dialog>
  );
};
