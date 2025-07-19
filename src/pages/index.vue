<template>
  <v-container
    class="pa-1"
    fluid
  >

    <BookmarkTable
      v-model:selected-items="appStore.selectedItems"
      :dialog-open="appStore.addBookmarkDialog"
      @bookmark-updated="onBookmarkUpdated"
      @delete-selected="onBookmarkDeleted"
    />

    <!-- Global Delete Handler (now just handles undo functionality) -->
    <GlobalDeleteHandler />

    <NotificationComponent
      :message="notification.message"
      position="bottom-right"
      :show="notification.show"
      :type="notification.type"
      @close="closeNotification"
    />
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import BookmarkTable from '@/components/BookmarkTable.vue'
  import GlobalDeleteHandler from '@/components/GlobalDeleteHandler.vue'
  import NotificationComponent from '@/components/NotificationComponent.vue'
  import { useAppStore } from '@/stores/app'

  const appStore = useAppStore()
  // Notification state
  const notification = ref({
    show: false,
    type: 'success',
    message: '',
  })

  function closeNotification () {
    notification.value.show = false
  }

  function onBookmarkDeleted () {
    // Just clear selected items, delete component handles everything else
    appStore.clearSelectedItems()
  }
</script>
