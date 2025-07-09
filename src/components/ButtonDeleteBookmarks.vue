<script setup>
import supabase from '@/lib/supabaseClient';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

import { useAppStore } from '@/stores/app'
const appStore = useAppStore()

// Undo delete state
const undoState = ref({
  show: false,
  deletedItems: [],
  timeoutId: null
});

// Notification state
const notification = ref({
  show: false,
  type: 'success',
  message: ''
});


function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  };
}

defineProps({
  deletedSelected: Array
});

// Emit event for delete action
const emit = defineEmits(['delete-selected'])
function handleDeleteSelected() {
  emit('delete-selected')
}


async function deleteSelectedItems() {
  if (appStore.selectedItems.length === 0) return;
  
  appStore.setDeleting(true);
  
  try {
    // Get the items that are being deleted from the database
    const { data: itemsToDelete, error: fetchError } = await supabase
      .from('bookmarks')
      .select('*')
      .in('id', appStore.selectedItems);
    
    if (fetchError) {
      console.error('Error fetching items to delete:', fetchError);
      showNotification('error', 'Failed to delete items.');
      appStore.setDeleting(false);
      return;
    }
    
    // Store in undo state BEFORE deleting
    undoState.value.deletedItems = itemsToDelete || [];
    undoState.value.show = true;
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('bookmarks')
      .delete()
      .in('id', appStore.selectedItems);
    
    if (deleteError) {
      console.error('Error deleting bookmarks:', deleteError);
      showNotification('error', 'Failed to delete bookmarks.');
      undoState.value.show = false;
      undoState.value.deletedItems = [];
      appStore.setDeleting(false);
      return;
    }
    
    // Clear selections
    appStore.clearSelectedItems();
    
    // Trigger refresh for both table and recent bookmarks
    appStore.triggerBookmarkRefresh();
    
    // Set timeout to permanently delete (clear undo state)
    if (undoState.value.timeoutId) {
      clearTimeout(undoState.value.timeoutId);
    }
    
    undoState.value.timeoutId = setTimeout(() => {
      commitDelete();
    }, 10000); // 10 seconds to undo
    
  } catch (error) {
    console.error('Error deleting bookmarks:', error);
    showNotification('error', 'Failed to delete bookmarks.');
  } finally {
    appStore.setDeleting(false);
  }
}

async function undoDelete() {
  // Clear the timeout
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId);
    undoState.value.timeoutId = null;
  }
  
  const itemsToRestore = undoState.value.deletedItems;
  
  if (itemsToRestore.length === 0) return;
  
  try {
    // Prepare items for insertion (remove any auto-generated fields that might cause conflicts)
    const itemsForInsertion = itemsToRestore.map(item => {
      const { ...itemCopy } = item;
      // Keep all original fields including the original id, created_at, etc.
      return itemCopy;
    });

    // Restore items to the database
    const { error } = await supabase
      .from('bookmarks')
      .upsert(itemsForInsertion, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error restoring bookmarks:', error);
      showNotification('error', 'Failed to restore bookmarks.');
      return;
    }
    
    // Clear undo state
    undoState.value.show = false;
    undoState.value.deletedItems = [];
    
    // Trigger refresh for both table and recent bookmarks
    appStore.triggerBookmarkRefresh();
    
    showNotification('success', 'Items restored successfully.');
    
  } catch (error) {
    console.error('Error restoring bookmarks:', error);
    showNotification('error', 'Failed to restore bookmarks.');
  }
}

async function commitDelete() {
  // This function is called when the undo timeout expires
  // At this point, the items are already deleted from the database
  // We just need to clean up the undo state
  undoState.value.show = false;
  undoState.value.deletedItems = [];
  undoState.value.timeoutId = null;
  
  // Show a notification that the delete is now permanent
  showNotification('primary', 'Bookmarks permanently deleted.');
}

// Listen for delete events from the layout
onMounted(() => {
  document.addEventListener('delete-selected-bookmarks', deleteSelectedItems);
});

onUnmounted(() => {
  // Clean up timeout if component unmounts
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId);
  }
  document.removeEventListener('delete-selected-bookmarks', deleteSelectedItems);
});

// Setup keyboard shortcuts
useKeyboardShortcuts({
  onDeleteSelected: deleteSelectedItems,
  onUndoDelete: () => {
    if (undoState.value.show) {
      undoDelete();
    }
  }
});

</script>

<template>
<v-btn
  v-if="appStore.selectedItems.length > 0"
  color="red-darken-4"
  variant="outlined"
  :loading="appStore.deleting"
  @click="handleDeleteSelected"
  prepend-icon="mdi-delete"
  class="mx-4"
>
  Delete {{ appStore.selectedItems.length }} item{{ appStore.selectedItems.length === 1 ? '' : 's' }} 
  <v-badge
    color="grey-darken-3"
    content="Alt+I"
    inline
  ></v-badge>
</v-btn>


  <UndoSnackbar
    v-model="undoState.show"
    :deleted-items="undoState.deletedItems"
    @undo="undoDelete"
    @dismiss="dismissUndo"
  />
</template>