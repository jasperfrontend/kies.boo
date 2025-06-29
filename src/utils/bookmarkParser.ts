
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
          // This is a folder - get the folder name
          const folderName = h3.textContent?.trim() || '';
          const newPath = [...currentPath, folderName];
          
          // Look for the next sibling DL element that contains this folder's bookmarks
          let nextSibling = children[i + 1];
          if (nextSibling && nextSibling.tagName === 'DL') {
            // Parse the nested bookmarks with the updated path
            this.parseBookmarkContainer(nextSibling, newPath, bookmarks);
            // Skip the DL element in the next iteration since we just processed it
            i++;
          }
        } else if (anchor) {
          // This is a bookmark at the current level
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
    const iconUri = anchor.getAttribute('ICON_URI');

    if (!href || !title) {
      return null;
    }

    // Convert ADD_DATE (Unix timestamp) to ISO string
    let createdAt = new Date().toISOString();
    if (addDate) {
      const timestamp = parseInt(addDate) * 1000; // Convert to milliseconds
      createdAt = new Date(timestamp).toISOString();
    }

    // Process favicon - prefer ICON over ICON_URI if both exist
    let faviconUrl = undefined;
    if (icon && icon.startsWith('data:')) {
      // Use data URI from ICON attribute
      faviconUrl = icon;
    } else if (iconUri) {
      // Use external URL from ICON_URI attribute
      faviconUrl = iconUri;
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
