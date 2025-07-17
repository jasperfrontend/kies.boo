/**
 * src/lib/bookmarkParser.js
 *
 * Bookmark parser for HTML bookmark files exported from browsers
 */

export const BookmarkParser = {
  /**
   * Parse bookmarks from HTML content
   * @param {string} htmlContent - The HTML content of the bookmark file
   * @returns {Array} Array of parsed bookmark objects
   */
  parseBookmarksFile (htmlContent) {
    const cleanedContent = htmlContent.replace(/<\/?p>/gi, '')
    const parser = new DOMParser()
    const doc = parser.parseFromString(cleanedContent, 'text/html')

    const rootDL = doc.querySelector('DL')
    const bookmarks = []

    if (rootDL) {
      this.recursiveParseDL(rootDL, [], bookmarks)
    }

    return bookmarks
  },

  /**
   * Recursively parse DL elements to extract bookmarks and folders
   * @param {Element} dl - The DL element to parse
   * @param {Array} path - Current folder path
   * @param {Array} bookmarks - Array to store parsed bookmarks
   */
  recursiveParseDL (dl, path, bookmarks) {
    const dtElements = dl.querySelectorAll(':scope > DT')

    for (const dt of dtElements) {
      const h3 = dt.querySelector('H3')
      const a = dt.querySelector('A')

      if (h3) {
        const folderName = h3.textContent?.trim() ?? ''
        const newPath = [...path, folderName]

        const nestedDL = dt.querySelector('DL')
        if (nestedDL) {
          this.recursiveParseDL(nestedDL, newPath, bookmarks)
        }
      }

      if (a) {
        const parsed = this.parseBookmarkAnchor(a, path)
        if (parsed) {
          bookmarks.push(parsed)
        }
      }
    }
  },

  /**
   * Parse individual bookmark anchor element
   * @param {Element} anchor - The anchor element to parse
   * @param {Array} folderPath - Current folder path for tags
   * @returns {Object|null} Parsed bookmark object or null if invalid
   */
  parseBookmarkAnchor (anchor, folderPath) {
    const href = anchor.getAttribute('HREF')
    const title = anchor.textContent?.trim()
    const addDate = anchor.getAttribute('ADD_DATE')
    const icon = anchor.getAttribute('ICON')
    const iconUri = anchor.getAttribute('ICON_URI')

    if (!href || !title) {
      return null
    }

    const timestamp = addDate && /^\d+$/.test(addDate) ? Number.parseInt(addDate) * 1000 : Date.now()
    const createdAt = new Date(timestamp).toISOString()

    const faviconUrl = icon?.startsWith('data:')
      ? icon
      : iconUri ?? (() => {
        try {
          const url = new URL(href)
          return `https://www.google.com/s2/favicons?domain=${url.hostname}`
        } catch {
          return undefined
        }
      })()

    return {
      title,
      url: href,
      description: undefined,
      favicon_url: faviconUrl,
      tags: folderPath.filter(Boolean),
      is_favorite: false,
      created_at: createdAt,
    }
  },
}
