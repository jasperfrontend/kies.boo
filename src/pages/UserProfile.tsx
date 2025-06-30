
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTipsVisibility } from '@/hooks/useTipsVisibility';
import { useTheme } from '@/contexts/ThemeContext';
import { useBookmarkImport } from '@/hooks/useBookmarkImport';
import { useTags } from '@/hooks/useTags';
import { ArrowLeft, Upload, Edit, Trash2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookmarkImportDialog } from '@/components/BookmarkImportDialog';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { showTips, toggleTips } = useTipsVisibility();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { importBookmarks } = useBookmarkImport();
  const { tags, deleteTag, renameTag } = useTags();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');

  const handleImportBookmarks = async (bookmarks: any[]): Promise<void> => {
    await importBookmarks(bookmarks);
    setIsImportDialogOpen(false);
  };

  const handleEditTag = (tagId: string, currentName: string) => {
    setEditingTagId(tagId);
    setEditingTagName(currentName);
  };

  const handleSaveTagEdit = () => {
    if (editingTagId && editingTagName.trim()) {
      renameTag({ tagId: editingTagId, newName: editingTagName.trim() });
      setEditingTagId(null);
      setEditingTagName('');
    }
  };

  const handleCancelTagEdit = () => {
    setEditingTagId(null);
    setEditingTagName('');
  };

  const handleDeleteTag = (tagId: string) => {
    if (confirm('Are you sure you want to delete this tag? It will be removed from all bookmarks.')) {
      deleteTag(tagId);
    }
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
                <CardTitle>Tag Management</CardTitle>
                <CardDescription>
                  Manage your bookmark tags - rename or delete tags across all bookmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tags found. Tags will appear here as you add them to your bookmarks.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card"
                      >
                        {editingTagId === tag.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingTagName}
                              onChange={(e) => setEditingTagName(e.target.value)}
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTagEdit();
                                if (e.key === 'Escape') handleCancelTagEdit();
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveTagEdit}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelTagEdit}
                              className="text-gray-500 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Badge variant="secondary" className="text-sm">
                              {tag.name}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditTag(tag.id, tag.name)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTag(tag.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-tips" className="text-base">
                      Show Tips
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display helpful tips and hints throughout the application
                    </p>
                  </div>
                  <Switch
                    id="show-tips"
                    checked={showTips}
                    onCheckedChange={toggleTips}
                  />
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
