<script setup>
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
</script>

<template>
<v-btn
  color="primary"
  variant="flat"
  @click="appStore.openAddBookmarkDialog()"
  prepend-icon="mdi-bookmark-plus"
>
  Add Bookmark 
  <v-badge
    color="grey-darken-3"
    content="Alt+A"
    inline
  ></v-badge>
</v-btn>
</template>