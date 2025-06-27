
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookmarkRequest {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  is_favorite?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate the API key and get the user ID
    const { data: userId, error: authError } = await supabase.rpc('validate_api_key', {
      api_key: apiKey
    });

    if (authError || !userId) {
      console.error('API key validation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the request body
    const bookmarkData: BookmarkRequest = await req.json();

    // Validate required fields
    if (!bookmarkData.url || !bookmarkData.title) {
      return new Response(
        JSON.stringify({ error: 'URL and title are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Try to get the favicon URL
    let faviconUrl = null;
    try {
      const urlObj = new URL(bookmarkData.url);
      faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch (e) {
      console.log('Could not generate favicon URL:', e);
    }

    // Insert the bookmark
    const { data: bookmark, error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        url: bookmarkData.url,
        title: bookmarkData.title,
        description: bookmarkData.description || null,
        tags: bookmarkData.tags || [],
        is_favorite: bookmarkData.is_favorite || false,
        favicon_url: faviconUrl
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting bookmark:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create bookmark' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookmark: bookmark,
        message: 'Bookmark added successfully' 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
