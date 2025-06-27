
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookmarkPlus, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onAddBookmark: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddBookmark, searchQuery, onSearchChange }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Bookmark Bliss</h1>
          </div>
          
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={onAddBookmark} className="flex items-center space-x-2">
              <BookmarkPlus className="h-4 w-4" />
              <span>Add Bookmark</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
