import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Loader2 } from 'lucide-react';
import { ExtendedSmartCollection } from '@/hooks/useSmartCollections';

interface BookmarkSmartCollectionFieldProps {
  smartCollections: ExtendedSmartCollection[];
  selectedCollectionId: string | null;
  onCollectionChange: (collectionId: string | null) => void;
  newCollectionTitle: string;
  onNewCollectionTitleChange: (title: string) => void;
  isCreatingNewCollection: boolean;
  onToggleCreateNew: () => void;
  currentCollection?: ExtendedSmartCollection | null;
  loadingCurrentCollection?: boolean;
}

export const BookmarkSmartCollectionField: React.FC<BookmarkSmartCollectionFieldProps> = ({
  smartCollections,
  selectedCollectionId,
  onCollectionChange,
  newCollectionTitle,
  onNewCollectionTitleChange,
  isCreatingNewCollection,
  onToggleCreateNew,
  currentCollection,
  loadingCurrentCollection = false
}) => {
  // Filter out auto-generated collections for selection
  const manualCollections = smartCollections.filter(collection => 
    !collection.id.startsWith('auto-')
  );

  const handleValueChange = (value: string) => {
    console.log('Select value changed to:', value);
    if (value === "none") {
      onCollectionChange(null);
    } else {
      onCollectionChange(value);
    }
  };

  const getSelectValue = () => {
    if (selectedCollectionId) {
      return selectedCollectionId;
    }
    return "none";
  };

  const getSelectDisplayText = () => {
    if (selectedCollectionId && selectedCollectionId !== "none") {
      const collection = manualCollections.find(c => c.id === selectedCollectionId);
      return collection?.title || "Unknown Collection";
    }
    return "No collection";
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="smartCollection">Smart Collection (Optional)</Label>
      
      {/* Show current collection status */}
      {loadingCurrentCollection && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading current collection...
        </div>
      )}
      
      {currentCollection && !loadingCurrentCollection && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Currently in:</span>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {currentCollection.title}
          </Badge>
        </div>
      )}

      {!currentCollection && !loadingCurrentCollection && selectedCollectionId === null && (
        <div className="text-sm text-muted-foreground">
          This bookmark is not in any collection
        </div>
      )}
      
      {!isCreatingNewCollection ? (
        <div className="flex gap-2">
          <Select 
            value={getSelectValue()} 
            onValueChange={handleValueChange}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a collection...">
                {getSelectDisplayText()}
              </SelectValue>
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

      {/* Show what will happen */}
      {selectedCollectionId !== currentCollection?.id && (
        <div className="text-xs text-muted-foreground">
          {selectedCollectionId === null || selectedCollectionId === "none" ? (
            currentCollection ? 
              `Will remove from "${currentCollection.title}"` : 
              null
          ) : isCreatingNewCollection ? (
            currentCollection ?
              `Will move from "${currentCollection.title}" to new collection "${newCollectionTitle}"` :
              `Will add to new collection "${newCollectionTitle}"`
          ) : (
            (() => {
              const targetCollection = manualCollections.find(c => c.id === selectedCollectionId);
              return currentCollection ?
                `Will move from "${currentCollection.title}" to "${targetCollection?.title}"` :
                `Will add to "${targetCollection?.title}"`;
            })()
          )}
        </div>
      )}
    </div>
  );
};