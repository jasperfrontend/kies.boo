
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
    // Step 1: Clean up the HTML by removing all <p> tags
    const cleanedContent = htmlContent.replace(/<\/?p>/gi, '');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedContent, 'text/html');
    const bookmarks: ParsedBookmark[] = [];

    // Step 2: Extract bookmarks directly under the first H1 and first DL
    const firstH1 = doc.querySelector('H1');
    if (firstH1) {
      const firstDL = firstH1.nextElementSibling;
      if (firstDL && firstDL.tagName === 'DL') {
        this.extractDirectBookmarks(firstDL, [], bookmarks);
      }
    }

    // Step 3: Find the PERSONAL_TOOLBAR_FOLDER and process its contents
    const toolbarFolder = doc.querySelector('H3[PERSONAL_TOOLBAR_FOLDER="true"]');
    if (toolbarFolder) {
      const parentDT = toolbarFolder.parentElement;
      const nestedDL = parentDT?.querySelector('DL');
      if (nestedDL) {
        this.parseToolbarFolder(nestedDL, bookmarks);
      }
    }

    return bookmarks;
  }

  private static extractDirectBookmarks(dlElement: Element, currentPath: string[], bookmarks: ParsedBookmark[]): void {
    const dtElements = dlElement.querySelectorAll(':scope > DT');
    
    for (const dt of dtElements) {
      const anchor = dt.querySelector('A');
      const h3 = dt.querySelector('H3');
      
      if (anchor && !h3) {
        // This is a direct bookmark (not in a folder)
        const bookmark = this.parseBookmarkAnchor(anchor, currentPath);
        if (bookmark) {
          bookmarks.push(bookmark);
        }
      }
    }
  }

  private static parseToolbarFolder(dlElement: Element, bookmarks: ParsedBookmark[]): void {
    this.parseBookmarkContainer(dlElement, [], bookmarks);
  }

  private static parseBookmarkContainer(
    dlElement: Element, 
    currentPath: string[], 
    bookmarks: ParsedBookmark[]
  ): void {
    const dtElements = dlElement.querySelectorAll(':scope > DT');
    
    for (let i = 0; i < dtElements.length; i++) {
      const dt = dtElements[i];
      const h3 = dt.querySelector('H3');
      const anchor = dt.querySelector('A');
      
      if (h3 && !h3.hasAttribute('PERSONAL_TOOLBAR_FOLDER')) {
        // This is a folder (but not the personal toolbar folder)
        const folderName = h3.textContent?.trim() || '';
        const newPath = [...currentPath, folderName];
        
        // Look for the next sibling DL element that contains this folder's bookmarks
        const nextDT = dtElements[i + 1];
        if (nextDT) {
          const nestedDL = nextDT.querySelector('DL');
          if (nestedDL) {
            // Parse the nested bookmarks with the updated path
            this.parseBookmarkContainer(nestedDL, newPath, bookmarks);
            // Skip the next DT since we just processed it
            i++;
          }
        } else {
          // Check if there's a DL directly after this DT
          let nextSibling = dt.nextElementSibling;
          if (nextSibling && nextSibling.tagName === 'DL') {
            this.parseBookmarkContainer(nextSibling, newPath, bookmarks);
          }
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
