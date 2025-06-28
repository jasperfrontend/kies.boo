
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { SeedBookmarksButton } from '@/components/SeedBookmarksButton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Grid3X3, 
  Table, 
  Star, 
  LayoutDashboard, 
  Layers3,
  User,
  LogOut 
} from 'lucide-react';

interface HeaderProps {
  onAddBookmark?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onApiKeysClick?: () => void;
  showApiKeys?: boolean;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
  showFavorites?: boolean;
  onShowFavoritesChange?: (show: boolean) => void;
  onBookmarkAdded?: () => void;
  onSeedBookmarksAdded?: () => void;
  onSeedFeatureRemoved?: () => void;
  bookmarkCount?: number;
  favoritesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onAddBookmark,
  searchQuery,
  onSearchChange,
  onApiKeysClick,
  showApiKeys,
  viewMode,
  onViewModeChange,
  showFavorites,
  onShowFavoritesChange,
  onBookmarkAdded,
  onSeedBookmarksAdded,
  onSeedFeatureRemoved,
  bookmarkCount = 0,
  favoritesCount = 0
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isCurrentPage = (path: string) => location.pathname === path;

  return (
    <div className="border-b bg-white dark:bg-gray-900 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {/* Top row - Logo, Navigation, and User actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bookmark Manager
              </h1>
              
              <nav className="flex items-center gap-2">
                <Button
                  variant={isCurrentPage('/') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/')}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                
                <Button
                  variant={isCurrentPage('/hub') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/hub')}
                  className="gap-2"
                >
                  <Layers3 className="h-4 w-4" />
                  Hub
                </Button>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isCurrentPage('/profile') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate('/profile')}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Second row - Search and actions (only show on dashboard) */}
          {isCurrentPage('/') && (
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search bookmarks..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <span className="text-xs">Total: {bookmarkCount}</span>
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    <span className="text-xs">{favoritesCount}</span>
                  </Badge>
                </div>
                
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                
                {showFavorites !== undefined && onShowFavoritesChange && (
                  <Button
                    variant={showFavorites ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onShowFavoritesChange(!showFavorites)}
                    className="gap-2"
                  >
                    <Star className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
                    {showFavorites ? 'All' : 'Favorites'}
                  </Button>
                )}
                
                {viewMode && onViewModeChange && (
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onViewModeChange('grid')}
                      className="rounded-r-none border-r"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onViewModeChange('table')}
                      className="rounded-l-none"
                    >
                      <Table className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <Button size="sm" className="gap-2" onClick={onAddBookmark}>
                  <Plus className="h-4 w-4" />
                  Add Bookmark
                </Button>
                
                {onSeedBookmarksAdded && onSeedFeatureRemoved && (
                  <SeedBookmarksButton
                    onBookmarksAdded={onSeedBookmarksAdded}
                    onFeatureRemoved={onSeedFeatureRemoved}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
