
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { seedRandomBookmarks } from '@/utils/seedBookmarks';
import { Database } from 'lucide-react';
import { SeedBookmarksModal } from '@/components/SeedBookmarksModal';

interface SeedBookmarksButtonProps {
  onBookmarksAdded: () => void;
  onFeatureRemoved: () => void;
}

export const SeedBookmarksButton: React.FC<SeedBookmarksButtonProps> = ({ 
  onBookmarksAdded, 
  onFeatureRemoved 
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSeedBookmarks = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to seed bookmarks",
        variant: "destructive"
      });
      return;
    }

    setIsSeeding(true);
    setShowModal(false);
    
    try {
      const result = await seedRandomBookmarks(user.id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Added ${result.count} random bookmarks to your collection!`,
        });
        onBookmarksAdded();
      } else {
        throw new Error('Failed to seed bookmarks');
      }
    } catch (error) {
      console.error('Error seeding bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to add random bookmarks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRemoveFeature = () => {
    setShowModal(false);
    onFeatureRemoved();
    toast({
      title: "Feature Removed",
      description: "The random bookmarks feature has been removed.",
    });
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        disabled={isSeeding}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isSeeding ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Seeding...
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            Add 100 Random Bookmarks
          </>
        )}
      </Button>

      <SeedBookmarksModal
        open={showModal}
        onOpenChange={setShowModal}
        onConfirm={handleSeedBookmarks}
        onRemoveFeature={handleRemoveFeature}
      />
    </>
  );
};
