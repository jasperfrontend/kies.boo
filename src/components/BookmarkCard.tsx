
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Heart, Edit, Trash2 } from 'lucide-react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const handleOpenUrl = () => {
    window.open(bookmark.url, '_blank');
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {bookmark.favicon_url && (
            <img 
              src={bookmark.favicon_url} 
              alt="" 
              className="w-4 h-4 mt-1 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900 truncate">{bookmark.title}</h3>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(bookmark.id, !bookmark.is_favorite)}
                  className={bookmark.is_favorite ? 'text-red-500' : 'text-gray-400'}
                >
                  <Heart className={`h-4 w-4 ${bookmark.is_favorite ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(bookmark)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(bookmark.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {bookmark.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{bookmark.description}</p>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleOpenUrl}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
