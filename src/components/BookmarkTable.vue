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
      :items="bookmarks"
      :items-length="totalItems"
      :loading="loading"
      :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
      items-per-page="15"
      v-model:options="serverOptions"
      @update:options="updateServerOptions"
      class="elevation-1 bg-transparent"
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

      <template #no-data>
        <v-alert type="info">
          {{ 
            searchType === 'search' ? `No bookmarks found matching "${searchTerm}"` : 
            searchType === 'tag' ? `No bookmarks found with tag "${searchTerm}"` : 
            'No bookmarks found.' 
          }}
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

    <AppTips v-if="searchType === 'all'" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
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
  resetPagination
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

// Track dialog states for keyboard navigation
const dialogsOpen = computed(() => ({
  details: detailsDialog.value,
  edit: editDialog.value,
  addBookmark: props.dialogOpen
}))

// Keyboard navigation
const { focusedRowIndex } = useBookmarkTableKeyboard(
  bookmarks,
  toRef(props, 'selectedItems'),
  toggleItemSelection,
  dialogsOpen
)

// Event handlers
function handleSearchTag(tag) {
  // Navigate to tag route instead of setting search
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

onMounted(() => {
  loadBookmarks()
})

// Setup keyboard shortcuts (only for main bookmark page)
if (props.searchType === 'all') {
  useKeyboardShortcuts({
    onAddBookmark: () => { appStore.openAddBookmarkDialog() },
    onRefreshBookmarks: () => { appStore.triggerBookmarkRefresh() }
  })
}
</script>