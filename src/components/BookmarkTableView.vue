<!-- src/components/BookmarkTableView.vue -->
<template>
  <v-data-table-server
    v-model:options="localServerOptions"
    class="elevation-1 bg-surface-darken position-relative"
    density="compact"
    :headers="BOOKMARK_TABLE_HEADERS"
    :items="bookmarks"
    :items-length="totalItems"
    :items-per-page="serverOptions.itemsPerPage"
    :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
    :loading="loading"
    :page="serverOptions.page"
    :style="{
      backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
    }"
    @update:options="$emit('options-update', $event)"
  >
    <!-- Select all checkbox in header -->
    <template #header.select="">
      <v-checkbox
        density="compact"
        hide-details
        :indeterminate="isIndeterminate"
        :model-value="isAllSelected"
        @update:model-value="$emit('toggle-select-all')"
      />
    </template>

    <!-- Custom row rendering -->
    <template #item="{ item, index }">
      <BookmarkTableRow
        v-if="item.type !== 'collapse'"
        :index="index"
        :is-focused="focusedRowIndex === index"
        :is-last-highlighted="rememberedFocusIndex === index"
        :is-selected="selectedItems.includes(item.id)"
        :item="item"
        @edit="$emit('edit', $event)"
        @focus-changed="handleFocusChanged"
        @search-tag="$emit('search-tag', $event)"
        @toggle-selection="$emit('toggle-item-selection', $event)"
        @view-details="$emit('view-details', $event)"
      />
    </template>

    <!-- Collapsed domains indicators -->
    <template #top>
      <BookmarkTableCollapseIndicators
        :collapsed-domains="collapsedDomains"
        :expanding-domain="expandingDomain"
        @expand-domain="$emit('expand-domain', $event)"
      />

      <v-data-table-footer
        :items-per-page-options="ITEMS_PER_PAGE_OPTIONS"
        :options="serverOptions"
        :pagination="{
          page: serverOptions.page,
          itemsPerPage: serverOptions.itemsPerPage,
          pageCount: Math.ceil(totalItems / serverOptions.itemsPerPage),
          itemsLength: totalItems
        }"
        show-current-page
        @update:options="$emit('options-update', $event)"
      />
    </template>

    <template #no-data>
      <BookmarkNoDataAlert
        :search-term="searchTerm"
        :search-type="searchType"
      />
    </template>
  </v-data-table-server>
</template>

<script setup>
import { ref, watch } from 'vue'
import BookmarkNoDataAlert from '@/components/BookmarkNoDataAlert.vue'
import BookmarkTableCollapseIndicators from '@/components/BookmarkTableCollapseIndicators.vue'
import BookmarkTableRow from '@/components/BookmarkTableRow.vue'
import { BOOKMARK_TABLE_HEADERS, ITEMS_PER_PAGE_OPTIONS } from '@/lib/tableConstants'

const props = defineProps({
  bookmarks: Array,
  collapsedDomains: Array,
  expandingDomain: String,
  focusedRowIndex: Number,
  rememberedFocusIndex: Number,
  isAllSelected: Boolean,
  isIndeterminate: Boolean,
  loading: Boolean,
  searchTerm: String,
  searchType: String,
  selectedItems: Array,
  serverOptions: Object,
  totalItems: Number,
})

defineEmits([
  'edit',
  'expand-domain',
  'focus-changed',
  'options-update',
  'search-tag',
  'toggle-item-selection',
  'toggle-select-all',
  'view-details',
])

// Local server options for the data table
const localServerOptions = ref({
  page: 1,
  itemsPerPage: 15,
  sortBy: [],
  groupBy: [],
})

// Keep localServerOptions in sync with props
watch(() => props.serverOptions, newOptions => {
  localServerOptions.value = { ...newOptions }
}, { deep: true, immediate: true })

// Handle focus changes and relay to parent
function handleFocusChanged(index, isFocused) {
  emit('focus-changed', index, isFocused)
}
</script>