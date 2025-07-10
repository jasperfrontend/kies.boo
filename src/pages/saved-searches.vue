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
              :key="search.id || index"
              variant="tonal"
              color="primary-lighten-3"
              class="cursor-pointer mr-2 mb-2"
              :to="search.url"
              closable
              @click:close="handleDeletePath(search)"
            >
              {{ search.url }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Notification Component -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type"
      :timeout="3000"
      location="bottom right"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="notification.type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'" 
          class="me-2" 
        />
        {{ notification.message }}
      </div>
    </v-snackbar>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="400" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-delete" class="mr-2" color="error" />
          Confirm Deletion
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to delete this saved path?
          <v-code class="d-block mt-2 pa-2">{{ confirmDialog.path }}</v-code>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="confirmDialog.show = false"
            :disabled="deleting"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            variant="flat"
            @click="confirmDeletePath"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import supabase from '@/lib/supabaseClient'

const appStore = useAppStore()

// Use the store's saved searches instead of local state
const savedSearches = computed(() => appStore.savedSearches)

// Loading and notification states
const deleting = ref(false)
const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

// Confirmation dialog state
const confirmDialog = ref({
  show: false,
  search: null,
  path: ''
})

function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  }
}

function handleDeletePath(search) {
  // Show confirmation dialog
  confirmDialog.value = {
    show: true,
    search: search,
    path: search.url
  }
}

async function confirmDeletePath() {
  if (!confirmDialog.value.search) return
  
  deleting.value = true
  
  try {
    // Get current user to ensure we only delete their paths
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      showNotification('error', 'You must be logged in to delete saved paths')
      return
    }
    
    const userId = session.user.id
    const pathToDelete = confirmDialog.value.search.url
    
    // Delete from Supabase with user_id check for security
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('url', pathToDelete)
      .eq('user_id', userId) // Ensure we only delete current user's paths
    
    if (error) {
      console.error('Error deleting saved path:', error)
      showNotification('error', 'Failed to delete saved path')
      return
    }
    
    // Remove from store (this will update the UI)
    await appStore.removeSavedSearch(pathToDelete)
    
    showNotification('success', `Deleted path: ${pathToDelete}`)
    
  } catch (error) {
    console.error('Error deleting saved path:', error)
    showNotification('error', 'Failed to delete saved path')
  } finally {
    deleting.value = false
    confirmDialog.value.show = false
    confirmDialog.value.search = null
    confirmDialog.value.path = ''
  }
}

onMounted(async () => {
  // Ensure saved searches are loaded
  await appStore.ensureSavedSearchesLoaded()
})
</script>