<template>
  <div>
    <!-- Debug Info -->
    <v-card variant="outlined" class="mb-4 pa-2" color="warning">
      <div class="text-caption">
        <strong>Debug Info:</strong><br>
        localServerOptions.page: {{ localServerOptions.page }}<br>
        localServerOptions: {{ JSON.stringify(localServerOptions, null, 2) }}<br>
        totalItems: {{ totalItems }}<br>
        userItemsPerPage: {{ userItemsPerPage }}<br>
        userPreferencesStable: {{ userPreferencesStable }}<br>
        preferencesLoadCount: {{ preferencesLoadCount }}
      </div>
    </v-card>

    <!-- Delete Button - Shows when items are selected -->
    <BookmarkDeleteButton
      :selected-items="selectedItems"
      :use-store-selection="false"
      class="mb-4"
      @delete-completed="handleDeleteCompleted"
    />

    <!-- Page Navigation Indicator -->
    <v-fade-transition>
      <v-alert 
        v-if="numberBuffer"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-4 text-center"
        style="position: fixed; top: 80px; right: 20px; z-index: 1000; min-width: 200px;"
      >
        <div class="d-flex align-center justify-center">
          <v-icon icon="mdi-keyboard" class="mr-2" size="16" />
          <span>Going to page: <strong>{{ numberBuffer }}</strong></span>
          <v-progress-circular 
            indeterminate 
            size="16" 
            width="2" 
            class="ml-2"
          />
        </div>
      </v-alert>
    </v-fade-transition>

    <v-data-table-server
      ref="dataTableRef"
      :key="tableKey"
      :headers="BOOKMARK_TABLE_HEADERS"
      :items="displayBookmarks"
      :items-length="totalItems"
      :loading="loading"
      :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
      :items-per-page="userItemsPerPage"
      v-model:options="localServerOptions"
      @update:options="handleOptionsUpdate"
      class="elevation-1 bg-surface-darken position-relative"
      :style="{
        backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
      }"
      density="compact"
      show-current-page
      :mobile-breakpoint="600"
    >
      <!-- Select all checkbox in header -->
      <template #header.select="">
        <v-checkbox
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          @update:model-value="toggleSelectAll"
          hide-details
          density="compact"
        />
      </template>

      <!-- Custom row rendering -->
      <template #item="{ item, index }">
        <BookmarkTableRow
          v-if="item.type !== 'collapse'"
          :item="item"
          :index="index"
          :is-selected="selectedItems.includes(item.id)"
          :is-focused="focusedRowIndex === index"
          @toggle-selection="toggleItemSelection"
          @search-tag="handleSearchTag"
          @view-details="handleViewDetails"
          @edit="handleEdit"
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
          :pagination="{ 
            page: localServerOptions.page, 
            itemsPerPage: localServerOptions.itemsPerPage, 
            pageCount: Math.ceil(totalItems / localServerOptions.itemsPerPage),
            itemsLength: totalItems
          }" 
          :options="localServerOptions"
          :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
          @update:options="handleOptionsUpdate"
          show-current-page
        />
      </template>

      <template #no-data>
        <v-alert type="info" class="ma-4">
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
import { computed, toRef, watch, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useBookmarkData } from '@/composables/useBookmarkData'
import { useTableSelection } from '@/composables/useTableSelection'
import { useUserPreferences } from '@/composables/useUserPreferences'
import { useBookmarkTableKeyboard } from '@/composables/useBookmarkTableKeyboard'
import { useBookmarkTableDialogs } from '@/composables/useBookmarkTableDialogs'
import { useDomainCollapsing } from '@/composables/useDomainCollapsing'
import { useNumericPagination } from '@/composables/useNumericPagination'
import { ITEMS_PER_PAGE_OPTIONS, BOOKMARK_TABLE_HEADERS } from '@/lib/tableConstants'
import BookmarkTableRow from '@/components/BookmarkTableRow.vue'
import BookmarkTableCollapseIndicators from '@/components/BookmarkTableCollapseIndicators.vue'
import BookmarkDetailsDialog from '@/components/BookmarkDetailsDialog.vue'
import BookmarkEditDialog from '@/components/BookmarkEditDialog.vue'
import BookmarkDeleteButton from '@/components/BookmarkDeleteButton.vue'
import AppTips from '@/components/AppTips.vue'

const props = defineProps({
  dialogOpen: Boolean,
  selectedItems: Array,
  searchType: {
    type: String,
    default: 'all'
  },
  searchTerm: {
    type: String,
    default: ''
  }
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
  expandedDomains
} = useBookmarkData(appStore, reactiveSearchType, reactiveSearchTerm, userItemsPerPage)

// Create a local reactive copy of serverOptions that the table will use
const localServerOptions = ref({
  page: 1,
  itemsPerPage: userItemsPerPage.value,
  sortBy: [],
  groupBy: []
})

// Track if user preferences have stabilized
const userPreferencesStable = ref(false)
const preferencesLoadCount = ref(0)

// Better stability detection - wait for actual user preference loading
watch(userItemsPerPage, (newValue, oldValue) => {
  preferencesLoadCount.value++
  console.log(`📊 User preferences change #${preferencesLoadCount.value}: ${oldValue} → ${newValue}`)
  
  // Only mark as stable after the second change (first is default, second is real user pref)
  // Or if we get a non-default value that's not 15 (since 15 seems to be the default)
  if (preferencesLoadCount.value >= 2 || (newValue !== 15 && newValue !== undefined)) {
    // Wait a bit longer to ensure no more changes are coming
    setTimeout(() => {
      userPreferencesStable.value = true
      console.log(`📊 User preferences marked as stable after ${preferencesLoadCount.value} changes with final value: ${newValue}`)
    }, 200)
  }
}, { immediate: true })

// Alternative approach: Also watch the loading state from useUserPreferences if available
watch(() => {
  // Check if the composable has a loading state we can watch
  const { loading } = useUserPreferences()
  return loading?.value
}, (isLoading) => {
  if (isLoading === false && preferencesLoadCount.value > 0) {
    // Loading finished, mark as stable
    setTimeout(() => {
      userPreferencesStable.value = true
      console.log('📊 User preferences marked as stable (loading finished)')
    }, 100)
  }
}, { immediate: true })

// Prevent infinite loops with a flag
const isUpdatingFromComposable = ref(false)
const isUpdatingFromTable = ref(false)

// Keep localServerOptions in sync with serverOptions from the composable
watch(serverOptions, (newOptions) => {
  if (!isUpdatingFromTable.value) {
    console.log('🔄 Syncing localServerOptions with serverOptions:', JSON.stringify(newOptions, null, 2))
    isUpdatingFromComposable.value = true
    localServerOptions.value = { ...newOptions }
    nextTick(() => {
      isUpdatingFromComposable.value = false
    })
  }
}, { deep: true, immediate: true })

// Watch localServerOptions for changes and update the data composable
watch(localServerOptions, (newOptions) => {
  if (!isUpdatingFromComposable.value) {
    console.log('📊 localServerOptions changed, updating composable:', JSON.stringify(newOptions, null, 2))
    isUpdatingFromTable.value = true
    updateServerOptions(newOptions)
    nextTick(() => {
      isUpdatingFromTable.value = false
    })
  }
}, { deep: true })

// Handle table options updates
function handleOptionsUpdate(newOptions) {
  console.log('📊 Table options update:', newOptions)
  localServerOptions.value = { ...newOptions }
}

// Selection logic
const {
  isAllSelected,
  isIndeterminate,
  toggleSelectAll,
  toggleItemSelection
} = useTableSelection(bookmarks, toRef(props, 'selectedItems'), emit)

// Domain collapsing functionality
const {
  displayBookmarks,
  collapsedDomainsWithCounts,
  expandingDomain,
  handleExpandDomain: handleDomainExpand
} = useDomainCollapsing(
  bookmarks,
  domainCollapsing,
  expandedDomains,
  expandDomain,
  loadBookmarks,
  serverOptions
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
  handleBookmarkUpdated
} = useBookmarkTableDialogs(emit, loadBookmarks)

// Keyboard navigation
const { focusedRowIndex } = useBookmarkTableKeyboard(
  displayBookmarks,
  toRef(props, 'selectedItems'),
  toggleItemSelection,
  dialogsOpen,
  router,
  handleEdit,
  handleViewDetails
)

// Numeric pagination - now updates localServerOptions directly
const { numberBuffer } = useNumericPagination(
  (pageNumber) => {
    // Don't allow keyboard navigation until user preferences are stable
    if (!userPreferencesStable.value) {
      console.log('📊 Keyboard navigation blocked - user preferences not stable yet')
      return
    }
    
    console.log(`📊 Keyboard navigation: Going to page ${pageNumber}`)
    console.log(`📊 Current localServerOptions.page: ${localServerOptions.value.page}`)
    console.log(`📊 Current localServerOptions:`, JSON.stringify(localServerOptions.value, null, 2))
    
    // Update the local server options directly
    const newOptions = {
      ...localServerOptions.value,
      page: pageNumber
    }
    
    console.log(`📊 New options to apply:`, JSON.stringify(newOptions, null, 2))
    
    // Apply the update
    localServerOptions.value = newOptions
    
    console.log(`📊 Updated localServerOptions.page to: ${localServerOptions.value.page}`)
    
    // Try to force the table to recognize the change
    nextTick(() => {
      console.log('📊 NextTick: Trying to force table update')
      console.log('📊 Current localServerOptions after nextTick:', JSON.stringify(localServerOptions.value, null, 2))
      
      // Method 1: Try to trigger the table's update:options event manually
      if (dataTableRef.value) {
        console.log('📊 Found table ref, trying to update manually')
        // This might trigger the table's internal update mechanism
        handleOptionsUpdate(localServerOptions.value)
      }
      
      // Method 2: Force a complete re-sync by triggering the watchers
      nextTick(() => {
        console.log('📊 Second NextTick: Forcing complete re-sync')
        // Create a deep clone to ensure Vue detects the change
        const clonedOptions = JSON.parse(JSON.stringify(localServerOptions.value))
        
        // Temporarily disable the watcher to prevent loops
        isUpdatingFromComposable.value = true
        localServerOptions.value = clonedOptions
        
        nextTick(() => {
          isUpdatingFromComposable.value = false
          console.log('📊 Re-sync complete')
        })
      })
    })
  },
  () => {
    const totalPages = Math.ceil(totalItems.value / localServerOptions.value.itemsPerPage)
    console.log(`📊 Total pages: ${totalPages}`)
    return totalPages
  },
  () => {
    const hasOpenDialogs = Object.values(dialogsOpen.value).some(isOpen => isOpen)
    return hasOpenDialogs
  }
)

// Watch for prop changes and reload data
watch([reactiveSearchType, reactiveSearchTerm], () => {
  resetPagination()
  loadBookmarks()
}, { immediate: false })

// Watch for changes in user's items per page preference
watch(userItemsPerPage, (newItemsPerPage) => {
  localServerOptions.value = {
    ...localServerOptions.value,
    itemsPerPage: newItemsPerPage,
    page: 1
  }
}, { immediate: false })

// Event handlers
function handleSearchTag(tag) {
  router.push(`/tag/${encodeURIComponent(tag)}`)
}

function handleExpandDomain(domain) {
  handleDomainExpand(domain)
}

function handleDeleteCompleted(deletedIds) {
  emit('update:selected-items', [])
  loadBookmarks()
  emit('delete-selected', deletedIds)
}

function getNoDataMessage() {
  if (props.searchType === 'search') {
    return `No bookmarks found matching "${props.searchTerm}"`
  }
  if (props.searchType === 'tag') {
    return `No bookmarks found with tag "${props.searchTerm}"`
  }
  return 'No bookmarks found.'
}
</script>