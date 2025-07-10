<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useBookmarkDelete } from '@/composables/useBookmarkDelete'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useAppStore } from '@/stores/app'
import UndoSnackbar from '@/components/UndoSnackbar.vue'

const appStore = useAppStore()

const {
  deleting,
  undoState,
  deleteSelectedBookmarks,
  undoDelete,
  dismissUndo
} = useBookmarkDelete()

// Emit event for delete action (for backward compatibility)
const emit = defineEmits(['delete-selected'])

function handleDeleteSelected() {
  emit('delete-selected')
  deleteSelectedBookmarks()
}

// Listen for delete events from the layout (for backward compatibility)
function handleGlobalDelete() {
  deleteSelectedBookmarks()
}

onMounted(() => {
  document.addEventListener('delete-selected-bookmarks', handleGlobalDelete)
})

onUnmounted(() => {
  document.removeEventListener('delete-selected-bookmarks', handleGlobalDelete)
})

// Setup keyboard shortcuts
useKeyboardShortcuts({
  onDeleteSelected: deleteSelectedBookmarks,
  onUndoDelete: () => {
    if (undoState.show) {
      undoDelete()
    }
  }
})
</script>

<template>
  <div>
    <v-btn
      v-if="appStore.selectedItems.length > 0"
      color="red-darken-4"
      variant="outlined"
      :loading="deleting"
      @click="handleDeleteSelected"
      prepend-icon="mdi-delete"
      class="mx-4"
    >
      Delete {{ appStore.selectedItems.length }} item{{ appStore.selectedItems.length === 1 ? '' : 's' }} 
      <v-badge
        color="grey-darken-3"
        content="Alt+I"
        inline
      />
    </v-btn>

    <UndoSnackbar
      v-model="undoState.show"
      :deleted-items="undoState.deletedItems"
      @undo="undoDelete"
      @dismiss="dismissUndo"
    />
  </div>
</template>