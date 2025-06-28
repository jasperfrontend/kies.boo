
import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface BookmarkUrlFieldProps {
  url: string;
  onUrlChange: (url: string) => void;
  clipboardMessage: string;
  autoFocus?: boolean;
}

export const BookmarkUrlField: React.FC<BookmarkUrlFieldProps> = ({
  url,
  onUrlChange,
  clipboardMessage,
  autoFocus = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Small delay to ensure the dialog is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <div className="grid gap-2">
      <Label htmlFor="url">URL</Label>
      <Input
        ref={inputRef}
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
