import { onUnmounted, ref } from 'vue'
import supabase from '@/lib/supabaseClient'
import { useAppStore } from '@/stores/app'

export function useBookmarkDelete () {
  const appStore = useAppStore()

  // Delete state
  const deleting = ref(false)

  // Undo delete state
  const undoState = ref({
    show: false,
    deletedItems: [],
    deletedBookmarkTags: [],
    timeoutId: null,
  })

  // Notification state for feedback
  const notification = ref({
    show: false,
    type: 'success',
    message: '',
  })

  function showNotification (type, message) {
    notification.value = {
      show: true,
      type,
      message,
    }
  }

  function closeNotification () {
    notification.value.show = false
  }

  /**
   * Delete bookmarks by their IDs
   * @param {Array} bookmarkIds - Array of bookmark IDs to delete
   * @returns {Promise<boolean>} - Success status
   */
  async function deleteBookmarks (bookmarkIds) {
    if (!bookmarkIds || bookmarkIds.length === 0) {
      showNotification('warning', 'No bookmarks selected for deletion')
      return false
    }

    deleting.value = true

    try {
      // Get the items that are being deleted from the database WITH their tag relationships
      const { data: itemsToDelete, error: fetchError } = await supabase
        .from('bookmarks')
        .select(`
          *,
          bookmark_tags (
            tag_id,
            tags (
              id,
              title
            )
          )
        `)
        .in('id', bookmarkIds)

      if (fetchError) {
        console.error('Error fetching items to delete:', fetchError)
        showNotification('error', 'Failed to delete items.')
        return false
      }

      // Get the bookmark-tag relationships that will be deleted
      const { data: bookmarkTagRelationships, error: fetchRelError } = await supabase
        .from('bookmark_tags')
        .select('bookmark_id, tag_id')
        .in('bookmark_id', bookmarkIds)

      if (fetchRelError) {
        console.error('Error fetching bookmark-tag relationships:', fetchRelError)
        showNotification('error', 'Failed to delete items.')
        return false
      }

      // Store in undo state BEFORE deleting
      undoState.value.deletedItems = itemsToDelete || []
      undoState.value.deletedBookmarkTags = bookmarkTagRelationships || []
      undoState.value.show = true

      // Delete bookmark-tag relationships first (due to foreign key constraints)
      if (bookmarkTagRelationships && bookmarkTagRelationships.length > 0) {
        const { error: deleteRelError } = await supabase
          .from('bookmark_tags')
          .delete()
          .in('bookmark_id', bookmarkIds)

        if (deleteRelError) {
          console.error('Error deleting bookmark-tag relationships:', deleteRelError)
          showNotification('error', 'Failed to delete bookmark relationships.')
          undoState.value.show = false
          undoState.value.deletedItems = []
          undoState.value.deletedBookmarkTags = []
          return false
        }
      }

      // Delete bookmarks from database
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .in('id', bookmarkIds)

      if (deleteError) {
        console.error('Error deleting bookmarks:', deleteError)
        showNotification('error', 'Failed to delete bookmarks.')
        undoState.value.show = false
        undoState.value.deletedItems = []
        undoState.value.deletedBookmarkTags = []
        return false
      }

      // Trigger refresh for both table and recent bookmarks
      appStore.triggerBookmarkRefresh()

      // Set timeout to permanently delete (clear undo state)
      if (undoState.value.timeoutId) {
        clearTimeout(undoState.value.timeoutId)
      }

      undoState.value.timeoutId = setTimeout(() => {
        commitDelete()
      }, 10_000) // 10 seconds to undo

      showNotification('info', `${bookmarkIds.length} bookmark${bookmarkIds.length === 1 ? '' : 's'} deleted`)
      return true
    } catch (error) {
      console.error('Error deleting bookmarks:', error)
      showNotification('error', 'Failed to delete bookmarks.')
      return false
    } finally {
      deleting.value = false
    }
  }

  /**
   * Delete selected bookmarks from the app store
   * @returns {Promise<boolean>} - Success status
   */
  async function deleteSelectedBookmarks () {
    const success = await deleteBookmarks(appStore.selectedItems)
    if (success) {
      // Clear selections only if delete was successful
      appStore.clearSelectedItems()
    }
    return success
  }

  /**
   * Undo the last delete operation
   * @returns {Promise<boolean>} - Success status
   */
  async function undoDelete () {
    // Clear the timeout
    if (undoState.value.timeoutId) {
      clearTimeout(undoState.value.timeoutId)
      undoState.value.timeoutId = null
    }

    const itemsToRestore = undoState.value.deletedItems
    const relationshipsToRestore = undoState.value.deletedBookmarkTags

    if (itemsToRestore.length === 0) {
      // showNotification('warning', 'No items to restore')
      return false
    }

    try {
      // Step 1: Restore bookmarks first
      // Prepare items for insertion (clean up the data structure)
      const itemsForInsertion = itemsToRestore.map(item => {
        const { bookmark_tags, ...bookmarkData } = item
        return bookmarkData
      })

      // Restore bookmarks to the database
      const { error: restoreBookmarksError } = await supabase
        .from('bookmarks')
        .upsert(itemsForInsertion, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })

      if (restoreBookmarksError) {
        console.error('Error restoring bookmarks:', restoreBookmarksError)
        showNotification('error', 'Failed to restore bookmarks.')
        return false
      }

      // Step 2: Restore bookmark-tag relationships
      if (relationshipsToRestore.length > 0) {
        const { error: restoreRelationshipsError } = await supabase
          .from('bookmark_tags')
          .upsert(relationshipsToRestore, {
            onConflict: 'bookmark_id,tag_id',
            ignoreDuplicates: false,
          })

        if (restoreRelationshipsError) {
          console.error('Error restoring bookmark-tag relationships:', restoreRelationshipsError)
          // Don't fail completely - bookmarks are restored, just warn about tags
          showNotification('warning', 'Bookmarks restored but some tag relationships may be missing.')
        }
      }

      // Clear undo state
      undoState.value.show = false
      undoState.value.deletedItems = []
      undoState.value.deletedBookmarkTags = []

      // Trigger refresh for both table and recent bookmarks
      appStore.triggerBookmarkRefresh()

      if (relationshipsToRestore.length === 0 || relationshipsToRestore.length === 0) {
        showNotification('success', 'Items restored successfully.')
      } else {
        showNotification('success', 'Items and their tags restored successfully.')
      }

      return true
    } catch (error) {
      console.error('Error restoring bookmarks:', error)
      showNotification('error', 'Failed to restore bookmarks.')
      return false
    }
  }

  /**
   * Commit the delete (make it permanent)
   */
  function commitDelete () {
    // This function is called when the undo timeout expires
    // At this point, the items are already deleted from the database
    // We just need to clean up the undo state
    undoState.value.show = false
    undoState.value.deletedItems = []
    undoState.value.deletedBookmarkTags = []
    undoState.value.timeoutId = null

    // Show a notification that the delete is now permanent
    showNotification('info', 'Bookmarks permanently deleted.')
  }

  /**
   * Dismiss the undo option (commits delete immediately)
   */
  function dismissUndo () {
    commitDelete()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (undoState.value.timeoutId) {
      clearTimeout(undoState.value.timeoutId)
    }
  })

  return {
    // State (reactive refs)
    deleting,
    undoState,
    notification,

    // Actions
    deleteBookmarks,
    deleteSelectedBookmarks,
    undoDelete,
    commitDelete,
    dismissUndo,
    showNotification,
    closeNotification,
  }
}
