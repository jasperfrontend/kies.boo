
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { X } from 'lucide-react';

interface BookmarkTagsAutocompleteProps {
  tags: string[];
  tagInput: string;
  availableTags: string[];
  onTagInputChange: (value: string) => void;
  onTagAdd: (e: React.KeyboardEvent) => void;
  onTagRemove: (tag: string) => void;
  onTagSelect: (tag: string) => void;
}

// Simple fuzzy matching function
const fuzzyMatch = (pattern: string, text: string): boolean => {
  const patternLower = pattern.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Direct substring match gets priority
  if (textLower.includes(patternLower)) {
    return true;
  }
  
  // Fuzzy matching - check if all pattern characters appear in order
  let patternIndex = 0;
  for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
    if (textLower[i] === patternLower[patternIndex]) {
      patternIndex++;
    }
  }
  return patternIndex === patternLower.length;
};

export const BookmarkTagsAutocomplete: React.FC<BookmarkTagsAutocompleteProps> = ({
  tags,
  tagInput,
  availableTags,
  onTagInputChange,
  onTagAdd,
  onTagRemove,
  onTagSelect
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tagInput.trim().length > 0) {
      const filtered = availableTags
        .filter(tag => !tags.includes(tag) && fuzzyMatch(tagInput.trim(), tag))
        .sort((a, b) => {
          // Prioritize exact matches and substring matches
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          const inputLower = tagInput.toLowerCase();
          
          const aStartsWith = aLower.startsWith(inputLower);
          const bStartsWith = bLower.startsWith(inputLower);
          const aIncludes = aLower.includes(inputLower);
          const bIncludes = bLower.includes(inputLower);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          if (aIncludes && !bIncludes) return -1;
          if (!aIncludes && bIncludes) return 1;
          
          return a.localeCompare(b);
        })
        .slice(0, 5); // Limit to 5 suggestions
      
      setFilteredTags(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredTags([]);
    }
  }, [tagInput, availableTags, tags]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown' && showSuggestions && filteredTags.length > 0) {
      e.preventDefault();
      // Focus first suggestion
      const firstItem = document.querySelector('[data-tag-suggestion]') as HTMLElement;
      firstItem?.focus();
    } else {
      onTagAdd(e);
    }
  };

  const handleTagSelect = (tag: string) => {
    onTagSelect(tag);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="tags">Tags</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="tags"
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => tagInput.trim().length > 0 && filteredTags.length > 0 && setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking on them
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder="Type and press Enter to add tags"
          autoComplete="off"
        />
        
        {showSuggestions && filteredTags.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1">
            <Command className="rounded-lg border shadow-md">
              <CommandList>
                <CommandEmpty>No suggestions found.</CommandEmpty>
                <CommandGroup>
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag}
                      data-tag-suggestion
                      onSelect={() => handleTagSelect(tag)}
                      className="cursor-pointer"
                    >
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
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
