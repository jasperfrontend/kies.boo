<template>
  <v-container fluid class="pa-1">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" color="primary">
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-2">mdi-tag</v-icon>
            <div>
              <div class="text-h6">Tag: "{{ tagTitle }}"</div>
              <div class="text-caption">Showing bookmarks tagged {{ tagTitle }}</div>
              <v-btn
                variant="tonal"
                size="small"
                @click="handleSaveSearch"
                :disabled="buttonDisabled"
                :loading="saving"
              >
                <v-icon icon="mdi-content-save-plus"></v-icon> 
                {{ buttonText }}
              </v-btn>
            </div>
            <v-spacer />
            <v-btn
              to="/"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
            >
              Back to All Bookmarks
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <BookmarkTable
      :search-type="'tag'"
      :search-term="tagTitle"
      v-model:selected-items="selectedItems"
      @bookmark-updated="onBookmarkUpdated"
    />

    <NotificationComponent
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      position="bottom-right"
      @close="closeNotification"
    />
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import BookmarkTable from '@/components/BookmarkTable.vue'
import NotificationComponent from '@/components/NotificationComponent.vue'
import { useSavedSearches } from '@/composables/useSavedSearches'

const route = useRoute()
const selectedItems = ref([])

// Get tag title from route params
const tagTitle = computed(() => {
  return decodeURIComponent(route.params.tagtitle || '')
})

// Saved searches functionality
const {
  isCurrentPathSaved,
  buttonText,
  buttonDisabled,
  saving,
  saveCurrentSearch
} = useSavedSearches()

// Notification state
const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  }
}

function closeNotification() {
  notification.value.show = false
}

function onBookmarkUpdated() {
  showNotification('success', 'Bookmark updated successfully!')
}

async function handleSaveSearch() {
  const result = await saveCurrentSearch()
  
  if (result.success) {
    showNotification('success', result.message)
  } else {
    showNotification('error', result.message)
  }
}
</script>