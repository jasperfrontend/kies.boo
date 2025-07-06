<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useGlobalKeyboardShortcuts } from '@/composables/useGlobalKeyboardShortcuts'

const drawer = ref(null)
const appStore = useAppStore()
const searchInputRef = ref(null)
const { showShortcutsDialog } = useGlobalKeyboardShortcuts()

// Emit event for delete action
const emit = defineEmits(['delete-selected'])
function handleDeleteSelected() {
  emit('delete-selected')
}

// Keyboard shortcut for focusing search bar
const handleKeydown = (event) => {
  // Alt+k to focus search bar
  if (event.altKey && event.key === 'k') {
    event.preventDefault()
    searchInputRef.value?.focus()
  }
}

function openShortcutsDialog() {
  showShortcutsDialog.value = true
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

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
      <v-container fluid class="py-0">
        <v-row align="center" no-gutters>
          <v-col cols="12" md="6" lg="6">
            <v-text-field
              ref="searchInputRef"
              v-model="appStore.bookmarkSearch"
              label="Search bookmarks (Alt+k)"
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
              variant="outlined"
              :loading="appStore.deleting"
              @click="handleDeleteSelected"
              prepend-icon="mdi-delete"
              class="mx-4"
            >
              Delete {{ appStore.selectedItems.length }} item{{ appStore.selectedItems.length === 1 ? '' : 's' }} 
              <v-badge
                color="grey-darken-3"
                content="Alt+I"
                inline
              ></v-badge>
            </v-btn>
            
            <!-- Add bookmark button -->
            <v-btn
              color="primary"
              variant="outlined"
              @click="appStore.openAddBookmarkDialog()"
              prepend-icon="mdi-bookmark-plus"
            >
              Add Bookmark 
              <v-badge
                color="grey-darken-3"
                content="Alt+A"
                inline
              ></v-badge>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>      
    </v-app-bar-title>
  </v-app-bar>
  <KeyboardShortcutsDialog v-model="showShortcutsDialog" />
</template>