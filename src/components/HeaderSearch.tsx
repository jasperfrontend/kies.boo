import React, { useRef, useEffect, useState } from 'react'; // Voeg useState toe
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface HeaderSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false); // Nieuwe state voor mobiele detectie

  useEffect(() => {
    // Functie om de schermbreedte te controleren
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is de standaard 'md' breakpoint van Tailwind CSS
    };

    // Voer de controle direct uit bij het mounten van de component
    checkScreenSize();

    // Voeg een event listener toe voor 'resize' events
    window.addEventListener('resize', checkScreenSize);

    // Ruim de event listener op bij het unmounten van de component
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []); // De lege array zorgt ervoor dat dit effect slechts één keer wordt uitgevoerd

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Alt+K combination
      if (event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Bepaal de placeholder tekst op basis van de schermgrootte
  const placeholderText = isMobile
    ? 'Search Bookmarks'
    : 'Search Bookmarks (Alt+K)';

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          placeholder={placeholderText}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};