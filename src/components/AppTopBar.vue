<script setup>
import { ref } from 'vue'
import { useGlobalKeyboardShortcuts } from '@/composables/useGlobalKeyboardShortcuts'
const drawer = ref(null)
const { showShortcutsDialog } = useGlobalKeyboardShortcuts()

function handleDeleteSelected() {
  const event = new CustomEvent('delete-selected-bookmarks')
  document.dispatchEvent(event)
}
</script>

<template>
  <v-navigation-drawer 
    v-model="drawer"
    temporary
  >
    <UserNameAvatar />
    <AppSidebarNav />
  </v-navigation-drawer>
  
  <v-app-bar scroll-behavior="elevate">
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>    
    <v-app-bar-title>
      <v-container fluid class="py-0">
        <v-row align="center" no-gutters>
          <v-col cols="2">
            <SearchBookmarks />
          </v-col>
          <v-col cols="4">            
            <AppNavigation />
          </v-col>
          <v-spacer />
          <v-col cols="auto" class="d-flex gap-2">
            <ButtonDeleteBookmarks @delete-selected="handleDeleteSelected" />
            <ButtonAddBookmark />
          </v-col>
        </v-row>
      </v-container>      
    </v-app-bar-title>
  </v-app-bar>
  <KeyboardShortcutsDialog v-model="showShortcutsDialog" />
</template>