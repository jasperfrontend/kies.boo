<template>
  <v-container class="pa-1" fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" color="secondary" variant="flat">
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-2">mdi-tag</v-icon>
            <div>
              <div class="text-h6">Tag: "{{ tagTitle }}"</div>
              <v-btn
                :disabled="buttonDisabled"
                :loading="saving"
                size="small"
                variant="tonal"
                @click="handleSaveSearch"
              >
                <v-icon icon="mdi-content-save-plus" />
                {{ buttonText }}
              </v-btn>
            </div>
            <v-spacer />
            <v-btn
              prepend-icon="mdi-arrow-left"
              to="/"
              variant="outlined"
            >
              Back to All Bookmarks
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <BookmarkTable
      v-model:selected-items="selectedItems"
      :search-term="tagTitle"
      :search-type="'tag'"
      @bookmark-updated="onBookmarkUpdated"
      @delete-selected="onBookmarkDeleted"
    />

    <NotificationComponent
      :message="notification.message"
      position="bottom-right"
      :show="notification.show"
      :type="notification.type"
      @close="closeNotification"
    />
  </v-container>
</template>

<script setup>
  import { computed, ref } from 'vue'
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
    buttonText,
    buttonDisabled,
    saving,
    saveCurrentSearch,
  } = useSavedSearches()

  // Notification state
  const notification = ref({
    show: false,
    type: 'success',
    message: '',
  })

  function showNotification (type, message) {
    notification.value = {
      show: true,
      type,
      message,
    }
  }

  function closeNotification () {
    notification.value.show = false
  }

  function onBookmarkUpdated () {
    showNotification('success', 'Bookmark updated successfully!')
  }

  function onBookmarkDeleted () {
    // Clear selected items
    selectedItems.value = []
  }

  async function handleSaveSearch () {
    const result = await saveCurrentSearch()

    if (result.success) {
      showNotification('success', result.message)
    } else {
      showNotification('error', result.message)
    }
  }
</script>
