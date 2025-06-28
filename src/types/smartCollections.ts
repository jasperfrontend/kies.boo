
export interface SmartCollection {
  id: string;
  title: string;
  type: string;
  confidence: number | null;
  keywords: string[] | null;
  time_range_start: string | null;
  time_range_end: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionBookmark {
  id: string;
  collection_id: string;
  bookmark_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}
