<template>
  <v-alert class="ma-4" type="info">
    {{ getNoDataMessage(searchType, searchTerm) }}
  </v-alert>
</template>

<script setup>
import { getNoDataMessage } from '@/lib/bookmarkMessages'

defineProps({
  searchTerm: String,
  searchType: String,
})
</script>