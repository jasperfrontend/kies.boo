
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SmartCollectionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: {
    id: string;
    title: string;
  } | null;
  onSave: (collectionId: string, newTitle: string) => void;
}

export const SmartCollectionEditDialog: React.FC<SmartCollectionEditDialogProps> = ({
  open,
  onOpenChange,
  collection,
  onSave
}) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (collection) {
      setTitle(collection.title);
    } else {
      setTitle('');
    }
  }, [collection]);

  const handleSave = () => {
    if (!collection || !title.trim()) return;

    onSave(collection.id, title.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Smart Collection</DialogTitle>
          <DialogDescription>
            Update the title of your smart collection.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Collection Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter collection title"
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
