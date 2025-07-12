<template>
  <div class="bookmark-delete-wrapper">
    <!-- Delete Button -->
    <v-btn
      v-if="hasSelectedItems"
      :color="buttonColor"
      :variant="buttonVariant"
      :loading="deleting"
      :class="buttonClass"
      @click="handleDeleteSelected"
      :prepend-icon="buttonIcon"
      :size="buttonSize"
    >
      {{ buttonText }}
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

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useBookmarkDelete } from '@/composables/useBookmarkDelete'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useAppStore } from '@/stores/app'
import UndoSnackbar from '@/components/UndoSnackbar.vue'
import NotificationComponent from '@/components/NotificationComponent.vue'

const props = defineProps({
  // Items to delete - can be array of IDs or use store if not provided
  selectedItems: {
    type: Array,
    default: () => []
  },
  
  // Button appearance
  buttonColor: {
    type: String,
    default: 'red-darken-4'
  },
  buttonVariant: {
    type: String,
    default: 'flat'
  },
  buttonClass: {
    type: String,
    default: 'mx-4 position-fixed z-10 mt-2 elevation-10'
  },
  buttonIcon: {
    type: String,
    default: 'mdi-delete'
  },
  buttonSize: {
    type: String,
    default: 'default'
  },
  
  // Behavior options
  showKeyboardShortcut: {
    type: Boolean,
    default: true
  },
  useStoreSelection: {
    type: Boolean,
    default: true
  },
  
  // Custom button text (optional)
  customButtonText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['delete-completed', 'delete-started'])

const appStore = useAppStore()

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

// Determine which items to use for deletion
const itemsToDelete = computed(() => {
  if (props.selectedItems.length > 0) {
    return props.selectedItems
  }
  if (props.useStoreSelection) {
    return appStore.selectedItems
  }
  return []
})

const hasSelectedItems = computed(() => itemsToDelete.value.length > 0)

const buttonText = computed(() => {
  if (props.customButtonText) {
    return props.customButtonText
  }
  
  const count = itemsToDelete.value.length
  return `Delete ${count} item${count === 1 ? '' : 's'}`
})

async function handleDeleteSelected() {
  emit('delete-started', itemsToDelete.value)
  
  let success = false
  
  if (props.selectedItems.length > 0) {
    // Delete specific items passed as props
    success = await deleteBookmarks(props.selectedItems)
  } else if (props.useStoreSelection) {
    // Delete from store
    success = await deleteSelectedBookmarks()
  }
  
  if (success) {
    emit('delete-completed', itemsToDelete.value)
  }
}

// Listen for global delete events (backward compatibility)
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
<style scoped>
.z-10 {
  z-index: 10;
}
</style>