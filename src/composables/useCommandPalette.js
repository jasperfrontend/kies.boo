// src/composables/useCommandPalette.js
import { onMounted, onUnmounted } from 'vue'
import commandPaletteService from '@/lib/commandPaletteService'
import supabase from '@/lib/supabaseClient'

export function useCommandPalette() {
  let authListener = null

  async function initializeCommandPalette() {
    try {
      await commandPaletteService.initialize()
    } catch (error) {
      console.error('Failed to initialize command palette:', error)
    }
  }

  function handleAuthChange(event, session) {
    if (session?.user) {
      // User logged in, initialize command palette
      initializeCommandPalette()
    } else {
      // User logged out, reset command palette
      commandPaletteService.reset()
    }
  }

  onMounted(async () => {
    // Check if user is already authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await initializeCommandPalette()
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)
    authListener = subscription
  })

  onUnmounted(() => {
    // Clean up auth listener
    if (authListener) {
      authListener.unsubscribe()
    }
  })

  return {
    commandPaletteService,
    initializeCommandPalette
  }
}