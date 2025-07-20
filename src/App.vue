<template>
  <v-app>
    <component :is="isAuthenticated ? 'router-view' : Login" />
    <KeyboardShortcutsDialog v-model="showShortcutsDialog" />
    <MobileFAB v-if="isAuthenticated" @open-profile-menu="handleOpenProfileMenu" />
  </v-app>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import KeyboardShortcutsDialog from './components/KeyboardShortcutsDialog.vue'
  import Login from './components/Login.vue'
  import MobileFAB from './components/MobileFAB.vue'
  import { useAppHotkeys, useGlobalHotkeys } from './composables/useAppHotkeys'
  import { useCommandPalette } from './composables/useCommandPalette'
  import supabase from './lib/supabaseClient'
  import { useAppStore } from './stores/app'

  const isAuthenticated = ref(false)
  const router = useRouter()
  const appStore = useAppStore()

  // Initialize hotkeys system
  const { showShortcutsDialog } = useGlobalHotkeys()
  const { setupHotkeys } = useAppHotkeys(router, appStore)

  // Initialize command palette system
  useCommandPalette()

  // Handle profile menu opening from FAB
  function handleOpenProfileMenu () {
    // Emit a custom event that AppTopBar can listen for
    document.dispatchEvent(new CustomEvent('open-profile-menu'))
  }

  onMounted(async () => {
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
