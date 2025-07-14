<template>
  <v-container 
    fluid
    class="pa-1"
  >
  
    <v-sheet
      width="100%"
      class="pa-2 mt-2 text-caption"
      color="blue-lighten-4"
    >
      Hi and welcome to Kies.boo. This project is in active development so if you encounter bugs, 
      know that I'm on top of it to fix them all and extend the features of Kies.boo!
    </v-sheet>
    <BookmarkTable
      :dialog-open="appStore.addBookmarkDialog"
      v-model:selected-items="appStore.selectedItems"
      @bookmark-updated="onBookmarkUpdated"
      @delete-selected="onBookmarkDeleted"
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
</template>

<script setup>
import { ref } from 'vue';
import NotificationComponent from '@/components/NotificationComponent.vue';
import BookmarkTable from '@/components/BookmarkTable.vue';
import GlobalDeleteHandler from '@/components/GlobalDeleteHandler.vue';
import { useAppStore } from '@/stores/app';

const loading = ref(true)
const appStore = useAppStore()
const helloWelcomeText = ref(true)

// Notification state
const notification = ref({
  show: false,
  type: 'success',
  message: ''
});


function closeNotification() {
  notification.value.show = false;
}


function onBookmarkDeleted() {
  // Just clear selected items, delete component handles everything else
  appStore.clearSelectedItems()
}
</script>