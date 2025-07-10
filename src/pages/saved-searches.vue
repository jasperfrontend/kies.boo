<script setup>
import supabase from '@/lib/supabaseClient';
import { ref, onMounted } from 'vue';

const savedSearches = ref([])

async function getSavedSearches() {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')

  if(error) return console.error("Error retrieving saved searches:", error);
  savedSearches.value = data;
}

onMounted(() => {
  getSavedSearches()
})
</script>

<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h4 mb-4">
            Your saved searches
          </v-card-title>

          <v-card-text class="mb-6">
            <v-chip
              v-for="(searches, index) in savedSearches"
              :key="index"
              
              variant="tonal"
              color="primary-lighten-3"
              class="cursor-pointer mr-2 mb-2"
              :to="searches.url"
            >
              {{ searches.url }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>