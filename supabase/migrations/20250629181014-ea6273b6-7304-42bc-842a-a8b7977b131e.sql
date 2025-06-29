
-- Add last_visited_at column to bookmarks table
ALTER TABLE public.bookmarks 
ADD COLUMN last_visited_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for better performance when querying by last_visited_at
CREATE INDEX idx_bookmarks_last_visited_at ON public.bookmarks(last_visited_at);

-- Add index for better performance when querying forgotten bookmarks
CREATE INDEX idx_bookmarks_user_last_visited ON public.bookmarks(user_id, last_visited_at);
