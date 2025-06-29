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
    const cleanedContent = htmlContent.replace(/<\/?p>/gi, '');
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedContent, 'text/html');

    const rootDL = doc.querySelector('DL');
    const bookmarks: ParsedBookmark[] = [];

    if (rootDL) {
      this.recursiveParseDL(rootDL, [], bookmarks);
    }

    return bookmarks;
  }

  private static recursiveParseDL(dl: Element, path: string[], bookmarks: ParsedBookmark[]) {
    const dtElements = dl.querySelectorAll(':scope > DT');

    for (const dt of dtElements) {
      const h3 = dt.querySelector('H3');
      const a = dt.querySelector('A');

      if (h3) {
        const folderName = h3.textContent?.trim() ?? '';
        const newPath = [...path, folderName];

        const nestedDL = dt.querySelector('DL');
        if (nestedDL) {
          this.recursiveParseDL(nestedDL, newPath, bookmarks);
        }
      }

      if (a) {
        const parsed = this.parseBookmarkAnchor(a, path);
        if (parsed) bookmarks.push(parsed);
      }
    }
  }

  private static parseBookmarkAnchor(anchor: Element, folderPath: string[]): ParsedBookmark | null {
    const href = anchor.getAttribute('HREF');
    const title = anchor.textContent?.trim();
    const addDate = anchor.getAttribute('ADD_DATE');
    const icon = anchor.getAttribute('ICON');
    const iconUri = anchor.getAttribute('ICON_URI');

    if (!href || !title) return null;

    const timestamp = addDate && /^\d+$/.test(addDate) ? parseInt(addDate) * 1000 : Date.now();
    const createdAt = new Date(timestamp).toISOString();

    let faviconUrl = icon?.startsWith('data:')
      ? icon
      : iconUri ?? ((): string | undefined => {
          try {
            const url = new URL(href);
            return `https://www.google.com/s2/favicons?domain=${url.hostname}`;
          } catch {
            return undefined;
          }
        })();

    return {
      title,
      url: href,
      description: undefined,
      favicon_url: faviconUrl,
      tags: folderPath.filter(Boolean),
      is_favorite: false,
      created_at: createdAt,
    };
  }
}
