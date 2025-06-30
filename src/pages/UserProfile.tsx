import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTipsVisibility } from '@/hooks/useTipsVisibility';
import { useTipsSystem } from '@/hooks/useTipsSystem';
import { useTheme } from '@/contexts/ThemeContext';
import { useBookmarkImport } from '@/hooks/useBookmarkImport';
import { ArrowLeft, Upload, Settings, Tags, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookmarkImportDialog } from '@/components/BookmarkImportDialog';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { showTips, toggleTips } = useTipsVisibility();
  const { resetShownTips, shownTips } = useTipsSystem();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { importBookmarks } = useBookmarkImport();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleImportBookmarks = async (bookmarks: any[]): Promise<void> => {
    await importBookmarks(bookmarks);
    setIsImportDialogOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your account preferences and settings
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Access important management features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/tags')}
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <Tags className="h-4 w-4" />
                    Manage Tags
                    <span className="text-sm text-muted-foreground ml-auto">
                      Rename and organize your bookmark tags
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your bookmark manager experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-tips" className="text-base">
                        Show Tips
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Display contextual tips and hints throughout the application
                      </p>
                    </div>
                    <Switch
                      id="show-tips"
                      checked={showTips}
                      onCheckedChange={toggleTips}
                    />
                  </div>
                  
                  {showTips && (
                    <div className="flex items-center justify-between pl-4 pt-2 border-l-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-md p-3">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Reset Dismissed Tips
                        </Label>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Show all tips again, including ones you've dismissed ({shownTips.size} dismissed)
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetShownTips}
                        className="gap-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
                        disabled={shownTips.size === 0}
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset Tips
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import & Export</CardTitle>
                <CardDescription>
                  Manage your bookmark data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Import Bookmarks</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Import bookmarks from Firefox, Chrome, or Edge HTML export files. 
                      Folders will be converted to tags and original dates preserved.
                    </p>
                    <Button 
                      onClick={() => setIsImportDialogOpen(true)}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Import Bookmarks
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BookmarkImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportBookmarks}
      />
    </>
  );
};

export default UserProfile;