<template>
  <div>

    <!-- Delete Button - Shows when items are selected -->
    <BookmarkDeleteButton
      class="mb-4"
      :selected-items="selectedItems"
      :use-store-selection="false"
      @delete-completed="handleDeleteCompleted"
    />

    <!-- Page Navigation Indicator -->
    <PageNavigationIndicator 
      :number-buffer="numberBuffer" 
      :error-message="errorMessage"
    />

    <v-data-table-server
      :key="tableKey"
      ref="dataTableRef"
      v-model:options="localServerOptions"
      class="elevation-1 bg-surface-darken position-relative"
      density="compact"
      :headers="BOOKMARK_TABLE_HEADERS"
      :items="displayBookmarks"
      :items-length="totalItems"
      :loading="loading"
      :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
      :items-per-page="localServerOptions.itemsPerPage"
      :page="localServerOptions.page"
      @update:options="handleOptionsUpdate"
      :style="{
        backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
      }"
    >
      <!-- Select all checkbox in header -->
      <template #header.select="">
        <v-checkbox
          density="compact"
          hide-details
          :indeterminate="isIndeterminate"
          :model-value="isAllSelected"
          @update:model-value="toggleSelectAll"
        />
      </template>

      <!-- Custom row rendering -->
      <template #item="{ item, index }">
        <BookmarkTableRow
          v-if="item.type !== 'collapse'"
          :index="index"
          :is-focused="focusedRowIndex === index"
          :is-selected="selectedItems.includes(item.id)"
          :item="item"
          @edit="handleEdit"
          @search-tag="handleSearchTag"
          @toggle-selection="toggleItemSelection"
          @view-details="handleViewDetails"
        />
      </template>

      <!-- Collapsed domains indicators -->
      <template #top>
        <BookmarkTableCollapseIndicators
          :collapsed-domains="collapsedDomainsWithCounts"
          :expanding-domain="expandingDomain"
          @expand-domain="handleExpandDomain"
        />

        <v-data-table-footer
          :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
          :options="localServerOptions"
          :pagination="{
            page: localServerOptions.page,
            itemsPerPage: localServerOptions.itemsPerPage,
            pageCount: Math.ceil(totalItems / localServerOptions.itemsPerPage),
            itemsLength: totalItems
          }"
          show-current-page
          @update:options="handleOptionsUpdate"
        />
      </template>

      <template #no-data>
        <v-alert class="ma-4" type="info">
          {{ getNoDataMessage() }}
        </v-alert>
      </template>
    </v-data-table-server>

    <!-- Dialogs -->
    <BookmarkDetailsDialog
      v-model="detailsDialog"
      :bookmark="detailsBookmark"
    />

    <BookmarkEditDialog
      v-model="editDialog"
      :bookmark="editBookmark"
      @bookmark-updated="handleBookmarkUpdated"
    />

    <AppTips />
  </div>
</template>

<script setup>
  import { computed, nextTick, ref, toRef, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import AppTips from '@/components/AppTips.vue'
  import BookmarkDeleteButton from '@/components/BookmarkDeleteButton.vue'
  import BookmarkDetailsDialog from '@/components/BookmarkDetailsDialog.vue'
  import BookmarkEditDialog from '@/components/BookmarkEditDialog.vue'
  import BookmarkTableCollapseIndicators from '@/components/BookmarkTableCollapseIndicators.vue'
  import BookmarkTableRow from '@/components/BookmarkTableRow.vue'
  import { useBookmarkData } from '@/composables/useBookmarkData'
  import { useBookmarkTableDialogs } from '@/composables/useBookmarkTableDialogs'
  import { useBookmarkTableKeyboard } from '@/composables/useBookmarkTableKeyboard'
  import { useDomainCollapsing } from '@/composables/useDomainCollapsing'
  import { useNumericPagination } from '@/composables/useNumericPagination'
  import { useTableSelection } from '@/composables/useTableSelection'
  import { useUserPreferences } from '@/composables/useUserPreferences'
  import PageNavigationIndicator from '@/components/PageNavigationIndicator.vue'
  import { BOOKMARK_TABLE_HEADERS, ITEMS_PER_PAGE_OPTIONS } from '@/lib/tableConstants'
  import { useAppStore } from '@/stores/app'

  const props = defineProps({
    dialogOpen: Boolean,
    selectedItems: Array,
    searchType: {
      type: String,
      default: 'all',
    },
    searchTerm: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['update:selected-items', 'bookmark-updated', 'delete-selected'])

  const appStore = useAppStore()
  const router = useRouter()
  const { domainCollapsing, itemsPerPage: userItemsPerPage } = useUserPreferences()

  // Create reactive refs from props
  const reactiveSearchType = toRef(props, 'searchType')
  const reactiveSearchTerm = toRef(props, 'searchTerm')

  // Table key for forcing re-renders
  const tableKey = computed(() => `${props.searchType}-${props.searchTerm}-table`)

  // Create a table ref to access the component directly
  const dataTableRef = ref(null)

  // Data management
  const {
    loading,
    bookmarks,
    totalItems,
    serverOptions,
    loadBookmarks,
    updateServerOptions,
    resetPagination,
    expandDomain,
    expandedDomains,
  } = useBookmarkData(appStore, reactiveSearchType, reactiveSearchTerm, userItemsPerPage)

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
  watch(userItemsPerPage, (newValue, oldValue) => {
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

  // Alternative approach: Also watch the loading state from useUserPreferences if available
  watch(() => {
    // Check if the composable has a loading state we can watch
    const { loading } = useUserPreferences()
    return loading?.value
  }, isLoading => {
    if (isLoading === false && preferencesLoadCount.value > 0) {
      // Loading finished, mark as stable
      setTimeout(() => {
        userPreferencesStable.value = true
      }, 100)
    }
  }, { immediate: true })

  // Prevent infinite loops with a flag
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

  // Handle table options updates
  function handleOptionsUpdate (newOptions) {
    localServerOptions.value = { ...newOptions }
  }

  // Selection logic
  const {
    isAllSelected,
    isIndeterminate,
    toggleSelectAll,
    toggleItemSelection,
  } = useTableSelection(bookmarks, toRef(props, 'selectedItems'), emit)

  // Domain collapsing functionality
  const {
    displayBookmarks,
    collapsedDomainsWithCounts,
    expandingDomain,
    handleExpandDomain: handleDomainExpand,
  } = useDomainCollapsing(
    bookmarks,
    domainCollapsing,
    expandedDomains,
    expandDomain,
    loadBookmarks,
    serverOptions,
  )

  // Dialog management
  const {
    detailsDialog,
    editDialog,
    detailsBookmark,
    editBookmark,
    dialogsOpen,
    handleViewDetails,
    handleEdit,
    handleBookmarkUpdated,
  } = useBookmarkTableDialogs(emit, loadBookmarks)

  // Keyboard navigation
  const { focusedRowIndex } = useBookmarkTableKeyboard(
    displayBookmarks,
    toRef(props, 'selectedItems'),
    toggleItemSelection,
    dialogsOpen,
    router,
    handleEdit,
    handleViewDetails,
  )

  // Numeric pagination - now updates localServerOptions directly
  const { numberBuffer, errorMessage } = useNumericPagination(
    pageNumber => {
      // Don't allow keyboard navigation until user preferences are stable
      if (!userPreferencesStable.value) {
        return
      }

      // Update the local server options directly
      const newOptions = {
        ...localServerOptions.value,
        page: pageNumber,
      }

      // Apply the update
      localServerOptions.value = newOptions

      // Try to force the table to recognize the change
      nextTick(() => {
        // Method 1: Try to trigger the table's update:options event manually
        if (dataTableRef.value) {
          // This might trigger the table's internal update mechanism
          handleOptionsUpdate(localServerOptions.value)
        }

        // Method 2: Force a complete re-sync by triggering the watchers
        nextTick(() => {
          // Create a deep clone to ensure Vue detects the change
          const clonedOptions = JSON.parse(JSON.stringify(localServerOptions.value))

          // Temporarily disable the watcher to prevent loops
          isUpdatingFromComposable.value = true
          localServerOptions.value = clonedOptions

          nextTick(() => {
            isUpdatingFromComposable.value = false
          })
        })
      })
    },
    () => {
      const totalPages = Math.ceil(totalItems.value / localServerOptions.value.itemsPerPage)
      return totalPages
    },
    () => {
      const hasOpenDialogs = Object.values(dialogsOpen.value).some(Boolean)
      return hasOpenDialogs
    },
  )

  // Watch for prop changes and reload data
  watch([reactiveSearchType, reactiveSearchTerm], () => {
    resetPagination()
    loadBookmarks()
  }, { immediate: false })

  // Watch for changes in user's items per page preference
  watch(userItemsPerPage, newItemsPerPage => {
    localServerOptions.value = {
      ...localServerOptions.value,
      itemsPerPage: newItemsPerPage,
      page: 1,
    }
  }, { immediate: false })

  // Event handlers
  function handleSearchTag (tag) {
    router.push(`/tag/${encodeURIComponent(tag)}`)
  }

  function handleExpandDomain (domain) {
    handleDomainExpand(domain)
  }

  function handleDeleteCompleted (deletedIds) {
    emit('update:selected-items', [])
    loadBookmarks()
    emit('delete-selected', deletedIds)
  }

  function getNoDataMessage () {
    if (props.searchType === 'search') {
      return `No bookmarks found matching "${props.searchTerm}"`
    }
    if (props.searchType === 'tag') {
      return `No bookmarks found with tag "${props.searchTerm}"`
    }
    return 'No bookmarks found.'
  }
</script>
