
-- Create the tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the bookmark_tags junction table for many-to-many relationship
CREATE TABLE public.bookmark_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bookmark_id UUID NOT NULL REFERENCES public.bookmarks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bookmark_id, tag_id)
);

-- Enable RLS on tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tags
CREATE POLICY "Users can view their own tags" 
  ON public.tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags" 
  ON public.tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" 
  ON public.tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" 
  ON public.tags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on bookmark_tags table
ALTER TABLE public.bookmark_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookmark_tags (users can only manage tags for their own bookmarks)
CREATE POLICY "Users can view bookmark tags for their bookmarks" 
  ON public.bookmark_tags 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookmarks 
      WHERE bookmarks.id = bookmark_tags.bookmark_id 
      AND bookmarks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookmark tags for their bookmarks" 
  ON public.bookmark_tags 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookmarks 
      WHERE bookmarks.id = bookmark_tags.bookmark_id 
      AND bookmarks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bookmark tags for their bookmarks" 
  ON public.bookmark_tags 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookmarks 
      WHERE bookmarks.id = bookmark_tags.bookmark_id 
      AND bookmarks.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_tags_name ON public.tags(name);
CREATE INDEX idx_bookmark_tags_bookmark_id ON public.bookmark_tags(bookmark_id);
CREATE INDEX idx_bookmark_tags_tag_id ON public.bookmark_tags(tag_id);

-- Migration function to move existing tags from bookmarks.tags array to new structure
CREATE OR REPLACE FUNCTION migrate_bookmark_tags()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    bookmark_record RECORD;
    tag_name TEXT;
    tag_record RECORD;
BEGIN
    -- Loop through all bookmarks that have tags
    FOR bookmark_record IN 
        SELECT id, user_id, tags 
        FROM public.bookmarks 
        WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
    LOOP
        -- Loop through each tag in the bookmark's tags array
        FOREACH tag_name IN ARRAY bookmark_record.tags
        LOOP
            -- Check if tag already exists for this user
            SELECT * INTO tag_record 
            FROM public.tags 
            WHERE name = tag_name AND user_id = bookmark_record.user_id;
            
            -- If tag doesn't exist, create it
            IF NOT FOUND THEN
                INSERT INTO public.tags (name, user_id)
                VALUES (tag_name, bookmark_record.user_id)
                RETURNING * INTO tag_record;
            END IF;
            
            -- Link bookmark to tag (ignore if already linked)
            INSERT INTO public.bookmark_tags (bookmark_id, tag_id)
            VALUES (bookmark_record.id, tag_record.id)
            ON CONFLICT (bookmark_id, tag_id) DO NOTHING;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully';
END;
$$;

-- Run the migration
SELECT migrate_bookmark_tags();

-- Clean up the migration function
DROP FUNCTION migrate_bookmark_tags();
