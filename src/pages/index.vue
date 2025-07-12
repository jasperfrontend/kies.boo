<template>
  <v-container 
    v-if="!loading"
    fluid
    class="pa-1"
  >
    <BookmarkTable
      :dialog-open="appStore.addBookmarkDialog"
      v-model:selected-items="appStore.selectedItems"
      @bookmark-updated="onBookmarkUpdated"
      @delete-selected="onBookmarkDeleted"
    />

    <AddBookmarkDialog
      v-model="appStore.addBookmarkDialog"
      @bookmark-added="onBookmarkAdded"
    />

    <!-- Global Delete Handler (now just handles undo functionality) -->
    <GlobalDeleteHandler />

    <NotificationComponent
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      position="bottom-right"
      @close="closeNotification"
    />
  </v-container>
  <v-container v-else>
    Loading...
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import NotificationComponent from '@/components/NotificationComponent.vue';
import BookmarkTable from '@/components/BookmarkTable.vue';
import AddBookmarkDialog from '@/components/AddBookmarkDialog.vue';
import GlobalDeleteHandler from '@/components/GlobalDeleteHandler.vue';
import { useAppStore } from '@/stores/app';

const loading = ref(true)
const appStore = useAppStore()

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

function closeNotification() {
  notification.value.show = false;
}

// Handle bookmark update from BookmarkTable
function onBookmarkUpdated() {
  // Trigger refresh for recent bookmarks in sidebar
  appStore.triggerBookmarkRefresh();
  showNotification('success', 'Bookmark updated successfully!');
}

function onBookmarkDeleted() {
  // Just clear selected items, delete component handles everything else
  appStore.clearSelectedItems()
}

onMounted(() => {
  loading.value = false
})

</script>