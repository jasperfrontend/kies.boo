<script setup>
import supabase from '@/lib/supabaseClient';
import { ref, onMounted, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const recentBookmarks = ref([])

const displayUrls = computed(() =>
  recentBookmarks.value.map(b => b.url.replace(/^https?:\/\/(www\.)?/, ''))
)

async function getRecentBookmarks() {
  const { data, error } = await supabase
  .from('bookmarks')
  .select()
  .order('created_at', { ascending: false })
  .limit(5);

  if(error) {
    console.log("error getting recent bookmarks: ", error);
    return false;
  }
  recentBookmarks.value = data;
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
<v-list-item v-for="(bookmark, i) in recentBookmarks" :key="bookmark.id">
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
  <v-list-item-subtitle>
    <a :href="bookmark.url" target="_blank">{{ displayUrls[i] }}</a>
  </v-list-item-subtitle>
</v-list-item>
</template>