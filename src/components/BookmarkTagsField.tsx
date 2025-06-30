import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useTags } from '@/hooks/useTags';

interface BookmarkTagsFieldProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onTagAdd: (e: React.KeyboardEvent) => void;
  onTagRemove: (tag: string) => void;
  onTagAddDirect?: (tagName: string) => void; // New prop for direct tag addition
}

export const BookmarkTagsField: React.FC<BookmarkTagsFieldProps> = ({
  tags,
  tagInput,
  onTagInputChange,
  onTagAdd,
  onTagRemove,
  onTagAddDirect
}) => {
  const { tags: allUserTags } = useTags();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input and exclude already selected tags
  const suggestions = allUserTags
    .filter(tag => 
      tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !tags.includes(tag.name) &&
      tagInput.trim().length > 0
    )
    .slice(0, 5); // Limit to 5 suggestions

  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [tagInput, suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Tab' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        const selectedTag = suggestions[selectedSuggestionIndex];
        if (selectedTag) {
          onTagInputChange(selectedTag.name);
          setShowSuggestions(false);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    }
    
    // Handle Enter key
    if (e.key === 'Enter') {
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        const selectedTag = suggestions[selectedSuggestionIndex];
        if (selectedTag) {
          // Use direct tag addition if available, otherwise fallback to normal flow
          if (onTagAddDirect) {
            onTagAddDirect(selectedTag.name);
          } else {
            onTagInputChange(selectedTag.name);
            // Wait for next tick then add tag
            setTimeout(() => onTagAdd(e), 0);
          }
          setShowSuggestions(false);
        }
      } else {
        onTagAdd(e);
        setShowSuggestions(false);
      }
    }
  };

  const handleInputChange = (value: string) => {
    onTagInputChange(value);
    setShowSuggestions(value.trim().length > 0 && suggestions.length > 0);
  };

  const handleSuggestionClick = (tagName: string) => {
    if (onTagAddDirect) {
      // Use the direct addition method if available
      onTagAddDirect(tagName);
    } else {
      // Fallback to the old method
      onTagInputChange(tagName);
      setShowSuggestions(false);
      const mockEvent = {
        key: 'Enter',
        preventDefault: () => {}
      } as React.KeyboardEvent;
      setTimeout(() => onTagAdd(mockEvent), 0);
    }
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (tagInput.trim().length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks on suggestions
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="grid gap-2 relative">
      <Label htmlFor="tags">Tags</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="tags"
          value={tagInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Type and press Enter to add tags"
          autoComplete="off"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-32 overflow-y-auto"
          >
            {suggestions.map((tag, index) => (
              <div
                key={tag.id}
                className={`px-3 py-2 cursor-pointer text-sm ${
                  index === selectedSuggestionIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleSuggestionClick(tag.name)}
              >
                {tag.name}
              </div>
            ))}
          </div>
        )}
      </div>
      
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