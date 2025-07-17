// src/composables/useBookmarkTableDialogs.js
import { computed, ref } from 'vue'

export function useBookmarkTableDialogs (emit, loadBookmarks) {
  const detailsDialog = ref(false)
  const editDialog = ref(false)
  const detailsBookmark = ref(null)
  const editBookmark = ref(null)

  // Track dialog states for keyboard navigation
  const dialogsOpen = computed(() => ({
    details: detailsDialog.value,
    edit: editDialog.value,
  }))

  function handleViewDetails (bookmark) {
    detailsBookmark.value = bookmark
    detailsDialog.value = true
  }

  function handleEdit (bookmark) {
    editBookmark.value = bookmark
    editDialog.value = true
  }

  function handleBookmarkUpdated () {
    emit('bookmark-updated')
    loadBookmarks()
  }

  // Function to close details dialog
  function closeDetailsDialog() {
    detailsDialog.value = false
    detailsBookmark.value = null
  }

  // Function to close edit dialog
  function closeEditDialog() {
    editDialog.value = false
    editBookmark.value = null
  }

  return {
    detailsDialog,
    editDialog,
    detailsBookmark,
    editBookmark,
    dialogsOpen,
    handleViewDetails,
    handleEdit,
    handleBookmarkUpdated,
    closeDetailsDialog,
    closeEditDialog,
  }
}