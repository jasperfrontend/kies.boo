<!-- src/components/BookmarkTable.vue -->
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

    <!-- CARD VIEW: Mobile (always) or Desktop (when selected) -->
    <BookmarkCardView
      v-if="mobile || currentViewMode === 'card'"
      :bookmarks="displayBookmarks"
      :collapsed-domains="collapsedDomainsWithCounts"
      :expanding-domain="expandingDomain"
      :is-all-selected="isAllSelected"
      :is-indeterminate="isIndeterminate"
      :loading="loading"
      :search-term="searchTerm"
      :search-type="searchType"
      :selected-items="selectedItems"
      :server-options="localServerOptions"
      :total-items="totalItems"
      @expand-domain="handleExpandDomain"
      @single-delete="handleSingleDelete"
      @toggle-item-selection="toggleItemSelection"
      @toggle-select-all="toggleSelectAll"
      @update-page="changePage"
      @view-details="handleViewDetails"
      @edit="handleEdit"
      @search-tag="handleSearchTag"
    />

    <!-- TABLE VIEW: Desktop only when selected -->
    <BookmarkTableView
      v-else-if="!mobile && currentViewMode === 'table'"
      :key="tableKey"
      ref="dataTableRef"
      :bookmarks="displayBookmarks"
      :collapsed-domains="collapsedDomainsWithCounts"
      :expanding-domain="expandingDomain"
      :focused-row-index="focusedRowIndex"
      :remembered-focus-index="rememberedFocusIndex"
      :is-all-selected="isAllSelected"
      :is-indeterminate="isIndeterminate"
      :loading="loading"
      :search-term="searchTerm"
      :search-type="searchType"
      :selected-items="selectedItems"
      :server-options="localServerOptions"
      :total-items="totalItems"
      @edit="handleEdit"
      @expand-domain="handleExpandDomain"
      @focus-changed="handleRowFocusChanged"
      @options-update="handleOptionsUpdate"
      @search-tag="handleSearchTag"
      @toggle-item-selection="toggleItemSelection"
      @toggle-select-all="toggleSelectAll"
      @view-details="handleViewDetails"
    />

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
import BookmarkCardView from '@/components/BookmarkCardView.vue'
import BookmarkDeleteButton from '@/components/BookmarkDeleteButton.vue'
import BookmarkDetailsDialog from '@/components/BookmarkDetailsDialog.vue'
import BookmarkEditDialog from '@/components/BookmarkEditDialog.vue'
import BookmarkTableView from '@/components/BookmarkTableView.vue'
import PageNavigationIndicator from '@/components/PageNavigationIndicator.vue'
import { useBookmarkData } from '@/composables/useBookmarkData'
import { useBookmarkTableDialogs } from '@/composables/useBookmarkTableDialogs'
import { useBookmarkTableKeyboard } from '@/composables/useBookmarkTableKeyboard'
import { useBookmarkTableState } from '@/composables/useBookmarkTableState'
import { useDomainCollapsing } from '@/composables/useDomainCollapsing'
import { useNumericPagination } from '@/composables/useNumericPagination'
import { useTableSelection } from '@/composables/useTableSelection'
import { useUserPreferences } from '@/composables/useUserPreferences'
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

// State management for server options and preferences
const { localServerOptions, userPreferencesStable } = useBookmarkTableState(
  serverOptions,
  userItemsPerPage,
  updateServerOptions
)

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
  rememberedFocusIndex,
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

// Numeric pagination
const { numberBuffer, errorMessage } = useNumericPagination(
  pageNumber => {
    if (!userPreferencesStable.value) return

    const newOptions = {
      ...localServerOptions.value,
      page: pageNumber,
    }

    localServerOptions.value = newOptions

    nextTick(() => {
      if (dataTableRef.value) {
        handleOptionsUpdate(localServerOptions.value)
      }

      nextTick(() => {
        const clonedOptions = structuredClone(localServerOptions.value)
        localServerOptions.value = clonedOptions
      })
    })
  },
  () => Math.ceil(totalItems.value / localServerOptions.value.itemsPerPage),
  () => Object.values(dialogsOpen.value).some(Boolean),
)

// Initialize view mode from storage on mount
onMounted(() => {
  if (mobile.value) {
    viewModeStore.setMode('card')
  } else {
    viewModeStore.initialize()
  }

  // Listen for view mode change events from command palette
  document.addEventListener('change-view-mode', handleViewModeCommand)
})

onUnmounted(() => {
  document.removeEventListener('change-view-mode', handleViewModeCommand)
})

// Watch for mobile changes and force card view
watch(() => mobile.value, isMobile => {
  if (isMobile) {
    viewModeStore.setMode('card')
  }
})

// Watch for dialog state changes to restore focus when dialogs close (table view only)
watch(dialogsOpen, (newDialogsOpen, oldDialogsOpen) => {
  if (mobile.value || currentViewMode.value !== 'table') return

  const dialogJustClosed = Object.keys(newDialogsOpen).some(key =>
    oldDialogsOpen?.[key] === true && newDialogsOpen[key] === false,
  )

  if (dialogJustClosed) {
    setTimeout(() => {
      restoreFocus()
    }, 150)
  }
}, { deep: true })

// Watch for edit/details dialogs specifically for additional safety (table view only)
watch([() => editDialog.value, () => detailsDialog.value], ([newEdit, newDetails], [oldEdit, oldDetails]) => {
  if (mobile.value || currentViewMode.value !== 'table') return

  if ((oldEdit && !newEdit) || (oldDetails && !newDetails)) {
    setTimeout(() => {
      restoreFocus()
    }, 150)
  }
})

// Watch for bookmark data changes and clear remembered focus if bookmarks change significantly (table view only)
watch(() => displayBookmarks.value.length, (newLength, oldLength) => {
  if (mobile.value || currentViewMode.value !== 'table') return

  if (oldLength !== undefined && Math.abs(newLength - oldLength) > 1) {
    clearRememberedFocus()
  }
})

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
function handleViewModeCommand(event) {
  const { mode } = event.detail
  if (!mobile.value && ['table', 'card'].includes(mode)) {
    viewModeStore.setMode(mode)
  }
}

function handleRowFocusChanged(index, isFocused) {
  if (mobile.value || currentViewMode.value !== 'table') return

  if (isFocused) {
    focusedRowIndex.value = index
  } else if (focusedRowIndex.value === index) {
    focusedRowIndex.value = -1
  }
}

function handleOptionsUpdate(newOptions) {
  localServerOptions.value = { ...newOptions }
}

function changePage(newPage) {
  localServerOptions.value = {
    ...localServerOptions.value,
    page: newPage,
  }
}

function handleSingleDelete(item) {
  emit('update:selected-items', [item.id])
}

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
</script>