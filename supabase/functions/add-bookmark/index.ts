
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
  console.log(`Received ${req.method} request to add-bookmark function`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log(`Method ${req.method} not allowed`);
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
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    console.log('API key extracted, length:', apiKey.length);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Supabase URL available:', !!supabaseUrl);
    console.log('Service key available:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate the API key and get the user ID
    console.log('Validating API key...');
    const { data: userId, error: authError } = await supabase.rpc('validate_api_key', {
      api_key: apiKey
    });

    console.log('API key validation result - userId:', userId, 'error:', authError);

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
    console.log('Bookmark data received:', bookmarkData);

    // Validate required fields
    if (!bookmarkData.url || !bookmarkData.title) {
      console.log('Missing required fields');
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
    console.log('Inserting bookmark for user:', userId);
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
        JSON.stringify({ error: 'Failed to create bookmark', details: insertError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Bookmark created successfully:', bookmark.id);
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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
