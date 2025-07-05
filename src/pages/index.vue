<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import supabase from '@/lib/supabaseClient';
import NotificationComponent from '@/components/NotificationComponent.vue';
import BookmarkTable from '@/components/BookmarkTable.vue';
import BookmarkToolbar from '@/components/BookmarkToolbar.vue';
import UndoSnackbar from '@/components/UndoSnackbar.vue';
import AddBookmarkDialog from '@/components/AddBookmarkDialog.vue';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

const bookmarks = ref([]);
const loading = ref(false);
const search = ref('');
const selectedItems = ref([]);
const deleting = ref(false);

// Dialog state for Add Bookmark
const addBookmarkDialog = ref(false);

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

const filteredBookmarks = computed(() => {
  if (!search.value) return bookmarks.value;
  return bookmarks.value.filter(b =>
    (b.title && b.title.toLowerCase().includes(search.value.toLowerCase())) ||
    (b.url && b.url.toLowerCase().includes(search.value.toLowerCase()))
  );
});

function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  };
}

function closeNotification() {
  notification.value.show = false;
}

function deleteSelectedItems() {
  if (selectedItems.value.length === 0) return;
  
  // Store the items that are being deleted
  const itemsToDelete = bookmarks.value.filter(
    bookmark => selectedItems.value.includes(bookmark.id)
  );
  
  // Remove from UI immediately
  bookmarks.value = bookmarks.value.filter(
    bookmark => !selectedItems.value.includes(bookmark.id)
  );
  
  // Store in undo state
  undoState.value.deletedItems = itemsToDelete;
  undoState.value.show = true;
  
  // Clear selections
  selectedItems.value = [];
  
  // Set timeout to actually delete from database
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId);
  }
  
  undoState.value.timeoutId = setTimeout(() => {
    commitDelete();
  }, 10000); // 10 seconds to undo
}

function undoDelete() {
  // Clear the timeout
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId);
    undoState.value.timeoutId = null;
  }
  
  // Restore items to the bookmarks array
  bookmarks.value = [...bookmarks.value, ...undoState.value.deletedItems];
  
  // Sort by created_at descending to maintain original order
  bookmarks.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Clear undo state
  undoState.value.show = false;
  undoState.value.deletedItems = [];
  
  showNotification('success', 'Items restored successfully.');
}

async function commitDelete() {
  const itemsToDelete = undoState.value.deletedItems;
  const itemCount = itemsToDelete.length;
  
  if (itemCount === 0) return;
  
  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .in('id', itemsToDelete.map(item => item.id));
    
    if (error) {
      console.error('Error deleting bookmarks:', error);
      // If database delete fails, restore the items
      bookmarks.value = [...bookmarks.value, ...itemsToDelete];
      bookmarks.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      showNotification(
        'error',
        `Failed to delete ${itemCount} item${itemCount === 1 ? '' : 's'}. Items have been restored.`
      );
    }
  } catch (error) {
    console.error('Error deleting bookmarks:', error);
    // If database delete fails, restore the items
    bookmarks.value = [...bookmarks.value, ...itemsToDelete];
    bookmarks.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    showNotification(
      'error',
      `Failed to delete ${itemCount} item${itemCount === 1 ? '' : 's'}. Items have been restored.`
    );
  } finally {
    // Clear undo state
    undoState.value.show = false;
    undoState.value.deletedItems = [];
    undoState.value.timeoutId = null;
  }
}

function dismissUndo() {
  // User explicitly dismisses the undo option
  commitDelete();
}

async function onBookmarkAdded() {
  try {
    await fetchBookmarks();
    addBookmarkDialog.value = false;
  } catch (error) {
    console.error('Failed to refresh bookmarks:', error);
    showNotification('error', 'Failed to refresh bookmarks');
  }
}

async function fetchBookmarks() {
  loading.value = true;
  let { data, error } = await supabase
    .from('bookmarks')
    .select('id, url, title, favicon, created_at')
    .order('created_at', { ascending: false });
  if (!error) bookmarks.value = data;
  loading.value = false;
}

onMounted(() => {
  fetchBookmarks();
});

onUnmounted(() => {
  // Clean up timeout if component unmounts
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId);
  }
});

// Setup keyboard shortcuts
useKeyboardShortcuts({
  onAddBookmark: () => { addBookmarkDialog.value = true; },
  onDeleteSelected: deleteSelectedItems,
  onUndoDelete: () => {
    if (undoState.value.show) {
      undoDelete();
    }
  }
});
</script>

<template>
  <v-container fluid>
    <BookmarkToolbar
      v-model:search="search"
      :selected-items="selectedItems"
      :deleting="deleting"
      @add-bookmark="addBookmarkDialog = true"
      @delete-selected="deleteSelectedItems"
    />

    <BookmarkTable
      :bookmarks="filteredBookmarks"
      :loading="loading"
      :dialog-open="addBookmarkDialog"
      v-model:selected-items="selectedItems"
    />

    <AddBookmarkDialog
      v-model="addBookmarkDialog"
      @bookmark-added="onBookmarkAdded"
    />

    <UndoSnackbar
      v-model="undoState.show"
      :deleted-items="undoState.deletedItems"
      @undo="undoDelete"
      @dismiss="dismissUndo"
    />

    <NotificationComponent
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      position="bottom-right"
      @close="closeNotification"
    />
  </v-container>
</template>