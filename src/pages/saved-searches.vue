<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// Use the store's saved searches instead of local state
const savedSearches = computed(() => appStore.savedSearches)

onMounted(async () => {
  // Ensure saved searches are loaded
  await appStore.ensureSavedSearchesLoaded()
})
</script>

<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h4 mb-4">
            Your saved <code>/paths</code>
          </v-card-title>

          <v-card-text class="mb-6">
            <div v-if="savedSearches.length === 0" class="text-center text-grey-darken-1">
              <v-icon icon="mdi-magnify-plus-outline" size="48" class="mb-2" />
              <p>No saved searches yet</p>
              <p class="text-caption">Save paths from tag or search result pages to access them quickly later</p>
            </div>
            
            <v-chip
              v-for="(search, index) in savedSearches"
              :key="index"
              variant="tonal"
              color="primary-lighten-3"
              class="cursor-pointer mr-2 mb-2"
              :to="search.url"
            >
              {{ search.url }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>