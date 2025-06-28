
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface BookmarkTagsFieldProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onTagAdd: (e: React.KeyboardEvent) => void;
  onTagRemove: (tag: string) => void;
}

export const BookmarkTagsField: React.FC<BookmarkTagsFieldProps> = ({
  tags,
  tagInput,
  onTagInputChange,
  onTagAdd,
  onTagRemove
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="tags">Tags</Label>
      <Input
        id="tags"
        value={tagInput}
        onChange={(e) => onTagInputChange(e.target.value)}
        onKeyDown={onTagAdd}
        placeholder="Type and press Enter to add tags"
      />
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => onTagRemove(tag)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};
