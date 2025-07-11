// src/composables/useUserPreferences.js
import { ref, onMounted } from 'vue'
import backgroundPreferencesService from '@/lib/backgroundPreferencesService'

export function useUserPreferences() {
  const doubleClickBehavior = ref('select') // 'select' or 'open'
  const loading = ref(false)

  /**
   * Load user's double-click behavior preference
   */
  async function loadDoubleClickBehavior() {
    loading.value = true
    try {
      const behavior = await backgroundPreferencesService.getDoubleClickBehavior()
      doubleClickBehavior.value = behavior
    } catch (error) {
      console.error('Error loading double-click behavior:', error)
      doubleClickBehavior.value = 'select' // fallback
    } finally {
      loading.value = false
    }
  }

  /**
   * Save user's double-click behavior preference
   * @param {string} behavior - 'select' or 'open'
   */
  async function saveDoubleClickBehavior(behavior) {
    try {
      const success = await backgroundPreferencesService.saveDoubleClickBehavior(behavior)
      if (success) {
        doubleClickBehavior.value = behavior
      }
      return success
    } catch (error) {
      console.error('Error saving double-click behavior:', error)
      return false
    }
  }

  // Load preferences on mount
  onMounted(() => {
    loadDoubleClickBehavior()
  })

  return {
    doubleClickBehavior,
    loading,
    loadDoubleClickBehavior,
    saveDoubleClickBehavior
  }
}