// src/composables/useSavedSearches.js
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

export function useSavedSearches () {
  const route = useRoute()
  const appStore = useAppStore()
  const saving = ref(false)
  const currentPath = ref('')

  // Computed properties
  const isCurrentPathSaved = computed(() => {
    return appStore.isPathSaved(currentPath.value)
  })

  const buttonText = computed(() => {
    return isCurrentPathSaved.value
      ? `Path: ${currentPath.value} saved`
      : `Save path: ${currentPath.value}`
  })

  const buttonDisabled = computed(() => {
    return isCurrentPathSaved.value || saving.value
  })

  // Watch for route changes
  watch(() => route.path, newPath => {
    currentPath.value = newPath
  }, { immediate: true })

  // Save current search
  async function saveCurrentSearch () {
    if (saving.value || isCurrentPathSaved.value) {
      return
    }

    saving.value = true

    try {
      const result = await appStore.addSavedSearch(currentPath.value)

      return result.success
        ? {
            success: true,
            message: `Saved: ${result.data.url}`,
          }
        : {
            success: false,
            message: result.error || 'Failed to save search',
          }
    } catch (error) {
      console.error('Error saving search:', error)
      return {
        success: false,
        message: 'Failed to save search',
      }
    } finally {
      saving.value = false
    }
  }

  // Remove current search
  async function removeCurrentSearch () {
    if (saving.value || !isCurrentPathSaved.value) {
      return
    }

    saving.value = true

    try {
      const result = await appStore.removeSavedSearch(currentPath.value)

      return result.success
        ? {
            success: true,
            message: `Removed: ${currentPath.value}`,
          }
        : {
            success: false,
            message: result.error || 'Failed to remove search',
          }
    } catch (error) {
      console.error('Error removing search:', error)
      return {
        success: false,
        message: 'Failed to remove search',
      }
    } finally {
      saving.value = false
    }
  }

  // Initialize
  onMounted(async () => {
    await appStore.ensureSavedSearchesLoaded()
  })

  return {
    currentPath: computed(() => currentPath.value),
    isCurrentPathSaved,
    buttonText,
    buttonDisabled,
    saving: computed(() => saving.value),
    saveCurrentSearch,
    removeCurrentSearch,
    savedSearches: computed(() => appStore.savedSearches),
  }
}
