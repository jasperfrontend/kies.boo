
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Layers3, Tag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const HeaderNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrentPage = (path: string) => location.pathname === path;

  return (
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
        Smart Hub
      </Button>

      <Button
        variant={isCurrentPage('/tags') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => navigate('/tags')}
        className="gap-2"
      >
        <Tag className="h-4 w-4" />
        Manage Tags
      </Button>
    </nav>
  );
};
