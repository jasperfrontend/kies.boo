
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookmarkPlus, LogOut, Search, User, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/input';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onAddBookmark: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onApiKeysClick?: () => void;
  showApiKeys?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onAddBookmark, 
  searchQuery, 
  onSearchChange, 
  onApiKeysClick,
  showApiKeys 
}) => {
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleTitleClick = () => {
    // If we're showing API keys, close them first
    if (showApiKeys && onApiKeysClick) {
      onApiKeysClick();
    }
    // Navigate to home
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <TooltipProvider>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleTitleClick}
                    className="text-2xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    Bookmark Bliss
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Go to homepage</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search your bookmarks</p>
                  </TooltipContent>
                </Tooltip>
                <Input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10"
                />
              </form>
            </div>

            <div className="flex items-center space-x-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onAddBookmark} className="flex items-center space-x-2">
                    <BookmarkPlus className="h-4 w-4" />
                    <span>Add Bookmark</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new bookmark (Alt + A)</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="flex items-center space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">☀️</span>
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={toggleDarkMode}
                      />
                      <span className="text-sm">🌙</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle {isDarkMode ? 'light' : 'dark'} mode</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to="/hub" 
                      className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                        location.pathname === '/hub' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      Hub
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Go to Hub - view collections and manage bookmarks</p>
                  </TooltipContent>
                </Tooltip>
                
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full">
                          <User className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>User menu</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-56">
                    {onApiKeysClick && (
                      <DropdownMenuItem onClick={onApiKeysClick}>
                        <Key className="mr-2 h-4 w-4" />
                        <span>API Keys</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
