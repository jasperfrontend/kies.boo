<template>
  <div class="text-center py-8">
    <v-icon class="mb-3" color="grey-darken-1" icon="mdi-bookmark-outline" size="64" />
    <div class="text-h6 text-grey-darken-1 mb-2">{{ getNoDataMessage(searchType, searchTerm) }}</div>
  </div>
</template>

<script setup>
import { getNoDataMessage } from '@/lib/bookmarkMessages'

defineProps({
  searchTerm: String,
  searchType: String,
})
</script>