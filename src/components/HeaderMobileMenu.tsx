import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, LayoutDashboard, Layers3, Tag, User, LogOut, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface HeaderMobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const HeaderMobileMenu: React.FC<HeaderMobileMenuProps> = ({
  isOpen,
  onToggle,
  onClose
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const isCurrentPage = (path: string) => location.pathname === path;

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

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="p-2"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <div className="fixed top-16 left-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border z-50 p-4">
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Menu</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Menu Items */}
            <div className="flex flex-col gap-2">
              <Button
                variant={isCurrentPage('/') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/')}
                className="justify-start gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              
              <Button
                variant={isCurrentPage('/hub') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/hub')}
                className="justify-start gap-2"
              >
                <Layers3 className="h-4 w-4" />
                Smart Hub
              </Button>

              <Button
                variant={isCurrentPage('/tags') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/tags')}
                className="justify-start gap-2"
              >
                <Tag className="h-4 w-4" />
                Manage Tags
              </Button>
              
              <Button
                variant={isCurrentPage('/profile') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation('/profile')}
                className="justify-start gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
              
              <div className="border-t pt-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSignOut();
                    onClose();
                  }}
                  className="justify-start gap-2 w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};