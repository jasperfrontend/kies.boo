<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

const drawer = ref(null)
const appStore = useAppStore()

// Emit event for delete action
const emit = defineEmits(['delete-selected'])

// Handle keyboard shortcuts
const handleKeydown = (event) => {
  if (event.altKey && event.key === 'a') {
    event.preventDefault()
    appStore.openAddBookmarkDialog()
  }
  
  if (event.altKey && event.key === 'i' && appStore.selectedItems.length > 0) {
    event.preventDefault()
    handleDeleteSelected()
  }
}

function handleDeleteSelected() {
  emit('delete-selected')
}

// Add event listener for keyboard shortcuts
document.addEventListener('keydown', handleKeydown)

// Clean up event listener when component unmounts
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <v-navigation-drawer v-model="drawer">
    <UserNameAvatar />
    <AppSidebarNav />
  </v-navigation-drawer>
  
  <v-app-bar>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    
    <v-app-bar-title>
      <RouterLink to="/" class="text-white text-decoration-none">
        kies.boo
      </RouterLink>
    </v-app-bar-title>
    
    <!-- Search field -->
    <template v-slot:extension>
      <v-container fluid class="py-0">
        <v-row align="center" no-gutters>
          <v-col cols="12" md="6" lg="6">
            <v-text-field
              v-model="appStore.bookmarkSearch"
              label="Search bookmarks"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            />
          </v-col>
          <v-spacer />
          <v-col cols="auto" class="d-flex gap-2">
            <!-- Delete button (only shown when items are selected) -->
            <v-btn
              v-if="appStore.selectedItems.length > 0"
              color="red-darken-4"
              variant="elevated"
              :loading="appStore.deleting"
              @click="handleDeleteSelected"
              prepend-icon="mdi-delete"
            >
              Delete {{ appStore.selectedItems.length }} item{{ appStore.selectedItems.length === 1 ? '' : 's' }} (Alt+I)
            </v-btn>
            
            <!-- Add bookmark button -->
            <v-btn
              color="primary"
              variant="elevated"
              @click="appStore.openAddBookmarkDialog()"
              prepend-icon="mdi-bookmark-plus"
            >
              Add Bookmark (Alt+A)
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-app-bar>
</template>