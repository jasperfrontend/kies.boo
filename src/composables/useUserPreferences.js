// src/composables/useUserPreferences.js
import { ref, onMounted, watch } from 'vue'
import supabase from '@/lib/supabaseClient'

// Global reactive state - shared across all component instances
const globalDoubleClickBehavior = ref('select')
const globalLoading = ref(false)
let isInitialized = false

export function useUserPreferences() {
  /**
   * Get user's double-click behavior preference
   * @returns {Promise<string>} 'select' or 'open' (defaults to 'select')
   */
  async function getDoubleClickBehavior() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        return 'select'
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user preferences:', error)
        return 'select'
      }

      return data?.preferences?.doubleClickBehavior || 'select'
    } catch (error) {
      console.error('Error getting double-click behavior:', error)
      return 'select' // Default fallback
    }
  }

  /**
   * Save user's double-click behavior preference
   * @param {string} behavior - 'select' or 'open'
   * @returns {Promise<boolean>} Success status
   */
  async function saveDoubleClickBehavior(behavior) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User must be authenticated')
      }

      // First, try to get existing preferences
      const { data: existingData, error: fetchError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', session.user.id)
        .single()

      const currentPreferences = existingData?.preferences || {}
      const updatedPreferences = {
        ...currentPreferences,
        doubleClickBehavior: behavior
      }

      let result
      if (fetchError && fetchError.code === 'PGRST116') {
        // No existing preferences, create new record
        result = await supabase
          .from('user_preferences')
          .insert({
            user_id: session.user.id,
            preferences: updatedPreferences
          })
      } else {
        // Update existing record
        result = await supabase
          .from('user_preferences')
          .update({ preferences: updatedPreferences })
          .eq('user_id', session.user.id)
      }

      if (result.error) {
        console.error('Error saving double-click behavior:', result.error)
        return false
      }

      // Update global state - this will trigger reactivity in all components
      globalDoubleClickBehavior.value = behavior
      return true
    } catch (error) {
      console.error('Error saving double-click behavior:', error)
      return false
    }
  }

  /**
   * Load user's double-click behavior preference
   */
  async function loadDoubleClickBehavior() {
    globalLoading.value = true
    try {
      const behavior = await getDoubleClickBehavior()
      globalDoubleClickBehavior.value = behavior
    } catch (error) {
      console.error('Error loading double-click behavior:', error)
      globalDoubleClickBehavior.value = 'select' // fallback
    } finally {
      globalLoading.value = false
    }
  }

  // Initialize only once globally
  if (!isInitialized) {
    onMounted(() => {
      loadDoubleClickBehavior()
    })
    isInitialized = true
  }

  return {
    doubleClickBehavior: globalDoubleClickBehavior,
    loading: globalLoading,
    loadDoubleClickBehavior,
    saveDoubleClickBehavior
  }
}