<template>
  <div>
    <v-data-table-server
      :headers="BOOKMARK_TABLE_HEADERS"
      :items="bookmarks"
      :items-length="totalItems"
      :loading="loading"
      :search="serverOptions.search"
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
        <v-alert type="info">No bookmarks found.</v-alert>
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
import { ref, computed, onMounted, onUnmounted, toRef } from 'vue'
import { useAppStore } from '@/stores/app'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useBookmarkTableKeyboard } from '@/composables/useBookmarkTableKeyboard'
import { useBookmarkData } from '@/composables/useBookmarkData'
import { useTableSelection } from '@/composables/useTableSelection'
import { ITEMS_PER_PAGE_OPTIONS, BOOKMARK_TABLE_HEADERS } from '@/lib/tableConstants'
import BookmarkTableRow from '@/components/BookmarkTableRow.vue'
import BookmarkDetailsDialog from '@/components/BookmarkDetailsDialog.vue'
import BookmarkEditDialog from '@/components/BookmarkEditDialog.vue'

const props = defineProps({
  dialogOpen: Boolean,
  selectedItems: Array
})

const emit = defineEmits(['update:selected-items', 'bookmark-updated'])

const appStore = useAppStore()

// Data management
const {
  loading,
  bookmarks,
  totalItems,
  serverOptions,
  loadBookmarks,
  updateServerOptions,
  triggerImmediateSearch, // NEW: Get the immediate search function
  cleanup
} = useBookmarkData(appStore)

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
  appStore.setBookmarkSearch(tag)
  // NEW: Trigger immediate search when clicking a tag
  triggerImmediateSearch()
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

// NEW: Listen for programmatic search events
onMounted(() => {
  // Listen for the custom event from external pages
  document.addEventListener('trigger-bookmark-search', () => {
    triggerImmediateSearch()
  })
  
  loadBookmarks()
})

onUnmounted(() => {
  document.removeEventListener('trigger-bookmark-search', () => {
    triggerImmediateSearch()
  })
  cleanup()
})

// Setup keyboard shortcuts
useKeyboardShortcuts({
  onAddBookmark: () => { appStore.openAddBookmarkDialog() },
  onRefreshBookmarks: () => { appStore.triggerBookmarkRefresh() }
})
</script>