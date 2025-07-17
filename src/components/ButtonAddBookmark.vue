<script setup>
  import { useAppStore } from '@/stores/app'
  const appStore = useAppStore()
</script>

<template>
  <v-btn
    color="primary"
    prepend-icon="mdi-bookmark-plus"
    variant="flat"
    @click="appStore.openAddBookmarkDialog()"
  >
    Add Bookmark
    <v-badge
      color="grey-darken-3"
      content="Alt+A"
      inline
    />
  </v-btn>
</template>
