interface ParsedBookmark {
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export class BookmarkParser {
  static parseBookmarksFile(htmlContent: string): ParsedBookmark[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const bookmarks: ParsedBookmark[] = [];

    // Find the main DL element that contains all bookmarks
    const mainDL = doc.querySelector('DL');
    if (mainDL) {
      this.parseBookmarkContainer(mainDL, [], bookmarks);
    }

    return bookmarks;
  }

  private static parseBookmarkContainer(
    dlElement: Element, 
    currentPath: string[], 
    bookmarks: ParsedBookmark[]
  ): void {
    const children = Array.from(dlElement.children);
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      
      if (child.tagName === 'DT') {
        const h3 = child.querySelector('H3');
        const anchor = child.querySelector('A');
        
        if (h3) {
          // This is a folder
          const folderName = h3.textContent?.trim() || '';
          const newPath = [...currentPath, folderName];
          
          // Look for the next DL element that contains this folder's bookmarks
          let nextElement = children[i + 1];
          if (nextElement && nextElement.tagName === 'DL') {
            this.parseBookmarkContainer(nextElement, newPath, bookmarks);
          }
        } else if (anchor) {
          // This is a bookmark
          const bookmark = this.parseBookmarkAnchor(anchor, currentPath);
          if (bookmark) {
            bookmarks.push(bookmark);
          }
        }
      }
    }
  }

  private static parseBookmarkAnchor(
    anchor: Element, 
    folderPath: string[]
  ): ParsedBookmark | null {
    const href = anchor.getAttribute('HREF');
    const title = anchor.textContent?.trim();
    const addDate = anchor.getAttribute('ADD_DATE');
    const icon = anchor.getAttribute('ICON');

    if (!href || !title) {
      return null;
    }

    // Convert ADD_DATE (Unix timestamp) to ISO string
    let createdAt = new Date().toISOString();
    if (addDate) {
      const timestamp = parseInt(addDate) * 1000; // Convert to milliseconds
      createdAt = new Date(timestamp).toISOString();
    }

    // Process favicon
    let faviconUrl = undefined;
    if (icon) {
      if (icon.startsWith('data:')) {
        // Keep data URI as is
        faviconUrl = icon;
      } else if (icon.startsWith('http')) {
        // Keep external URL as is
        faviconUrl = icon;
      }
    }
    
    // Fallback to Google favicon service if no icon found
    if (!faviconUrl) {
      try {
        const url = new URL(href);
        faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}`;
      } catch {
        faviconUrl = undefined;
      }
    }

    return {
      title,
      url: href,
      description: undefined,
      favicon_url: faviconUrl,
      tags: folderPath.filter(folder => folder.length > 0),
      is_favorite: false,
      created_at: createdAt
    };
  }
}
