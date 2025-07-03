<script setup>
import { ref, computed, onMounted } from 'vue';
import supabase from '@/lib/supabaseClient';

const name = ref("Jasper");
const bookmarks = ref([]);
const loading = ref(false);
const search = ref('');
const itemsPerPage = ref(20);
const itemsPerPageOptions = [20, 40, 60, 80, 100, -1]; // -1 for 'All'

const headers = [
  { title: 'Title', value: 'title' },
  { title: 'URL', value: 'url' },
  { title: 'Favicon', value: 'favicon' },
  { title: 'Created At', value: 'created_at' },
  { title: 'Last Visited', value: 'last_visited' },
];

const filteredBookmarks = computed(() => {
  if (!search.value) return bookmarks.value;
  return bookmarks.value.filter(b =>
    (b.title && b.title.toLowerCase().includes(search.value.toLowerCase())) ||
    (b.url && b.url.toLowerCase().includes(search.value.toLowerCase()))
  );
});

async function fetchBookmarks() {
  loading.value = true;
  let { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false });
  if (!error) bookmarks.value = data;
  loading.value = false;
}

onMounted(() => {
  fetchBookmarks();
});
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Search bookmarks"
          prepend-inner-icon="mdi-magnify"
          clearable
        />
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="filteredBookmarks"
      :items-per-page="itemsPerPage === -1 ? filteredBookmarks.length : itemsPerPage"
      :loading="loading"
      class="elevation-1"
      :mobile-breakpoint="600"
    >
      <template #item.favicon="{ item }">
        <v-avatar size="24" rounded="0">
          <img :src="item.favicon || '/default-favicon.png'" alt="favicon" />
        </v-avatar>
      </template>
      <template #item.url="{ item }">
        <a :href="item.url" target="_blank">{{ item.url }}</a>
      </template>
      <template #no-data>
        <v-alert type="info">No bookmarks found.</v-alert>
      </template>
    </v-data-table>
  </v-container>
</template>
