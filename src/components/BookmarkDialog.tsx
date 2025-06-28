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
import { TitleExtractor } from '@/utils/titleExtractor';
import { BookmarkUrlField } from './BookmarkUrlField';
import { BookmarkTitleField } from './BookmarkTitleField';
import { BookmarkTagsAutocomplete } from './BookmarkTagsAutocomplete';
import { BookmarkFormFields } from './BookmarkFormFields';

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
  existingBookmarks?: Bookmark[];
  onSave: (bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }) => void;
}

export const BookmarkDialog: React.FC<BookmarkDialogProps> = ({
  open,
  onOpenChange,
  bookmark,
  existingBookmarks = [],
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

  // Get all available tags from existing bookmarks
  const availableTags = React.useMemo(() => {
    const allTags = existingBookmarks.flatMap(bookmark => bookmark.tags);
    return [...new Set(allTags)].sort();
  }, [existingBookmarks]);

  console.log('Available tags for autocomplete:', availableTags);
  console.log('Current tags:', tags);
  console.log('Tag input:', tagInput);

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
    console.log('handleAddTag called with key:', e.key, 'tagInput:', tagInput);
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        console.log('Added tag, new tags:', newTags);
      }
      setTagInput('');
    }
  };

  const handleTagSelect = (selectedTag: string) => {
    console.log('handleTagSelect called with:', selectedTag);
    if (!tags.includes(selectedTag)) {
      const newTags = [...tags, selectedTag];
      setTags(newTags);
      console.log('Selected tag, new tags:', newTags);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    console.log('removeTag called with:', tagToRemove);
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    console.log('Removed tag, new tags:', newTags);
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
          <BookmarkUrlField
            url={url}
            onUrlChange={handleUrlChange}
            clipboardMessage={clipboardMessage}
          />
          
          <BookmarkTitleField
            title={title}
            onTitleChange={setTitle}
            isParsingTitle={isParsingTitle}
          />
          
          <BookmarkFormFields
            description={description}
            onDescriptionChange={setDescription}
            isFavorite={isFavorite}
            onFavoriteChange={setIsFavorite}
          />
          
          <BookmarkTagsAutocomplete
            tags={tags}
            tagInput={tagInput}
            availableTags={availableTags}
            onTagInputChange={setTagInput}
            onTagAdd={handleAddTag}
            onTagRemove={removeTag}
            onTagSelect={handleTagSelect}
          />
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
