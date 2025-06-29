
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { BookmarkParser } from '@/utils/bookmarkParser';
import { useToast } from '@/hooks/use-toast';

interface BookmarkImporterProps {
  onImport: (bookmarks: any[]) => Promise<void>;
}

export const BookmarkImporter: React.FC<BookmarkImporterProps> = ({ onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/html' || selectedFile.name.endsWith('.html')) {
        setFile(selectedFile);
        setImportResults(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an HTML file exported from your browser.",
          variant: "destructive"
        });
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);

    try {
      // Read file content
      const content = await file.text();
      setProgress(25);
      
      // Parse bookmarks
      const parsedBookmarks = BookmarkParser.parseBookmarksFile(content);
      
      if (parsedBookmarks.length === 0) {
        toast({
          title: "No bookmarks found",
          description: "The selected file doesn't contain any valid bookmarks.",
          variant: "destructive"
        });
        setImporting(false);
        return;
      }

      setProgress(50);

      // Import all bookmarks at once to avoid UI flickering
      try {
        await onImport(parsedBookmarks);
        
        setImportResults({
          total: parsedBookmarks.length,
          successful: parsedBookmarks.length,
          failed: 0,
          errors: []
        });

        setProgress(100);

        toast({
          title: "Import completed",
          description: `Successfully imported ${parsedBookmarks.length} bookmarks with folder tags.`,
        });

      } catch (error) {
        setImportResults({
          total: parsedBookmarks.length,
          successful: 0,
          failed: parsedBookmarks.length,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });

        throw error;
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "An unknown error occurred during import.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Import Bookmarks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bookmark-file">Select bookmarks HTML file</Label>
          <div className="flex items-center gap-2">
            <Input
              id="bookmark-file"
              type="file"
              accept=".html,text/html"
              onChange={handleFileChange}
              disabled={importing}
            />
            {file && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                {file.name}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Export your bookmarks from Firefox, Chrome, or Edge as an HTML file and select it here.
            Folders will be imported as tags.
          </p>
        </div>

        {importing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Importing bookmarks...</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {importResults && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium">Import Results</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
                <div className="text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                <div className="text-muted-foreground">Failed</div>
              </div>
            </div>
            
            {importResults.errors.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-red-600 flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  Errors
                </h5>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {importResults.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleImport} 
          disabled={!file || importing}
          className="w-full gap-2"
        >
          <Upload className="h-4 w-4" />
          {importing ? 'Importing...' : 'Import Bookmarks'}
        </Button>
      </CardContent>
    </Card>
  );
};
