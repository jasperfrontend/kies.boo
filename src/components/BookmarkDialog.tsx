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
import { BookmarkFormFields } from './BookmarkFormFields';
import { BookmarkTagsField } from './BookmarkTagsField';
import { BookmarkSmartCollectionField } from './BookmarkSmartCollectionField';
import { useSmartCollections, ExtendedSmartCollection } from '@/hooks/useSmartCollections';
import { useToast } from '@/hooks/use-toast';
import type { Bookmark } from '@/types/smartCollections';

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark | null;
  existingBookmarks?: Bookmark[];
  onSave: (bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }, collectionData?: { collectionId?: string; newCollectionTitle?: string }) => void;
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

  // Smart collection state
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [isCreatingNewCollection, setIsCreatingNewCollection] = useState(false);

  const { smartCollections } = useSmartCollections(existingBookmarks);
  const { toast } = useToast();

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
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
        
        setTimeout(() => {
          setClipboardMessage('');
        }, 4000);

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
      setClipboardMessage('');
      // Reset collection fields when editing existing bookmark - but don't reset during the session
      if (!selectedCollectionId && !isCreatingNewCollection) {
        setSelectedCollectionId(null);
        setNewCollectionTitle('');
        setIsCreatingNewCollection(false);
      }
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setIsFavorite(false);
      setClipboardMessage('');
      setSelectedCollectionId(null);
      setNewCollectionTitle('');
      setIsCreatingNewCollection(false);
      
      if (open) {
        checkClipboard();
      }
    }
  }, [bookmark, open]);

  const parseUrlTitle = async (inputUrl: string) => {
    if (!inputUrl || isParsingTitle) return;
    
    let validUrl = inputUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    try {
      new URL(validUrl);
    } catch {
      return;
    }

    setIsParsingTitle(true);
    
    try {
      const result = await TitleExtractor.extractTitle(validUrl);
      setTitle(result.title);
      
      console.log(`Title extracted using ${result.source}:`, result.title);
      
    } catch (error) {
      console.log('Title extraction failed:', error);
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
    
    if (clipboardMessage) {
      setClipboardMessage('');
    }
    
    if (newUrl.trim() && (newUrl.includes('.') || newUrl.startsWith('http'))) {
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

  const handleToggleCreateNew = () => {
    setIsCreatingNewCollection(!isCreatingNewCollection);
    if (!isCreatingNewCollection) {
      setSelectedCollectionId(null);
    } else {
      setNewCollectionTitle('');
    }
  };

  const handleSave = () => {
    if (!title.trim() || !url.trim()) return;

    // Validate collection data
    if (isCreatingNewCollection && !newCollectionTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a collection name or cancel creating a new collection",
        variant: "destructive"
      });
      return;
    }

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
      ...(bookmark?.id && { id: bookmark.id })
    };

    // Prepare collection data - fix the logic here
    let collectionData = undefined;
    
    if (isCreatingNewCollection && newCollectionTitle.trim()) {
      collectionData = { newCollectionTitle: newCollectionTitle.trim() };
    } else if (selectedCollectionId) {
      collectionData = { collectionId: selectedCollectionId };
    }

    console.log('BookmarkDialog - About to call onSave with:', { bookmarkData, collectionData });
    
    onSave(bookmarkData, collectionData);
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
            autoFocus={!bookmark && open}
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
          
          <BookmarkTagsField
            tags={tags}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onTagAdd={handleAddTag}
            onTagRemove={removeTag}
          />

          <BookmarkSmartCollectionField
            smartCollections={smartCollections}
            selectedCollectionId={selectedCollectionId}
            onCollectionChange={setSelectedCollectionId}
            newCollectionTitle={newCollectionTitle}
            onNewCollectionTitleChange={setNewCollectionTitle}
            isCreatingNewCollection={isCreatingNewCollection}
            onToggleCreateNew={handleToggleCreateNew}
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
