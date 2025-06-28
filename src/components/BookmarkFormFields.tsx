
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BookmarkFormFieldsProps {
  description: string;
  onDescriptionChange: (description: string) => void;
  isFavorite: boolean;
  onFavoriteChange: (isFavorite: boolean) => void;
}

export const BookmarkFormFields: React.FC<BookmarkFormFieldsProps> = ({
  description,
  onDescriptionChange,
  isFavorite,
  onFavoriteChange
}) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add a description..."
          rows={3}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="favorite"
          checked={isFavorite}
          onChange={(e) => onFavoriteChange(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="favorite">Mark as favorite</Label>
      </div>
    </>
  );
};
