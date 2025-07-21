// src/composables/useBookmarkTableState.js
import { nextTick, ref, watch } from 'vue'

export function useBookmarkTableState(serverOptions, userItemsPerPage, updateServerOptions) {
  // Create a local reactive copy of serverOptions that the table will use
  const localServerOptions = ref({
    page: 1,
    itemsPerPage: userItemsPerPage.value,
    sortBy: [],
    groupBy: [],
  })

  // Track if user preferences have stabilized
  const userPreferencesStable = ref(false)
  const preferencesLoadCount = ref(0)

  // Better stability detection - wait for actual user preference loading
  watch(userItemsPerPage, newValue => {
    preferencesLoadCount.value++

    // Only mark as stable after the second change (first is default, second is real user pref)
    // Or if we get a non-default value that's not 15 (since 15 seems to be the default)
    if (preferencesLoadCount.value >= 2 || (newValue !== 15 && newValue !== undefined)) {
      // Wait a bit longer to ensure no more changes are coming
      setTimeout(() => {
        userPreferencesStable.value = true
      }, 200)
    }
  }, { immediate: true })

  // Prevent infinite loops with flags
  const isUpdatingFromComposable = ref(false)
  const isUpdatingFromTable = ref(false)

  // Keep localServerOptions in sync with serverOptions from the composable
  watch(serverOptions, newOptions => {
    if (!isUpdatingFromTable.value) {
      isUpdatingFromComposable.value = true
      localServerOptions.value = { ...newOptions }
      nextTick(() => {
        isUpdatingFromComposable.value = false
      })
    }
  }, { deep: true, immediate: true })

  // Watch localServerOptions for changes and update the data composable
  watch(localServerOptions, newOptions => {
    if (!isUpdatingFromComposable.value) {
      isUpdatingFromTable.value = true
      updateServerOptions(newOptions)
      nextTick(() => {
        isUpdatingFromTable.value = false
      })
    }
  }, { deep: true })

  return {
    localServerOptions,
    userPreferencesStable,
  }
}