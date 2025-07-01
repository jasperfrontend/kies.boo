
import React from 'react';
import { HeaderNavigation } from '@/components/HeaderNavigation';
import { HeaderUserActions } from '@/components/HeaderUserActions';
import { HeaderMobileMenu } from '@/components/HeaderMobileMenu';
import { HeaderSearch } from '@/components/HeaderSearch';
import { HeaderDashboardActions } from '@/components/HeaderDashboardActions';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onAddBookmark?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onApiKeysClick?: () => void;
  showApiKeys?: boolean;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
  compactMode?: boolean;
  onCompactModeChange?: (compact: boolean) => void;
  showFavorites?: boolean;
  onShowFavoritesChange?: (show: boolean) => void;
  bookmarkCount?: number;
  favoritesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onAddBookmark,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  compactMode,
  onCompactModeChange,
  showFavorites,
  onShowFavoritesChange,
  bookmarkCount = 0,
  favoritesCount = 0
}) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="border-b bg-white dark:bg-gray-900 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top row - Logo, Navigation, and User actions */}
          <div className="flex items-center justify-between">

            {!isMobile && <HeaderNavigation />}

            <HeaderSearch
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
            <div className="flex items-center gap-2">
              {isMobile ? (
                <HeaderMobileMenu
                  isOpen={mobileMenuOpen}
                  onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                  onClose={() => setMobileMenuOpen(false)}
                />
              ) : (
                <HeaderUserActions />
              )}
            </div>
          </div>

          {/* Second row - Search and actions */}
          <div className="flex flex-col gap-3 sm:gap-4">

            <HeaderDashboardActions
              bookmarkCount={bookmarkCount}
              favoritesCount={favoritesCount}
              showFavorites={showFavorites}
              onShowFavoritesChange={onShowFavoritesChange}
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              compactMode={compactMode}
              onCompactModeChange={onCompactModeChange}
              onAddBookmark={onAddBookmark}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
