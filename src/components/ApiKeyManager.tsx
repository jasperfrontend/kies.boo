
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export const ApiKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchApiKeys = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive"
      });
    } else {
      setApiKeys(data || []);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  const generateApiKey = () => {
    // Generate a random API key
    return 'bm_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const createApiKey = async () => {
    if (!user || !newKeyName.trim()) return;

    setIsCreating(true);
    const apiKey = generateApiKey();
    
    // Hash the API key for storage
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: newKeyName.trim(),
        key_hash: keyHash
      });

    if (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    } else {
      setNewApiKey(apiKey);
      setNewKeyName('');
      fetchApiKeys();
      toast({
        title: "Success",
        description: "API key created successfully",
      });
    }

    setIsCreating(false);
  };

  const deleteApiKey = async (id: string) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    } else {
      fetchApiKeys();
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
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
fetch('${window.location.origin}/api/add-bookmark', {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create API keys to add bookmarks programmatically. Use the endpoint: 
            <code className="ml-1 px-2 py-1 bg-muted rounded text-sm">
              POST {window.location.origin}/api/add-bookmark
            </code>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="API key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createApiKey()}
            />
            <Button 
              onClick={createApiKey} 
              disabled={isCreating || !newKeyName.trim()}
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

          <div className="space-y-2">
            {apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No API keys created yet.</p>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{key.name}</span>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                      {key.last_used_at && (
                        <span className="ml-4">
                          Last used: {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteApiKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
