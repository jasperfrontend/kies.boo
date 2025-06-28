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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, Check } from 'lucide-react';
import { TitleExtractor } from '@/utils/titleExtractor';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
}

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark | null;
  onSave: (bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }) => void;
}

export const BookmarkDialog: React.FC<BookmarkDialogProps> = ({
  open,
  onOpenChange,
  bookmark,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isParsingTitle, setIsParsingTitle] = useState(false);
  const [clipboardMessage, setClipboardMessage] = useState('');

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      // Try with https:// prefix
      try {
        new URL('https://' + string);
        return string.includes('.') && !string.includes(' ');
      } catch (_) {
        return false;
      }
    }
  };

  const checkClipboard = async () => {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && isValidUrl(clipboardText.trim())) {
        const cleanUrl = clipboardText.trim();
        setUrl(cleanUrl);
        setClipboardMessage('URL in your clipboard detected and prefilled for you');
        
        // Auto-hide the message after 4 seconds
        setTimeout(() => {
          setClipboardMessage('');
        }, 4000);

        // Auto-parse title for the clipboard URL
        parseUrlTitle(cleanUrl);
      }
    } catch (error) {
      console.log('Could not read clipboard:', error);
    }
  };

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setUrl(bookmark.url);
      setDescription(bookmark.description || '');
      setTags(bookmark.tags);
      setIsFavorite(bookmark.is_favorite);
      setClipboardMessage(''); // Clear clipboard message when editing
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setIsFavorite(false);
      setClipboardMessage('');
      
      // Only check clipboard for new bookmarks
      if (open) {
        checkClipboard();
      }
    }
  }, [bookmark, open]);

  const parseUrlTitle = async (inputUrl: string) => {
    if (!inputUrl || isParsingTitle) return;
    
    // Basic URL validation
    let validUrl = inputUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    try {
      new URL(validUrl);
    } catch {
      return; // Invalid URL, don't parse
    }

    setIsParsingTitle(true);
    
    try {
      const result = await TitleExtractor.extractTitle(validUrl);
      setTitle(result.title);
      
      // Log the extraction method for debugging
      console.log(`Title extracted using ${result.source}:`, result.title);
      
    } catch (error) {
      console.log('Title extraction failed:', error);
      // Final fallback: use domain name
      try {
        const urlObj = new URL(validUrl);
        const domain = urlObj.hostname.replace('www.', '');
        setTitle(domain.charAt(0).toUpperCase() + domain.slice(1));
      } catch {
        // If all else fails, leave title empty for user to fill
      }
    } finally {
      setIsParsingTitle(false);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    
    // Clear clipboard message when user manually types
    if (clipboardMessage) {
      setClipboardMessage('');
    }
    
    // Parse title when URL looks complete
    if (newUrl.trim() && (newUrl.includes('.') || newUrl.startsWith('http'))) {
      // Debounce the parsing
      const timeoutId = setTimeout(() => {
        parseUrlTitle(newUrl);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim() || !url.trim()) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const bookmarkData = {
      title: title.trim(),
      url: finalUrl,
      description: description.trim() || undefined,
      favicon_url: `https://www.google.com/s2/favicons?domain=${finalUrl}`,
      tags,
      is_favorite: isFavorite,
      ...(bookmark?.id && { id: bookmark.id }) // Include ID when editing
    };

    console.log('Submitting bookmark data:', bookmarkData);
    onSave(bookmarkData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {bookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
          </DialogTitle>
          <DialogDescription>
            {bookmark ? 'Update your bookmark details' : 'Save a new bookmark to your collection'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com"
            />
            {clipboardMessage && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                {clipboardMessage}
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <div className="relative">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type and press Enter to add tags"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="favorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="favorite">Mark as favorite</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !url.trim() || isParsingTitle}>
            {bookmark ? 'Update' : 'Save'} Bookmark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
