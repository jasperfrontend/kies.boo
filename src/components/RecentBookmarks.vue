<script setup>
import supabase from '@/lib/supabaseClient';
import { ref, onMounted, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const recentBookmarks = ref([])
const loading = ref(false)

function displayUrl(url) {
  return url
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');
}

async function getRecentBookmarks() {
  loading.value = true
  const { data, error } = await supabase
  .from('bookmarks')
  .select()
  .order('created_at', { ascending: false })
  .limit(5);

  if(error) {
    console.log("error getting recent bookmarks: ", error);
    return false;
  }
  recentBookmarks.value = data || [];
  loading.value = false
}

// Watch for bookmark refresh trigger changes
watch(() => appStore.bookmarkRefreshTrigger, () => {
  getRecentBookmarks()
})

onMounted(() => {
  getRecentBookmarks()
})
</script>

<template>
  <!-- Loading state -->
  <v-list-item v-if="loading">
    <template v-slot:prepend>
      <v-skeleton-loader type="avatar" width="24" height="24"></v-skeleton-loader>
    </template>
    <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
  </v-list-item>

  <!-- Empty state -->
  <v-list-item v-else-if="recentBookmarks.length === 0">
    <template v-slot:prepend>
      <v-icon color="grey-darken-1" size="24">mdi-bookmark-outline</v-icon>
    </template>
    <v-list-item-title class="text-grey-darken-1">No bookmarks yet</v-list-item-title>
    <v-list-item-subtitle class="text-grey-darken-2">
      Add your first bookmark to get started
    </v-list-item-subtitle>
  </v-list-item>

  <!-- Bookmarks list -->
  <v-list-item v-else v-for="(bookmark, i) in recentBookmarks" :key="bookmark.id" :href="bookmark.url" target="_blank">
    <template v-slot:prepend>
      <v-avatar 
        rounded="0"
        size="24"
      >
        <img
          :src="bookmark.favicon"
          alt="favicon"
          width="24"
          height="24"
          @error="e => e.target.src = '/default-favicon.png'"
        />
      </v-avatar>
    </template>
    <v-list-item-title>{{ bookmark.title }}</v-list-item-title>
    <v-list-item-subtitle
      class="text-blue opacity-1"
    >
      {{ displayUrl(bookmark.url) }}
    </v-list-item-subtitle>
  </v-list-item>
</template>