<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

const drawer = ref(null)
const appStore = useAppStore()

// Emit event for delete action
const emit = defineEmits(['delete-selected'])
function handleDeleteSelected() {
  emit('delete-selected')
}

</script>

<template>
  <v-navigation-drawer v-model="drawer">
    <UserNameAvatar />
    <AppSidebarNav />
  </v-navigation-drawer>
  
  <v-app-bar>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <template v-slot:append>
      <v-btn to="/"><v-icon icon="mdi-home"></v-icon> </v-btn>
    </template>
    
    <v-app-bar-title>
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
              class="mx-4"
            >
              Delete {{ appStore.selectedItems.length }} item{{ appStore.selectedItems.length === 1 ? '' : 's' }} 
              <v-badge
                color="white"
                content="Alt+I"
                inline
              ></v-badge>
            </v-btn>
            
            <!-- Add bookmark button -->
            <v-btn
              color="primary"
              variant="elevated"
              @click="appStore.openAddBookmarkDialog()"
              prepend-icon="mdi-bookmark-plus"
            >
              Add Bookmark 
              <v-badge
                color="white"
                content="Alt+A"
                inline
              ></v-badge>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>      
    </v-app-bar-title>
  </v-app-bar>
</template>