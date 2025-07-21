// src/composables/useBookmarkFormatting.js

export function useBookmarkFormatting() {
  function displayUrl(url) {
    const cleanedUrl = url
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '')

    return cleanedUrl.length > 50
      ? cleanedUrl.slice(0, 47) + '...'
      : cleanedUrl
  }

  function formatDate(dateString) {
    const d = new Date(dateString)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear().toString().slice(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function formatDateShort(dateString) {
    const d = new Date(dateString)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear().toString().slice(2)}`
  }

  return {
    displayUrl,
    formatDate,
    formatDateShort,
  }
}