<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useBookmarkDelete } from '@/composables/useBookmarkDelete'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import UndoSnackbar from '@/components/UndoSnackbar.vue'
import NotificationComponent from '@/components/NotificationComponent.vue'

const props = defineProps({
  selectedItems: {
    type: Array,
    default: () => []
  },
  showKeyboardShortcut: {
    type: Boolean,
    default: true
  },
  buttonVariant: {
    type: String,
    default: 'outlined'
  },
  buttonColor: {
    type: String,
    default: 'red-darken-4'
  },
  buttonClass: {
    type: String,
    default: 'mx-4'
  }
})

const emit = defineEmits(['delete-completed'])

const {
  deleting,
  undoState,
  notification,
  deleteBookmarks,
  deleteSelectedBookmarks,
  undoDelete,
  dismissUndo,
  closeNotification
} = useBookmarkDelete()

// Use selectedItems from props if provided, otherwise use store
const itemsToDelete = computed(() => props.selectedItems)
const hasSelectedItems = computed(() => itemsToDelete.value.length > 0)

async function handleDeleteSelected() {
  let success = false
  
  if (props.selectedItems.length > 0) {
    // Delete specific items passed as props
    success = await deleteBookmarks(props.selectedItems)
  } else {
    // Delete from store (for backward compatibility)
    success = await deleteSelectedBookmarks()
  }
  
  if (success) {
    emit('delete-completed', props.selectedItems)
  }
}

// Listen for global delete events (for backward compatibility)
function handleGlobalDelete() {
  handleDeleteSelected()
}

onMounted(() => {
  document.addEventListener('delete-selected-bookmarks', handleGlobalDelete)
})

onUnmounted(() => {
  document.removeEventListener('delete-selected-bookmarks', handleGlobalDelete)
})

// Setup keyboard shortcuts
useKeyboardShortcuts({
  onDeleteSelected: handleDeleteSelected,
  onUndoDelete: () => {
    if (undoState.show) {
      undoDelete()
    }
  }
})
</script>

<template>
  <div>
    <!-- Delete Button -->
    <v-btn
      v-if="hasSelectedItems"
      :color="buttonColor"
      :variant="buttonVariant"
      :loading="deleting"
      :class="buttonClass"
      @click="handleDeleteSelected"
      prepend-icon="mdi-delete"
    >
      Delete {{ itemsToDelete.length }} item{{ itemsToDelete.length === 1 ? '' : 's' }} 
      <v-badge
        v-if="showKeyboardShortcut"
        color="grey-darken-3"
        content="Alt+I"
        inline
      />
    </v-btn>

    <!-- Undo Snackbar -->
    <UndoSnackbar
      v-model="undoState.show"
      :deleted-items="undoState.deletedItems"
      @undo="undoDelete"
      @dismiss="dismissUndo"
    />

    <!-- Notification Component -->
    <NotificationComponent
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      position="bottom-right"
      @close="closeNotification"
    />
  </div>
</template>