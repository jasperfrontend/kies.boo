<template>
  <!-- Global Undo Snackbar - Always available for any remaining global deletes -->
  <UndoSnackbar
    v-model="undoState.show"
    :deleted-items="undoState.deletedItems"
    @dismiss="dismissUndo"
    @undo="undoDelete"
  />

  <!-- Global Notification Component -->
  <NotificationComponent
    :message="notification.message"
    position="bottom-right"
    :show="notification.show"
    :type="notification.type"
    @close="closeNotification"
  />
</template>

<script setup>
  import { onMounted, onUnmounted } from 'vue'
  import NotificationComponent from '@/components/NotificationComponent.vue'
  import UndoSnackbar from '@/components/UndoSnackbar.vue'
  import { useBookmarkDelete } from '@/composables/useBookmarkDelete'
  import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

  const {
    deleting,
    undoState,
    notification,
    deleteBookmarks,
    undoDelete,
    dismissUndo,
    closeNotification,
  } = useBookmarkDelete()

  // Global delete handler (backward compatibility)
  async function handleGlobalDelete (event) {
    const bookmarkIds = event.detail?.bookmarkIds || []
    if (bookmarkIds.length > 0) {
      await deleteBookmarks(bookmarkIds)
    }
  }

  // Setup global event listeners (backward compatibility)
  onMounted(() => {
    // Listen for global delete events
    document.addEventListener('global-delete-bookmarks', handleGlobalDelete)
  })

  onUnmounted(() => {
    document.removeEventListener('global-delete-bookmarks', handleGlobalDelete)
  })

  // Setup global keyboard shortcuts for undo
  useKeyboardShortcuts({
    onUndoDelete: () => {
      if (undoState.show) {
        undoDelete()
      }
    },
  })
</script>
