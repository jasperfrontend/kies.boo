
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ExtendedSmartCollection } from '@/hooks/useSmartCollections';

interface BookmarkSmartCollectionFieldProps {
  smartCollections: ExtendedSmartCollection[];
  selectedCollectionId: string | null;
  onCollectionChange: (collectionId: string | null) => void;
  newCollectionTitle: string;
  onNewCollectionTitleChange: (title: string) => void;
  isCreatingNewCollection: boolean;
  onToggleCreateNew: () => void;
}

export const BookmarkSmartCollectionField: React.FC<BookmarkSmartCollectionFieldProps> = ({
  smartCollections,
  selectedCollectionId,
  onCollectionChange,
  newCollectionTitle,
  onNewCollectionTitleChange,
  isCreatingNewCollection,
  onToggleCreateNew
}) => {
  // Filter out auto-generated collections for selection
  const manualCollections = smartCollections.filter(collection => 
    !collection.id.startsWith('auto-')
  );

  return (
    <div className="grid gap-2">
      <Label htmlFor="smartCollection">Smart Collection (Optional)</Label>
      
      {!isCreatingNewCollection ? (
        <div className="flex gap-2">
          <Select value={selectedCollectionId || "none"} onValueChange={(value) => onCollectionChange(value === "none" ? null : value)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a collection..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No collection</SelectItem>
              {manualCollections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleCreateNew}
            className="px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="New collection name..."
            value={newCollectionTitle}
            onChange={(e) => onNewCollectionTitleChange(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleCreateNew}
            className="px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
