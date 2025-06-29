interface ParsedBookmark {
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

interface BookmarkFolder {
  name: string;
  bookmarks: ParsedBookmark[];
  subfolders: BookmarkFolder[];
}

export class BookmarkParser {
  static parseBookmarksFile(htmlContent: string): ParsedBookmark[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const bookmarks: ParsedBookmark[] = [];

    // Find all DL elements (definition lists) which contain bookmarks
    const dlElements = doc.querySelectorAll('DL');
    
    dlElements.forEach(dl => {
      this.parseBookmarkList(dl, [], bookmarks);
    });

    return bookmarks;
  }

  private static parseBookmarkList(
    element: Element, 
    folderPath: string[], 
    bookmarks: ParsedBookmark[]
  ): void {
    const children = Array.from(element.children);
    let currentFolder = '';

    for (const child of children) {
      if (child.tagName === 'DT') {
        // Check if this DT contains a folder (H3) or bookmark (A)
        const h3 = child.querySelector('H3');
        const anchor = child.querySelector('A');

        if (h3) {
          // This is a folder
          currentFolder = h3.textContent?.trim() || '';
          
          // Look for the next DL element that contains this folder's bookmarks
          let nextSibling = child.nextElementSibling;
          while (nextSibling && nextSibling.tagName !== 'DL') {
            nextSibling = nextSibling.nextElementSibling;
          }
          
          if (nextSibling && nextSibling.tagName === 'DL') {
            // Recursively parse the folder's contents
            this.parseBookmarkList(
              nextSibling, 
              [...folderPath, currentFolder], 
              bookmarks
            );
          }
        } else if (anchor) {
          // This is a bookmark
          const bookmark = this.parseBookmarkAnchor(anchor, folderPath);
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
      } else {
        // Try to construct favicon URL from domain
        try {
          const url = new URL(href);
          faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}`;
        } catch {
          faviconUrl = undefined;
        }
      }
    } else {
      // Fallback to Google favicon service
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
