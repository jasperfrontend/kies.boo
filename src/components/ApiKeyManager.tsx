
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiKeyCreator } from './ApiKeyCreator';
import { ApiKeyList } from './ApiKeyList';
import { useApiKeys } from '@/hooks/useApiKeys';

export const ApiKeyManager: React.FC = () => {
  const { apiKeys, isLoading, createApiKey, deleteApiKey } = useApiKeys();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create API keys to add bookmarks programmatically. Use the endpoint: 
            <code className="ml-1 px-2 py-1 bg-muted rounded text-sm">
              POST https://efaaigzvqhgoozvdkhzo.supabase.co/functions/v1/add-bookmark
            </code>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ApiKeyCreator 
            onCreateApiKey={createApiKey}
            isLoading={isLoading}
          />
          <ApiKeyList 
            apiKeys={apiKeys}
            onDeleteApiKey={deleteApiKey}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
