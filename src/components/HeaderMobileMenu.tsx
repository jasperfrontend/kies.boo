
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, LayoutDashboard, Layers3, User, LogOut } from 'lucide-react';
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

      {isOpen && (
        <div className="border-t pt-3 space-y-2">
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
              variant={isCurrentPage('/profile') ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation('/profile')}
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
                onClose();
              }}
              className="justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
