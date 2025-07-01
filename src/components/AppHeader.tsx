// src/components/AppHeader.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { useAppLayout } from '@/hooks/useAppLayout';

type HeaderVariant = 'dashboard' | 'hub' | 'search' | 'simple';

interface AppHeaderProps {
  variant?: HeaderVariant;
  title?: string;
  showSearch?: boolean;
  showNavigation?: boolean;
  customProps?: Partial<React.ComponentProps<typeof Header>>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  variant = 'simple',
  showSearch = true,
  showNavigation = true,
  customProps = {}
}) => {
  const layoutOptions = React.useMemo(() => {
    switch (variant) {
      case 'dashboard':
        return {
          enableBookmarkDialog: true,
          enableSearch: true,
          enableViewControls: true,
          enableFavoritesFilter: true,
          redirectSearchToResults: true
        };
      case 'hub':
        return {
          enableBookmarkDialog: true,
          enableSearch: true,
          enableViewControls: true,
          enableFavoritesFilter: false,
          redirectSearchToResults: true
        };
      case 'search':
        return {
          enableBookmarkDialog: true,
          enableSearch: true,
          enableViewControls: false,
          enableFavoritesFilter: false,
          redirectSearchToResults: false
        };
      case 'simple':
      default:
        return {
          enableBookmarkDialog: false,
          enableSearch: false,
          enableViewControls: false,
          enableFavoritesFilter: false,
          redirectSearchToResults: false
        };
    }
  }, [variant]);

  const { headerProps } = useAppLayout(layoutOptions);

  const finalProps = {
    ...headerProps,
    showSearch,
    showNavigation,
    ...customProps
  };

  return <Header {...finalProps} />;
};