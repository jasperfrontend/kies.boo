<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useGlobalKeyboardShortcuts } from '@/composables/useGlobalKeyboardShortcuts'

const drawer = ref(null)
const appStore = useAppStore()
const searchInputRef = ref(null)
const { showShortcutsDialog } = useGlobalKeyboardShortcuts()
import { useRouter } from 'vue-router'

const router = useRouter()

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
  if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'b') {
    event.preventDefault()
    router.push('/')
  }
  if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'p') {
    event.preventDefault()
    router.push('/profile')
  }
  if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'i') {
    event.preventDefault()
    router.push('/import')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <v-navigation-drawer 
    v-model="drawer"
    temporary
  >
    <UserNameAvatar />
    <AppSidebarNav />
  </v-navigation-drawer>
  
  <v-app-bar 
    scroll-behavior="elevate"
    
  >
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    
    <v-app-bar-title>
      <v-container fluid class="py-0">
        <v-row align="center" no-gutters>
          <v-col cols="2">
            <v-text-field
              ref="searchInputRef"
              v-model="appStore.bookmarkSearch"
              label="Search bookmarks (Alt+k)"
              prepend-inner-icon="mdi-magnify"
              variant="solo-inverted"
              density="compact"
              class="mr-2"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="4">
            <v-btn 
              to="/"
              variant="tonal"
              color="primary"
              class="mr-2"
            >
              <v-icon class="mr-2" size="16">mdi-bookmark</v-icon>
              <span>
                Bookmarks 
                <v-badge
                  color="grey-darken-3"
                  title="Shift+Alt+b"
                  content="(sa-b)"
                  inline
                ></v-badge>
              </span>
            </v-btn>

            <v-btn 
              to="/profile"
              variant="tonal"
              color="primary"
              class="mr-2"
            >
              <v-icon class="mr-2" size="16">mdi-account</v-icon>
              <span>
                Profile 
                <v-badge
                  color="grey-darken-3"
                  title="Shift+Alt+p"
                  content="(sa-p)"
                  inline
                ></v-badge>
              </span>
            </v-btn>

            <v-btn 
              to="/import"
              variant="tonal"
              color="primary"
            >
              <v-icon class="mr-2" size="16">mdi-cloud-upload</v-icon>
              <span>
                Import 
                <v-badge
                  color="grey-darken-3"
                  title="Shift+Alt+i"
                  content="(sa-i)"
                  inline
                ></v-badge>
              </span>
            </v-btn>

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
              variant="flat"
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