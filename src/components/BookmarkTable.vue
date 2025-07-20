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
      :error-message="errorMessage"
      :number-buffer="numberBuffer"
    />

    <!-- View Toggle for Desktop (positioned above the content) -->
    <div v-if="!mobile" class="d-flex justify-end mb-4">
      <v-btn-toggle
        v-model="currentViewMode"
        class="view-toggle"
        density="compact"
        divided
        variant="outlined"
        @update:model-value="handleViewModeChange"
      >
        <v-btn size="small" value="table">
          <v-icon class="mr-1" icon="mdi-table" size="16" />
          Table
        </v-btn>
        <v-btn size="small" value="card">
          <v-icon class="mr-1" icon="mdi-view-grid" size="16" />
          Cards
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- CARD VIEW: Mobile (always) or Desktop (when selected) -->
    <div
      v-if="mobile || currentViewMode === 'card'"
      v-touch="{
        left: () => swipeToNextPage(),
        right: () => swipeToPrevPage()
      }"
      class="bookmark-card-view"
    >
      <!-- Card Header with Select All -->
      <v-card
        class="mb-4 surface-card"
        :style="{
          backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
        }"
        variant="outlined"
      >
        <v-card-text class="pa-3">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-checkbox
                density="compact"
                hide-details
                :indeterminate="isIndeterminate"
                :label="selectedItems.length > 0 ? selectedItems.length + ' selected' : ' Select all'"
                :model-value="isAllSelected"
                @update:model-value="toggleSelectAll"
              />
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ displayBookmarks.length }} of {{ totalItems }} bookmarks
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Bookmark Cards -->
      <div v-if="!loading && displayBookmarks.length > 0" class="cards-container">
        <v-card
          v-for="(item) in displayBookmarks"
          :key="item.id"
          class="bookmark-card surface-card mb-2 mb-md-0"
          :class="{ 'selected': selectedItems.includes(item.id) }"
          :style="{
            backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
          }"
          variant="outlined"
          @click="openBookmark(item.url)"
        >
          <v-card-text class="pa-3">
            <!-- Header Row: Favicon, Title, Checkbox -->
            <div class="d-flex align-start mb-2">

              <v-checkbox
                density="compact"
                hide-details
                :model-value="selectedItems.includes(item.id)"
                width="40"
                @click.stop="toggleItemSelection(item.id)"
                @update:model-value="toggleItemSelection(item.id)"
              />

              <div class="flex-grow-1 min-width-0">
                <div class="bookmark-title text-caption font-weight-medium mb-1">
                  {{ item.title }}
                </div>
                <div class="bookmark-url text-caption text-medium-emphasis mb-1">
                  {{ displayUrl(item.url) }}
                </div>
              </div>

              <v-btn
                icon
                size="small"
                :title="`Actions for ${item.title}`"
                variant="text"
              >
                <v-icon icon="mdi-dots-vertical" size="16" />
              </v-btn>

              <v-menu activator="parent" location="bottom start" offset="8">

                <v-list density="compact" max-width="100%" min-width="160">
                  <v-list-item
                    :prepend-avatar="item.favicon"
                    @click="openBookmark(item.url)"
                  >
                    <v-list-item-title class="ml-2">
                      Open Link
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    prepend-icon="mdi-eye"
                    title="View Details"
                    @click="handleViewDetails(item)"
                  />
                  <v-list-item
                    prepend-icon="mdi-note-edit"
                    title="Edit Bookmark"
                    @click="handleEdit(item)"
                  />
                  <v-divider />
                  <v-list-item
                    class="text-error"
                    prepend-icon="mdi-delete"
                    title="Delete"
                    @click="handleSingleDelete(item)"
                  />
                </v-list>
              </v-menu>
            </div>

            <!-- Tags Row -->
            <div class="d-flex justify-space-between align-center">
              <div v-if="item.tags && item.tags.length > 0" class="mb-0">
                <v-chip
                  v-for="tag in item.tags.slice(0, 3)"
                  :key="tag"
                  class="mr-1 mb-1"
                  color="text-surface-variant"
                  density="compact"
                  size="x-small"
                  @click.stop="handleSearchTag(tag)"
                >
                  {{ tag }}
                </v-chip>
                <v-chip
                  v-if="item.tags.length > 3"
                  class="mr-1 mb-1"
                  density="compact"
                  size="x-small"
                  variant="outlined"
                >
                  +{{ item.tags.length - 3 }}
                </v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatDate(item.created_at) }}
              </div>
            </div>
            <!-- Action Row -->
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <!-- Actions Menu -->

              </div>
            </div>
          </v-card-text>

          <!-- Color Accent Bar (if bookmark has vibrant color) -->
          <div
            v-if="item.metadata?.vibrant_color"
            class="color-accent-bar"
            :style="{
              backgroundColor: `rgb(${item.metadata.vibrant_color.join(',')})`,
              opacity: selectedItems.includes(item.id) ? 1 : 0.5
            }"
          />
        </v-card>
      </div>

      <!-- Card View Loading State -->
      <div v-else-if="loading" class="text-center py-8">
        <v-progress-circular color="primary" indeterminate size="64" />
        <div class="mt-4 text-body-2">Loading bookmarks...</div>
      </div>

      <!-- Card View No Data -->
      <div v-else class="text-center py-8">
        <v-icon class="mb-3" color="grey-darken-1" icon="mdi-bookmark-outline" size="64" />
        <div class="text-h6 text-grey-darken-1 mb-2">{{ getNoDataMessage() }}</div>
      </div>

      <!-- Card View Pagination -->
      <v-card
        v-if="Math.ceil(totalItems / localServerOptions.itemsPerPage) > 1"
        class="mt-4 surface-card"
        :style="{
          backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
        }"
        variant="outlined"
      >
        <v-card-text class="pa-3">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="text-body-2">
              Page {{ localServerOptions.page }} of {{ Math.ceil(totalItems / localServerOptions.itemsPerPage) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ totalItems }} total items
            </div>
          </div>

          <div class="d-flex align-center justify-center">
            <v-btn
              :disabled="localServerOptions.page <= 1"
              icon="mdi-chevron-left"
              size="small"
              variant="text"
              @click="changePage(localServerOptions.page - 1)"
            />

            <div class="mx-4 text-body-2">
              {{ localServerOptions.page }}
            </div>

            <v-btn
              :disabled="localServerOptions.page >= Math.ceil(totalItems / localServerOptions.itemsPerPage)"
              icon="mdi-chevron-right"
              size="small"
              variant="text"
              @click="changePage(localServerOptions.page + 1)"
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- Domain Collapse Indicators (Card View) -->
      <BookmarkTableCollapseIndicators
        v-if="collapsedDomainsWithCounts.length > 0"
        class="mt-4"
        :collapsed-domains="collapsedDomainsWithCounts"
        :expanding-domain="expandingDomain"
        @expand-domain="handleExpandDomain"
      />

      <!-- Swipe Feedback (Card View) -->
      <v-snackbar
        v-model="swipeFeedback"
        color="info"
        location="bottom"
        :timeout="1000"
      >
        <div class="d-flex align-center">
          <v-icon class="mr-2" icon="mdi-gesture-swipe-horizontal" />
          {{ swipeFeedback }}
        </div>
      </v-snackbar>
    </div>

    <!-- TABLE VIEW: Desktop only when selected -->
    <v-data-table-server
      v-else-if="!mobile && currentViewMode === 'table'"
      :key="tableKey"
      ref="dataTableRef"
      v-model:options="localServerOptions"
      class="elevation-1 bg-surface-darken position-relative"
      density="compact"
      :headers="BOOKMARK_TABLE_HEADERS"
      :items="displayBookmarks"
      :items-length="totalItems"
      :items-per-page="localServerOptions.itemsPerPage"
      :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
      :loading="loading"
      :page="localServerOptions.page"
      :style="{
        backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
      }"
      @update:options="handleOptionsUpdate"
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
          @focus-changed="handleRowFocusChanged"
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

    <!-- Dialogs (Shared between mobile and desktop) -->
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
  import { computed, nextTick, onMounted, onUnmounted, ref, toRef, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import AppTips from '@/components/AppTips.vue'
  import BookmarkDeleteButton from '@/components/BookmarkDeleteButton.vue'
  import BookmarkDetailsDialog from '@/components/BookmarkDetailsDialog.vue'
  import BookmarkEditDialog from '@/components/BookmarkEditDialog.vue'
  import BookmarkTableCollapseIndicators from '@/components/BookmarkTableCollapseIndicators.vue'
  import BookmarkTableRow from '@/components/BookmarkTableRow.vue'
  import PageNavigationIndicator from '@/components/PageNavigationIndicator.vue'
  import { useBookmarkData } from '@/composables/useBookmarkData'
  import { useBookmarkTableDialogs } from '@/composables/useBookmarkTableDialogs'
  import { useBookmarkTableKeyboard } from '@/composables/useBookmarkTableKeyboard'
  import { useDomainCollapsing } from '@/composables/useDomainCollapsing'
  import { useNumericPagination } from '@/composables/useNumericPagination'
  import { useTableSelection } from '@/composables/useTableSelection'
  import { useUserPreferences } from '@/composables/useUserPreferences'
  import { BOOKMARK_TABLE_HEADERS, ITEMS_PER_PAGE_OPTIONS } from '@/lib/tableConstants'
  import { useAppStore } from '@/stores/app'
  import { useViewModeStore } from '@/stores/viewMode'

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
  const { mobile } = useDisplay()
  const { domainCollapsing, itemsPerPage: userItemsPerPage } = useUserPreferences()
  const viewModeStore = useViewModeStore()

  // View mode state - mobile always uses card, desktop can choose
  const currentViewMode = computed(() => viewModeStore.mode)

  // Handle view mode changes (desktop only)
  function handleViewModeChange (newMode) {
    if (!mobile.value) {
      viewModeStore.setMode(newMode)
    }
  }

  // Initialize view mode from storage on mount
  onMounted(() => {
    if (mobile.value) {
      viewModeStore.setMode('card')
    } else {
      viewModeStore.initialize()
    }
  })

  // Watch for mobile changes and force card view
  watch(() => mobile.value, isMobile => {
    if (isMobile) {
      viewModeStore.setMode('card')
    }
  })

  // Listen for view mode change events from command palette
  function handleViewModeCommand (event) {
    const { mode } = event.detail
    if (!mobile.value && ['table', 'card'].includes(mode)) {
      viewModeStore.setMode(mode)
    }
  }

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

  // Keyboard navigation - only for desktop table view
  const {
    focusedRowIndex,
    restoreFocus,
    clearRememberedFocus,
  } = useBookmarkTableKeyboard(
    displayBookmarks,
    toRef(props, 'selectedItems'),
    toggleItemSelection,
    dialogsOpen,
    router,
    handleEdit,
    handleViewDetails,
  )

  // Watch for dialog state changes to restore focus when dialogs close (table view only)
  watch(dialogsOpen, (newDialogsOpen, oldDialogsOpen) => {
    if (mobile.value || currentViewMode.value !== 'table') return // Skip on mobile or card view

    // Check if any dialog just closed (was true, now false)
    const dialogJustClosed = Object.keys(newDialogsOpen).some(key =>
      oldDialogsOpen?.[key] === true && newDialogsOpen[key] === false,
    )

    if (dialogJustClosed) {
      // Dialog closed, restore focus after a short delay to ensure DOM is ready
      setTimeout(() => {
        restoreFocus()
      }, 150)
    }
  }, { deep: true })

  // Watch for edit/details dialogs specifically for additional safety (table view only)
  watch([() => editDialog.value, () => detailsDialog.value], ([newEdit, newDetails], [oldEdit, oldDetails]) => {
    if (mobile.value || currentViewMode.value !== 'table') return // Skip on mobile or card view

    // If either dialog just closed, restore focus
    if ((oldEdit && !newEdit) || (oldDetails && !newDetails)) {
      setTimeout(() => {
        restoreFocus()
      }, 150)
    }
  })

  // Watch for bookmark data changes and clear remembered focus if bookmarks change significantly (table view only)
  watch(() => displayBookmarks.value.length, (newLength, oldLength) => {
    if (mobile.value || currentViewMode.value !== 'table') return // Skip on mobile or card view

    // If the number of bookmarks changed significantly, clear remembered focus
    if (oldLength !== undefined && Math.abs(newLength - oldLength) > 1) {
      clearRememberedFocus()
    }
  })

  // Handle row focus changes from keyboard navigation (table view only)
  function handleRowFocusChanged (index, isFocused) {
    if (mobile.value || currentViewMode.value !== 'table') return // Skip on mobile or card view

    if (isFocused) {
      focusedRowIndex.value = index
    } else if (focusedRowIndex.value === index) {
      focusedRowIndex.value = -1
    }
  }

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
          const clonedOptions = structuredClone(localServerOptions.value)

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

  // Mount and unmount handlers
  onMounted(() => {
    // Listen for view mode change events from command palette
    document.addEventListener('change-view-mode', handleViewModeCommand)
  })

  onUnmounted(() => {
    // Clean up event listener
    document.removeEventListener('change-view-mode', handleViewModeCommand)
  })

  // Card view specific methods (shared between mobile and desktop card view)
  function displayUrl (url) {
    const cleanedUrl = url
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '')

    return cleanedUrl.length > 50
      ? cleanedUrl.slice(0, 47) + '...'
      : cleanedUrl
  }

  function formatDate (dateString) {
    const d = new Date(dateString)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear().toString().slice(2)}`
  }

  function changePage (newPage) {
    localServerOptions.value = {
      ...localServerOptions.value,
      page: newPage,
    }
  }

  function handleSingleDelete (item) {
    // Add single item to selection and trigger delete
    emit('update:selected-items', [item.id])
    // The delete will be handled by the BookmarkDeleteButton component
  }

  function openBookmark (url) {
    window.open(url, '_blank')
  }

  // Swipe navigation for card view (mobile and desktop)
  function swipeToNextPage () {
    const currentPage = localServerOptions.value.page
    const totalPages = Math.ceil(totalItems.value / localServerOptions.value.itemsPerPage)

    if (currentPage < totalPages) {
      changePage(currentPage + 1)

      // Optional: Show feedback that swipe worked
      showSwipeFeedback('Next page')
    }
  }

  function swipeToPrevPage () {
    const currentPage = localServerOptions.value.page

    if (currentPage > 1) {
      changePage(currentPage - 1)

      // Optional: Show feedback that swipe worked
      showSwipeFeedback('Previous page')
    }
  }

  // Optional: Visual feedback for swipe actions
  const swipeFeedback = ref('')
  const swipeFeedbackTimeout = ref(null)

  function showSwipeFeedback (message) {
    swipeFeedback.value = message

    // Clear any existing timeout
    if (swipeFeedbackTimeout.value) {
      clearTimeout(swipeFeedbackTimeout.value)
    }

    // Hide feedback after 1 second
    swipeFeedbackTimeout.value = setTimeout(() => {
      swipeFeedback.value = ''
    }, 1000)
  }

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

<style scoped>
/* View Toggle Styling */
.view-toggle {
  position: relative;
  z-index: 2;
}

/* Card View Styles (shared between mobile and desktop) */
.bookmark-card-view {
  padding: 0;
}

.cards-container {
  padding: 0;
}

.bookmark-card {
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
}

.bookmark-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bookmark-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

.surface-card {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.bookmark-title {
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.bookmark-url {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  word-break: break-all;
  line-height: 1.2;
}

.color-accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  transition: opacity 0.2s ease;
}

.min-width-0 {
  min-width: 0;
}

/* Desktop card view adjustments */
@media (min-width: 960px) {
  .cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 8px;
  }

  .bookmark-card {
    margin-bottom: 0;
  }
}

/* Mobile card view (original styles) */
@media (max-width: 959px) {
  .bookmark-card {
    margin-bottom: 12px;
  }

  .bookmark-card .v-card-text {
    padding: 12px !important;
  }
}
</style>
