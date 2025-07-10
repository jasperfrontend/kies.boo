<script setup>
import supabase from '@/lib/supabaseClient';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

import { useAppStore } from '@/stores/app'
const appStore = useAppStore()

// Undo delete state
const undoState = ref({
  show: false,
  deletedItems: [],
  deletedBookmarkTags: [], // Store the bookmark-tag relationships
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
      .in('id', appStore.selectedItems);
    
    if (fetchError) {
      console.error('Error fetching items to delete:', fetchError);
      showNotification('error', 'Failed to delete items.');
      appStore.setDeleting(false);
      return;
    }
    
    // Get the bookmark-tag relationships that will be deleted
    const { data: bookmarkTagRelationships, error: fetchRelError } = await supabase
      .from('bookmark_tags')
      .select('bookmark_id, tag_id')
      .in('bookmark_id', appStore.selectedItems);
    
    if (fetchRelError) {
      console.error('Error fetching bookmark-tag relationships:', fetchRelError);
      showNotification('error', 'Failed to delete items.');
      appStore.setDeleting(false);
      return;
    }
    
    // Store in undo state BEFORE deleting
    undoState.value.deletedItems = itemsToDelete || [];
    undoState.value.deletedBookmarkTags = bookmarkTagRelationships || [];
    undoState.value.show = true;
    
    // Delete bookmark-tag relationships first (due to foreign key constraints)
    if (bookmarkTagRelationships && bookmarkTagRelationships.length > 0) {
      const { error: deleteRelError } = await supabase
        .from('bookmark_tags')
        .delete()
        .in('bookmark_id', appStore.selectedItems);
      
      if (deleteRelError) {
        console.error('Error deleting bookmark-tag relationships:', deleteRelError);
        showNotification('error', 'Failed to delete bookmark relationships.');
        undoState.value.show = false;
        undoState.value.deletedItems = [];
        undoState.value.deletedBookmarkTags = [];
        appStore.setDeleting(false);
        return;
      }
    }
    
    // Delete bookmarks from database
    const { error: deleteError } = await supabase
      .from('bookmarks')
      .delete()
      .in('id', appStore.selectedItems);
    
    if (deleteError) {
      console.error('Error deleting bookmarks:', deleteError);
      showNotification('error', 'Failed to delete bookmarks.');
      undoState.value.show = false;
      undoState.value.deletedItems = [];
      undoState.value.deletedBookmarkTags = [];
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
  const relationshipsToRestore = undoState.value.deletedBookmarkTags;
  
  if (itemsToRestore.length === 0) return;
  
  try {
    // Step 1: Restore bookmarks first
    // Prepare items for insertion (clean up the data structure)
    const itemsForInsertion = itemsToRestore.map(item => {
      const { bookmark_tags, ...bookmarkData } = item;
      return bookmarkData;
    });

    // Restore bookmarks to the database
    const { error: restoreBookmarksError } = await supabase
      .from('bookmarks')
      .upsert(itemsForInsertion, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (restoreBookmarksError) {
      console.error('Error restoring bookmarks:', restoreBookmarksError);
      showNotification('error', 'Failed to restore bookmarks.');
      return;
    }
    
    // Step 2: Restore bookmark-tag relationships
    if (relationshipsToRestore.length > 0) {
      const { error: restoreRelationshipsError } = await supabase
        .from('bookmark_tags')
        .upsert(relationshipsToRestore, {
          onConflict: 'bookmark_id,tag_id',
          ignoreDuplicates: false
        });
      
      if (restoreRelationshipsError) {
        console.error('Error restoring bookmark-tag relationships:', restoreRelationshipsError);
        // Don't fail completely - bookmarks are restored, just warn about tags
        showNotification('warning', 'Bookmarks restored but some tag relationships may be missing.');
      }
    }
    
    // Clear undo state
    undoState.value.show = false;
    undoState.value.deletedItems = [];
    undoState.value.deletedBookmarkTags = [];
    
    // Trigger refresh for both table and recent bookmarks
    appStore.triggerBookmarkRefresh();
    
    if (!relationshipsToRestore.length || relationshipsToRestore.length === 0) {
      showNotification('success', 'Items restored successfully.');
    } else {
      showNotification('success', 'Items and their tags restored successfully.');
    }
    
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
  undoState.value.deletedBookmarkTags = [];
  undoState.value.timeoutId = null;
  
  // Show a notification that the delete is now permanent
  showNotification('primary', 'Bookmarks permanently deleted.');
}

function dismissUndo() {
  // User explicitly dismisses the undo option so we can go ahead and commitDelete() the selected bookmarks
  commitDelete();
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