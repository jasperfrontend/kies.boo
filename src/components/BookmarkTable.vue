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
      :items-per-page="userItemsPerPage"
      v-model:options="serverOptions"
      @update:options="updateServerOptions"
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
import { computed, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useBookmarkData } from '@/composables/useBookmarkData'
import { useTableSelection } from '@/composables/useTableSelection'
import { useUserPreferences } from '@/composables/useUserPreferences'
import { useBookmarkTableKeyboard } from '@/composables/useBookmarkTableKeyboard'
import { useBookmarkTableDialogs } from '@/composables/useBookmarkTableDialogs'
import { useDomainCollapsing } from '@/composables/useDomainCollapsing'
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

// Watch for prop changes and reload data
watch([reactiveSearchType, reactiveSearchTerm], () => {
  resetPagination()
  loadBookmarks()
}, { immediate: false })

// Watch for changes in user's items per page preference
watch(userItemsPerPage, (newItemsPerPage) => {
  serverOptions.value.itemsPerPage = newItemsPerPage
  serverOptions.value.page = 1
  loadBookmarks()
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