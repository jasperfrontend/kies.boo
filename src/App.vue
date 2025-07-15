<template>
  <v-app>
    <component :is="isAuthenticated ? 'router-view' : Login" />
    
    <!-- Global Keyboard Shortcuts Dialog -->
    <KeyboardShortcutsDialog v-model="showShortcutsDialog" />
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Login from './components/Login.vue'
import KeyboardShortcutsDialog from './components/KeyboardShortcutsDialog.vue'
import supabase from './lib/supabaseClient'
import { useAppHotkeys, useGlobalHotkeys } from './composables/useAppHotkeys'
import { useAppStore } from './stores/app'

const isAuthenticated = ref(false)
const router = useRouter()
const appStore = useAppStore()

// Initialize hotkeys system
const { showShortcutsDialog } = useGlobalHotkeys()
const { setupHotkeys } = useAppHotkeys(router, appStore)

onMounted(async () => {
  // Clean up URL after OAuth redirect
  // const urlParams = new URLSearchParams(window.location.search)
  // if (urlParams.has('code')) {
  //   // Remove the code parameter from URL without page reload
  //   const cleanUrl = window.location.origin + window.location.pathname
  //   window.history.replaceState({}, document.title, cleanUrl)
  // }

  const { data: { session } } = await supabase.auth.getSession()
  isAuthenticated.value = !!session
  
  supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session
  })

  // Initialize hotkeys after authentication check
  if (isAuthenticated.value) {
    setupHotkeys()
  }
})
</script>