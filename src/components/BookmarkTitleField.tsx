
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface BookmarkTitleFieldProps {
  title: string;
  onTitleChange: (title: string) => void;
  isParsingTitle: boolean;
}

export const BookmarkTitleField: React.FC<BookmarkTitleFieldProps> = ({
  title,
  onTitleChange,
  isParsingTitle
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="title">Title</Label>
      <div className="relative">
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter bookmark title"
          disabled={isParsingTitle}
          className={isParsingTitle ? 'pr-10' : ''}
        />
        {isParsingTitle && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>
      {isParsingTitle && (
        <p className="text-xs text-gray-500">Parsing title from URL...</p>
      )}
    </div>
  );
};
