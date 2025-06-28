
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Eye, EyeOff, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyCreatorProps {
  onCreateApiKey: (name: string) => Promise<string | null>;
  isLoading: boolean;
}

export const ApiKeyCreator: React.FC<ApiKeyCreatorProps> = ({ onCreateApiKey, isLoading }) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    
    const apiKey = await onCreateApiKey(newKeyName);
    if (apiKey) {
      setNewApiKey(apiKey);
      setNewKeyName('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const copyApiUsage = () => {
    const usage = `// Example usage:
fetch('https://efaaigzvqhgoozvdkhzo.supabase.co/functions/v1/add-bookmark', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com',
    title: 'Example Site',
    description: 'An example website',
    tags: ['example', 'demo'],
    is_favorite: false
  })
});`;
    
    navigator.clipboard.writeText(usage);
    toast({
      title: "Copied",
      description: "API usage example copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="API key name"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateKey()}
        />
        <Button 
          onClick={handleCreateKey} 
          disabled={isLoading || !newKeyName.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Key
        </Button>
      </div>

      {newApiKey && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                New API Key Created
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                Copy this key now - you won't be able to see it again!
              </p>
              <div className="flex items-center space-x-2">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={newApiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(newApiKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyApiUsage}
                className="w-full"
              >
                Copy Usage Example
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
