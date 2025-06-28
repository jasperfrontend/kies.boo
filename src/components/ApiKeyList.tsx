
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  onDeleteApiKey: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const ApiKeyList: React.FC<ApiKeyListProps> = ({ apiKeys, onDeleteApiKey, isLoading }) => {
  return (
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
              onClick={() => onDeleteApiKey(key.id)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
};
