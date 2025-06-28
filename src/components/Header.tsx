
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { SeedBookmarksButton } from '@/components/SeedBookmarksButton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Search, 
  Plus, 
  Grid3X3, 
  Table, 
  Star, 
  LayoutDashboard, 
  Layers3,
  User,
  LogOut,
  Menu
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
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top row - Logo, Navigation, and User actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Kies.boo
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 -mt-1">
                  Bookmarks for nerds
                </p>
              </div>
              
              {!isMobile && (
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
              )}
            </div>

            <div className="flex items-center gap-2">
              {isMobile ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {isMobile && mobileMenuOpen && (
            <div className="border-t pt-3 space-y-2">
              <div className="flex flex-col gap-2">
                <Button
                  variant={isCurrentPage('/') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    navigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                
                <Button
                  variant={isCurrentPage('/hub') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    navigate('/hub');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <Layers3 className="h-4 w-4" />
                  Hub
                </Button>
                
                <Button
                  variant={isCurrentPage('/profile') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {/* Second row - Search and actions (only show on dashboard) */}
          {isCurrentPage('/') && (
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="w-full max-w-md">
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
              
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1">
                    <span className="text-xs">Total: {bookmarkCount}</span>
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    <span className="text-xs">{favoritesCount}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
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
                        className="rounded-r-none border-r px-2 sm:px-3"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('table')}
                        className="rounded-l-none px-2 sm:px-3"
                      >
                        <Table className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <Button size="sm" className="gap-2" onClick={onAddBookmark}>
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Bookmark</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                  
                  {onSeedBookmarksAdded && onSeedFeatureRemoved && (
                    <SeedBookmarksButton
                      onBookmarksAdded={onSeedBookmarksAdded}
                      onFeatureRemoved={onSeedFeatureRemoved}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
