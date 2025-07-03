<script setup>
import supabase from '@/lib/supabaseClient';
import { ref, onMounted } from 'vue'
const recentBookmarks = ref([])
async function getRecentBookmarks() {
  const { data, error } = await supabase
  .from('bookmarks')
  .select()
  .limit(5);

  if(error) {
    console.log("error getting recent bookmarks: ", error);
    return false;
  }
  recentBookmarks.value = data;
}

onMounted(() => {
  getRecentBookmarks()
})

</script>

<template>
<v-list-item v-for="bookmark in recentBookmarks" :key="bookmark.id">
  <template v-slot:prepend>
    <v-avatar 
      rounded="0"
      size="24"
      :image=bookmark.favicon
      @error="e => e.target.src = '/default-favicon.png'"
    ></v-avatar>
  </template>
  <v-list-item-title>{{ bookmark.title }}</v-list-item-title>
  <v-list-item-subtitle><a :href="bookmark.url" target="_blank">{{ bookmark.url }}</a></v-list-item-subtitle>
</v-list-item>
</template>