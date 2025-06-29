
-- First, drop the foreign key constraint from smart_collections
ALTER TABLE public.smart_collections 
DROP CONSTRAINT IF EXISTS smart_collections_collection_id_fkey;

-- Now we can safely drop and recreate the collection_bookmarks table
DROP TABLE IF EXISTS public.collection_bookmarks CASCADE;

-- Recreate the collection_bookmarks table with correct structure
CREATE TABLE public.collection_bookmarks (
  id BIGSERIAL PRIMARY KEY,
  collection_id UUID REFERENCES public.smart_collections(id) ON DELETE CASCADE,
  bookmark_id UUID REFERENCES public.bookmarks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate bookmark-collection pairs
ALTER TABLE public.collection_bookmarks 
ADD CONSTRAINT unique_collection_bookmark 
UNIQUE (collection_id, bookmark_id);

-- Add indexes for better query performance
CREATE INDEX idx_collection_bookmarks_collection_id ON public.collection_bookmarks(collection_id);
CREATE INDEX idx_collection_bookmarks_bookmark_id ON public.collection_bookmarks(bookmark_id);

-- Enable Row Level Security
ALTER TABLE public.collection_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to manage their own collection bookmarks
CREATE POLICY "Users can manage their own collection bookmarks" 
ON public.collection_bookmarks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.smart_collections 
    WHERE smart_collections.id = collection_bookmarks.collection_id 
    AND smart_collections.user_id = auth.uid()
  )
);

-- Remove the collection_id column from smart_collections since it should reference collection_bookmarks, not the other way around
ALTER TABLE public.smart_collections DROP COLUMN IF EXISTS collection_id;
