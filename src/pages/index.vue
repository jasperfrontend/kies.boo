<script setup>
import { ref, watch } from 'vue';
import NotificationComponent from '@/components/NotificationComponent.vue';
import BookmarkTable from '@/components/BookmarkTable.vue';
import AddBookmarkDialog from '@/components/AddBookmarkDialog.vue';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();


// Notification state
const notification = ref({
  show: false,
  type: 'success',
  message: ''
});


// Watch for dialog state changes from store
watch(() => appStore.addBookmarkDialog, (newValue) => {
  if (!newValue) {
    // Dialog was closed, trigger bookmark refresh
    appStore.triggerBookmarkRefresh();
  }
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

// Handle bookmark update from BookmarkTable
function onBookmarkUpdated() {
  // Trigger refresh for recent bookmarks in sidebar
  appStore.triggerBookmarkRefresh();
  
  showNotification('success', 'Bookmark updated successfully!');
}



async function onBookmarkAdded() {
  try {
    appStore.closeAddBookmarkDialog();
    // Trigger refresh for recent bookmarks in sidebar
    appStore.triggerBookmarkRefresh();
    showNotification('success', 'Bookmark added successfully!');
  } catch (error) {
    console.error('Failed to refresh bookmarks:', error);
    showNotification('error', 'Failed to refresh bookmarks');
  }
}

// Setup keyboard shortcuts
useKeyboardShortcuts({
  onAddBookmark: () => { appStore.openAddBookmarkDialog(); },
  onRefreshBookmarks: appStore.triggerBookmarkRefresh()
});
</script>

<template>
  <v-container 
    fluid
    class="pa-1"
  >
    <BookmarkTable
      :dialog-open="appStore.addBookmarkDialog"
      v-model:selected-items="appStore.selectedItems"
      @bookmark-updated="onBookmarkUpdated"
    />

    <AddBookmarkDialog
      v-model="appStore.addBookmarkDialog"
      @bookmark-added="onBookmarkAdded"
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