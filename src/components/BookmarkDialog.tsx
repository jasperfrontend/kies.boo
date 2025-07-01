import React, { useState, useEffect, useCallback } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Bookmark } from '@/types/smartCollections';

interface CollectionData {
  collectionId?: string;
  newCollectionTitle?: string;
  removeFromCollection?: boolean;
}

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark | null;
  existingBookmarks?: Bookmark[];
  onSave: (
    bookmarkData: Omit<Bookmark, 'id' | 'created_at'> & { id?: string }, 
    collectionData?: CollectionData
  ) => void;
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
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
  const [loadingCurrentCollection, setLoadingCurrentCollection] = useState(false);

  const { smartCollections } = useSmartCollections(existingBookmarks);
  const { toast } = useToast();
  const { user } = useAuth();

  // Force cleanup function to ensure body styles are reset
  const forceCleanupBodyStyles = useCallback(() => {
    // Small delay to ensure Radix has finished its cleanup
    setTimeout(() => {
      const body = document.body;
      
      // Remove all problematic attributes and styles
      body.removeAttribute('data-scroll-locked');
      body.style.removeProperty('pointer-events');
      body.style.removeProperty('overflow');
      body.style.removeProperty('padding-right');
      
      // If there's still a style attribute but it's empty, remove it entirely
      if (body.getAttribute('style') === '') {
        body.removeAttribute('style');
      }

    }, 100);
  }, []);

  // Enhanced onOpenChange handler
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      // Reset all state when closing
      setTitle('');
      setUrl('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setIsFavorite(false);
      setClipboardMessage('');
      setSelectedCollectionId(null);
      setCurrentCollectionId(null);
      setNewCollectionTitle('');
      setIsCreatingNewCollection(false);
      
      // Force cleanup body styles
      forceCleanupBodyStyles();
    }
    
    onOpenChange(newOpen);
  }, [onOpenChange, forceCleanupBodyStyles]);

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

  // Function to get current collection for a bookmark
  const getCurrentCollection = async (bookmarkId: string) => {
    if (!user) return null;
    
    setLoadingCurrentCollection(true);
    try {
      // Fixed: Use .select() instead of .maybeSingle() to handle multiple collections
      const { data, error } = await supabase
        .from('collection_bookmarks')
        .select(`
          collection_id,
          smart_collections (
            id,
            title,
            type
          )
        `)
        .eq('bookmark_id', bookmarkId);

      if (error) {
        console.error('Error fetching current collection:', error);
        return null;
      }

      // Handle multiple collections - return the first one, or null if none
      if (data && data.length > 0) {
        console.log(`Found ${data.length} collections for bookmark ${bookmarkId}`);
        
        // If bookmark is in multiple collections, log this for debugging
        if (data.length > 1) {
          console.warn(`Bookmark ${bookmarkId} is in ${data.length} collections - this should not happen normally`);
        }
        
        // Return the first collection found
        const firstCollection = data[0];
        if (firstCollection.smart_collections) {
          return {
            id: firstCollection.smart_collections.id,
            title: firstCollection.smart_collections.title,
            type: firstCollection.smart_collections.type
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error in getCurrentCollection:', error);
      return null;
    } finally {
      setLoadingCurrentCollection(false);
    }
  };

  useEffect(() => {
    const setupDialog = async () => {
      if (bookmark) {
        setTitle(bookmark.title);
        setUrl(bookmark.url);
        setDescription(bookmark.description || '');
        setTags(bookmark.tags);
        setIsFavorite(bookmark.is_favorite);
        setClipboardMessage('');
        
        // Get current collection for existing bookmark
        const currentCollection = await getCurrentCollection(bookmark.id);
        if (currentCollection) {
          setCurrentCollectionId(currentCollection.id);
          setSelectedCollectionId(currentCollection.id);
        } else {
          setCurrentCollectionId(null);
          setSelectedCollectionId(null);
        }
        
        setNewCollectionTitle('');
        setIsCreatingNewCollection(false);
      } else {
        setTitle('');
        setUrl('');
        setDescription('');
        setTags([]);
        setTagInput('');
        setIsFavorite(false);
        setClipboardMessage('');
        setSelectedCollectionId(null);
        setCurrentCollectionId(null);
        setNewCollectionTitle('');
        setIsCreatingNewCollection(false);
        
        if (open) {
          checkClipboard();
        }
      }
    };

    if (open) {
      setupDialog();
    }
  }, [bookmark, open, user]);

  // Cleanup effect to ensure body styles are reset when component unmounts
  useEffect(() => {
    return () => {
      if (!open) {
        forceCleanupBodyStyles();
      }
    };
  }, [open, forceCleanupBodyStyles]);

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

  // New function for direct tag addition from suggestions
  const handleAddTagDirect = (tagName: string) => {
    if (tagName.trim() && !tags.includes(tagName.trim())) {
      setTags([...tags, tagName.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleToggleCreateNew = () => {
    setIsCreatingNewCollection(!isCreatingNewCollection);
    if (!isCreatingNewCollection) {
      setSelectedCollectionId(currentCollectionId); // Reset to current collection
    } else {
      setNewCollectionTitle('');
    }
  };

  const handleCollectionChange = (collectionId: string | null) => {
    setSelectedCollectionId(collectionId);
    console.log('Collection changed to:', collectionId);
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

    // Prepare collection data with logic for changing collections
    let collectionData: CollectionData | undefined = undefined;
    
    if (isCreatingNewCollection && newCollectionTitle.trim()) {
      collectionData = { 
        newCollectionTitle: newCollectionTitle.trim(),
        removeFromCollection: currentCollectionId !== null // Remove from current if exists
      };
    } else if (selectedCollectionId === "none") {
      // User selected "No collection"
      collectionData = { 
        removeFromCollection: true 
      };
    } else if (selectedCollectionId && selectedCollectionId !== currentCollectionId) {
      // User selected a different collection
      collectionData = { 
        collectionId: selectedCollectionId,
        removeFromCollection: currentCollectionId !== null // Remove from current if exists
      };
    } else if (selectedCollectionId === currentCollectionId) {
      // No change needed
      collectionData = undefined;
    }

    console.log('BookmarkDialog - About to call onSave with:', { 
      bookmarkData, 
      collectionData, 
      currentCollectionId, 
      selectedCollectionId 
    });
    
    onSave(bookmarkData, collectionData);
    handleOpenChange(false);
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  // Get current collection info for display
  const currentCollection = currentCollectionId 
    ? smartCollections.find(c => c.id === currentCollectionId)
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            onTagAddDirect={handleAddTagDirect}
            onTagRemove={removeTag}
          />

          <BookmarkSmartCollectionField
            smartCollections={smartCollections}
            selectedCollectionId={selectedCollectionId}
            onCollectionChange={handleCollectionChange}
            newCollectionTitle={newCollectionTitle}
            onNewCollectionTitleChange={setNewCollectionTitle}
            isCreatingNewCollection={isCreatingNewCollection}
            onToggleCreateNew={handleToggleCreateNew}
            currentCollection={currentCollection}
            loadingCurrentCollection={loadingCurrentCollection}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
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