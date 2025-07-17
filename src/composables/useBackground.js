// src/composables/useBackground.js
import { onMounted, onUnmounted, ref } from 'vue'
import backgroundPreferencesService from '@/lib/backgroundPreferencesService'
import supabase from '@/lib/supabaseClient'

export function useBackground () {
  const currentBackground = ref(null)
  const loading = ref(false)

  /**
   * Load and apply user's background preference
   */
  async function loadBackground () {
    loading.value = true
    try {
      const background = await backgroundPreferencesService.getUserPreferences()
      currentBackground.value = background

      if (background) {
        backgroundPreferencesService.applyBackground(background)
      }
    } catch (error) {
      console.error('Error loading background:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * Handle authentication state changes
   */
  function handleAuthChange (event, session) {
    if (session?.user) {
      // User logged in, load their background
      loadBackground()
    } else {
      // User logged out, clear background
      currentBackground.value = null
      backgroundPreferencesService.clearBackground()
    }
  }

  /**
   * Set up auth listener
   */
  function setupAuthListener () {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    // Return cleanup function
    return () => {
      subscription?.unsubscribe()
    }
  }

  /**
   * Update background preference
   */
  async function updateBackground (backgroundData) {
    try {
      const success = await backgroundPreferencesService.saveBackgroundPreference(backgroundData)

      if (success) {
        currentBackground.value = backgroundData

        if (backgroundData) {
          backgroundPreferencesService.applyBackground(backgroundData)
        } else {
          backgroundPreferencesService.clearBackground()
        }
      }

      return success
    } catch (error) {
      console.error('Error updating background:', error)
      return false
    }
  }

  // Set up auth listener and load initial background
  let unsubscribeAuth

  onMounted(async () => {
    unsubscribeAuth = setupAuthListener()

    // Check if user is already authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await loadBackground()
    }
  })

  onUnmounted(() => {
    if (unsubscribeAuth) {
      unsubscribeAuth()
    }
  })

  return {
    currentBackground,
    loading,
    loadBackground,
    updateBackground,
  }
}
