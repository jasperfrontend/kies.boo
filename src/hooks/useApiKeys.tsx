
import { useState, useEffect } from 'react';
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

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchApiKeys = async () => {
    if (!user) return;

    setIsLoading(true);
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
    setIsLoading(false);
  };

  const generateApiKey = () => {
    // Generate a random API key with proper format
    return 'bm_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const createApiKey = async (name: string) => {
    if (!user || !name.trim()) return null;

    setIsLoading(true);
    const apiKey = generateApiKey();
    
    // Hash the API key for storage using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: name.trim(),
        key_hash: keyHash
      });

    if (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
      setIsLoading(false);
      return null;
    } else {
      await fetchApiKeys();
      toast({
        title: "Success",
        description: "API key created successfully",
      });
      setIsLoading(false);
      return apiKey;
    }
  };

  const deleteApiKey = async (id: string) => {
    setIsLoading(true);
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
      await fetchApiKeys();
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  return {
    apiKeys,
    isLoading,
    createApiKey,
    deleteApiKey,
    fetchApiKeys
  };
};
