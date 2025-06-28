
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface BookmarkUrlFieldProps {
  url: string;
  onUrlChange: (url: string) => void;
  clipboardMessage: string;
}

export const BookmarkUrlField: React.FC<BookmarkUrlFieldProps> = ({
  url,
  onUrlChange,
  clipboardMessage
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="url">URL</Label>
      <Input
        id="url"
        type="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://example.com"
      />
      {clipboardMessage && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          {clipboardMessage}
        </div>
      )}
    </div>
  );
};
