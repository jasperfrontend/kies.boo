// src/lib/bookmarkMessages.js

export function getNoDataMessage(searchType, searchTerm) {
  if (searchType === 'search') {
    return `No bookmarks found matching "${searchTerm}"`
  }
  if (searchType === 'tag') {
    return `No bookmarks found with tag "${searchTerm}"`
  }
  return 'No bookmarks found.'
} 