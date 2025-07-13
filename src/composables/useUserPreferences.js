// src/composables/useUserPreferences.js
import { ref, onMounted, watch } from 'vue'
import supabase from '@/lib/supabaseClient'

// Global reactive state - shared across all component instances
const globalDoubleClickBehavior = ref('select')
const globalDomainCollapsing = ref(true)
const globalItemsPerPage = ref(15) // Default to 15 items per page
const globalLoading = ref(false)
let isInitialized = false

export function useUserPreferences() {
  /**
   * Get all user preferences
   * @returns {Promise<Object>} User preferences object
   */
  async function getAllPreferences() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        return { 
          doubleClickBehavior: 'select', 
          domainCollapsing: true,
          itemsPerPage: 15
        }
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', session.user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user preferences:', error)
        return { 
          doubleClickBehavior: 'select', 
          domainCollapsing: true,
          itemsPerPage: 15
        }
      }

      return {
        doubleClickBehavior: data?.preferences?.doubleClickBehavior || 'select',
        domainCollapsing: data?.preferences?.domainCollapsing ?? true,
        itemsPerPage: data?.preferences?.itemsPerPage || 15
      }
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return { 
        doubleClickBehavior: 'select', 
        domainCollapsing: true,
        itemsPerPage: 15
      }
    }
  }

  /**
   * Save a specific preference
   * @param {string} key - Preference key
   * @param {any} value - Preference value
   * @returns {Promise<boolean>} Success status
   */
  async function savePreference(key, value) {
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
        [key]: value
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
        console.error(`Error saving ${key}:`, result.error)
        return false
      }

      // Update global state - this will trigger reactivity in all components
      if (key === 'doubleClickBehavior') {
        globalDoubleClickBehavior.value = value
      } else if (key === 'domainCollapsing') {
        globalDomainCollapsing.value = value
      } else if (key === 'itemsPerPage') {
        globalItemsPerPage.value = value
      }
      
      return true
    } catch (error) {
      console.error(`Error saving ${key}:`, error)
      return false
    }
  }

  /**
   * Save user's double-click behavior preference
   * @param {string} behavior - 'select' or 'open'
   * @returns {Promise<boolean>} Success status
   */
  async function saveDoubleClickBehavior(behavior) {
    return savePreference('doubleClickBehavior', behavior)
  }

  /**
   * Save user's domain collapsing preference
   * @param {boolean} enabled - true to enable collapsing, false to disable
   * @returns {Promise<boolean>} Success status
   */
  async function saveDomainCollapsing(enabled) {
    return savePreference('domainCollapsing', enabled)
  }

  /**
   * Save user's items per page preference
   * @param {number} itemsPerPage - Number of items per page (must be from ITEMS_PER_PAGE_OPTIONS, excluding -1)
   * @returns {Promise<boolean>} Success status
   */
  async function saveItemsPerPage(itemsPerPage) {
    // Validate that the value is allowed (not -1)
    const allowedValues = [15, 30, 45, 60]
    if (!allowedValues.includes(itemsPerPage)) {
      console.error('Invalid items per page value:', itemsPerPage)
      return false
    }
    
    return savePreference('itemsPerPage', itemsPerPage)
  }

  /**
   * Load all user preferences
   */
  async function loadAllPreferences() {
    globalLoading.value = true
    try {
      const preferences = await getAllPreferences()
      globalDoubleClickBehavior.value = preferences.doubleClickBehavior
      globalDomainCollapsing.value = preferences.domainCollapsing
      globalItemsPerPage.value = preferences.itemsPerPage
    } catch (error) {
      console.error('Error loading preferences:', error)
      globalDoubleClickBehavior.value = 'select'
      globalDomainCollapsing.value = true
      globalItemsPerPage.value = 15
    } finally {
      globalLoading.value = false
    }
  }

  // Initialize only once globally
  if (!isInitialized) {
    onMounted(() => {
      loadAllPreferences()
    })
    isInitialized = true
  }

  return {
    doubleClickBehavior: globalDoubleClickBehavior,
    domainCollapsing: globalDomainCollapsing,
    itemsPerPage: globalItemsPerPage,
    loading: globalLoading,
    loadAllPreferences,
    saveDoubleClickBehavior,
    saveDomainCollapsing,
    saveItemsPerPage
  }
}