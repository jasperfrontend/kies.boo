<template>
  <div>
    <!-- Delete Button - Shows when items are selected -->
    <BookmarkDeleteButton
      :selected-items="selectedItems"
      :use-store-selection="false"
      class="mb-4"
      @delete-completed="handleDeleteCompleted"
    />

    <v-data-table-server
      :key="tableKey"
      :headers="BOOKMARK_TABLE_HEADERS"
      :items="displayBookmarks"
      :items-length="totalItems"
      :loading="loading"
      :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
      items-per-page="15"
      v-model:options="serverOptions"
      @update:options="updateServerOptions"
      class="elevation-1 bg-surface-darken"
      :style="{
        backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
      }"
      density="compact"
      show-current-page
      :mobile-breakpoint="600"
    >
      <template v-slot:top="{ pagination, options, updateServerOptions }">
        <v-data-table-footer
          :pagination="pagination" 
          :options="options"
          :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
          @update:options="updateServerOptions"
          show-current-page
        />
      </template>

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

      <!-- Custom bottom slot for collapse indicators -->
      <template #bottom>
        <!-- Collapse indicators -->
        <div v-for="domain in collapsedDomainsWithCounts" :key="domain.name" class="collapse-indicator">
          <v-card
            variant="outlined"
            class="ma-2 pa-3"
            color="surface-variant"
          >
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-domain" class="mr-2" color="primary" />
                <div>
                  <div class="text-subtitle-2 font-weight-medium">
                    {{ domain.count }} more results from {{ domain.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Click to show all {{ domain.name }} bookmarks
                  </div>
                </div>
              </div>
              <v-btn
                @click="handleExpandDomain(domain.name)"
                :loading="expandingDomain === domain.name"
                variant="tonal"
                color="primary"
                size="small"
                prepend-icon="mdi-chevron-down"
              >
                Show All
              </v-btn>
            </div>
          </v-card>
        </div>

        <!-- Regular pagination footer -->
        <v-data-table-footer
          :pagination="{ 
            page: serverOptions.page, 
            itemsPerPage: serverOptions.itemsPerPage, 
            pageCount: Math.ceil(totalItems / serverOptions.itemsPerPage),
            itemsLength: totalItems
          }" 
          :options="serverOptions"
          :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
          @update:options="updateServerOptions"
          show-current-page
        />
      </template>

      <template #no-data>
        <v-alert type="info" class="ma-4">
          {{ 
            searchType === 'search' ? `No bookmarks found matching "${searchTerm}"` : 
            searchType === 'tag' ? `No bookmarks found with tag "${searchTerm}"` : 
            'No bookmarks found.' 
          }}
        </v-alert>
      </template>
    </v-data-table-server>

    <!-- Debug info (remove in production) -->
    <div v-if="false" class="mt-2 text-caption text-grey-darken-1">
      Debug: Showing {{ visibleBookmarkCount }} visible, {{ hiddenBookmarkCount }} hidden, target: {{ serverOptions.itemsPerPage }}
      <br>Collapsed domains: {{ collapsedDomainsWithCounts.map(d => `${d.name}(${d.count})`).join(', ') }}
    </div>

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
import { ref, computed, toRef, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useBookmarkTableKeyboard } from '@/composables/useBookmarkTableKeyboard'
import { useBookmarkData } from '@/composables/useBookmarkData'
import { useTableSelection } from '@/composables/useTableSelection'
import { ITEMS_PER_PAGE_OPTIONS, BOOKMARK_TABLE_HEADERS } from '@/lib/tableConstants'
import BookmarkTableRow from '@/components/BookmarkTableRow.vue'
import BookmarkDetailsDialog from '@/components/BookmarkDetailsDialog.vue'
import BookmarkEditDialog from '@/components/BookmarkEditDialog.vue'
import BookmarkDeleteButton from '@/components/BookmarkDeleteButton.vue'

const props = defineProps({
  dialogOpen: Boolean,
  selectedItems: Array,
  searchType: {
    type: String,
    default: 'all' // 'all', 'search', 'tag'
  },
  searchTerm: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:selected-items', 'bookmark-updated', 'delete-selected'])

const appStore = useAppStore()
const router = useRouter()

// Create reactive refs from props so they can be watched
const reactiveSearchType = toRef(props, 'searchType')
const reactiveSearchTerm = toRef(props, 'searchTerm')

// Create a table key that changes when search parameters change
// This forces the v-data-table-server to completely re-render and reset its pagination
const tableKey = computed(() => {
  return `${props.searchType}-${props.searchTerm}-table`
})

// Data management - pass reactive refs
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
} = useBookmarkData(appStore, reactiveSearchType, reactiveSearchTerm)

// Watch for prop changes and reload data
watch([reactiveSearchType, reactiveSearchTerm], () => {
  // Reset pagination when search parameters change
  resetPagination()
  loadBookmarks()
}, { immediate: false })

// Selection logic
const {
  isAllSelected,
  isIndeterminate,
  toggleSelectAll,
  toggleItemSelection
} = useTableSelection(bookmarks, toRef(props, 'selectedItems'), emit)

// Dialog states
const detailsDialog = ref(false)
const editDialog = ref(false)
const detailsBookmark = ref(null)
const editBookmark = ref(null)
const expandingDomain = ref(null)

// Track dialog states for keyboard navigation
const dialogsOpen = computed(() => ({
  details: detailsDialog.value,
  edit: editDialog.value,
  addBookmark: props.dialogOpen
}))

// Collapsed domain handling
const collapsedDomains = ref({})
const displayBookmarks = ref([])
const isAutoLoading = ref(false) // Guard against infinite loading

function extractDomain(url) {
  try {
    return new URL(url).hostname
  } catch (e) {
    return url
  }
}

// Count visible bookmarks (excluding collapse rows)
const visibleBookmarkCount = computed(() => {
  return displayBookmarks.value.length // All items in displayBookmarks are now actual bookmarks
})

// Get collapsed domains with their counts for the bottom display
const collapsedDomainsWithCounts = computed(() => {
  const counts = {}
  const result = []
  
  // Count bookmarks per domain
  bookmarks.value.forEach(b => {
    const d = extractDomain(b.url)
    counts[d] = (counts[d] || 0) + 1
  })
  
  // Find domains that are collapsed and have more than 5 items
  Object.entries(counts).forEach(([domain, count]) => {
    const isExpanded = expandedDomains.value.has(domain)
    if (!isExpanded && count > 5) {
      result.push({
        name: domain,
        count: count - 5
      })
    }
  })
  
  return result
})

// Count hidden bookmarks due to collapsing
const hiddenBookmarkCount = computed(() => {
  let hidden = 0
  const counts = {}
  
  // Count bookmarks per domain
  bookmarks.value.forEach(b => {
    const d = extractDomain(b.url)
    counts[d] = (counts[d] || 0) + 1
  })
  
  // Calculate hidden count for collapsed domains
  Object.entries(counts).forEach(([domain, count]) => {
    const isExpanded = expandedDomains.value.has(domain)
    if (!isExpanded && count > 5) {
      hidden += count - 5
    }
  })
  
  return hidden
})

function computeDisplayBookmarks() {
  const counts = {}
  bookmarks.value.forEach(b => {
    const d = extractDomain(b.url)
    counts[d] = (counts[d] || 0) + 1
  })

  const indexMap = {}
  const result = []

  bookmarks.value.forEach(b => {
    const d = extractDomain(b.url)
    indexMap[d] = (indexMap[d] || 0) + 1
    const idx = indexMap[d]
    const collapsed = !expandedDomains.value.has(d)

    // Only show first 5 items from collapsed domains
    if (counts[d] > 5 && collapsed && idx > 5) {
      return // Skip this item (it will be shown in the bottom indicator)
    }

    result.push(b)
  })

  displayBookmarks.value = result

  // Only check for auto-loading if we're not already auto-loading
  if (!isAutoLoading.value) {
    checkAndLoadMoreIfNeeded()
  }
}

function checkAndLoadMoreIfNeeded() {
  const target = serverOptions.value.itemsPerPage
  const visible = visibleBookmarkCount.value
  const hidden = hiddenBookmarkCount.value
  
  // Only auto-load if:
  // 1. We have a specific items-per-page target (not "show all")
  // 2. We have hidden items due to collapsing
  // 3. Visible items < target (we can fit more)
  // 4. We're not already loading
  // 5. We're not already auto-loading
  if (
    target !== -1 && 
    hidden > 0 && 
    visible < target && 
    !loading.value &&
    !isAutoLoading.value
  ) {
    const additionalNeeded = Math.min(hidden, target - visible)
    console.log(`Loading ${additionalNeeded} more items: visible ${visible} + hidden ${hidden}, target ${target}`)
    
    isAutoLoading.value = true
    loadBookmarks(additionalNeeded).finally(() => {
      // Reset the guard after loading is complete
      isAutoLoading.value = false
    })
  }
}

async function handleExpandDomain(domain) {
  expandingDomain.value = domain
  
  try {
    // Mark domain as expanded - no more collapsing for this domain
    expandDomain(domain)
    
    // After expanding, we need to retrigger the query to respect items-per-page limit
    // This will reload the data with proper pagination
    await loadBookmarks()
    
  } finally {
    expandingDomain.value = null
  }
}

// Watch bookmarks and recompute display
watch(bookmarks, computeDisplayBookmarks, { immediate: true })

// Watch for changes in expanded domains
watch(expandedDomains, computeDisplayBookmarks, { deep: true })

// Keyboard navigation
const { focusedRowIndex } = useBookmarkTableKeyboard(
  displayBookmarks, // Use displayBookmarks instead of bookmarks for proper navigation
  toRef(props, 'selectedItems'),
  toggleItemSelection,
  dialogsOpen
)

// Event handlers
function handleSearchTag(tag) {
  router.push(`/tag/${encodeURIComponent(tag)}`)
}

function handleViewDetails(bookmark) {
  detailsBookmark.value = bookmark
  detailsDialog.value = true
}

function handleEdit(bookmark) {
  editBookmark.value = bookmark
  editDialog.value = true
}

function handleBookmarkUpdated() {
  emit('bookmark-updated')
  loadBookmarks()
}

function handleDeleteCompleted(deletedIds) {
  // Clear the selected items after successful deletion
  emit('update:selected-items', [])
  // Refresh the bookmarks
  loadBookmarks()
  // Emit for backwards compatibility
  emit('delete-selected', deletedIds)
}
</script>

<style scoped>
.collapse-indicator {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.collapse-indicator .v-card {
  transition: all 0.2s ease-in-out;
}

.collapse-indicator .v-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>