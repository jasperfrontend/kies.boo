<!-- src/components/BookmarkCardView.vue -->
<template>
  <div
    v-touch="{
      left: () => swipeToNextPage(),
      right: () => swipeToPrevPage()
    }"
    class="bookmark-card-view"
  >
    <!-- Card Header with Select All -->
    <BookmarkCardHeader
      :is-all-selected="isAllSelected"
      :is-indeterminate="isIndeterminate"
      :selected-count="selectedItems.length"
      :total-displayed="bookmarks.length"
      :total-items="totalItems"
      @toggle-select-all="$emit('toggle-select-all')"
    />

    <!-- Bookmark Cards -->
    <div v-if="!loading && bookmarks.length > 0" class="cards-container">
      <BookmarkCard
        v-for="(item) in bookmarks"
        :key="item.id"
        :bookmark="item"
        :is-selected="selectedItems.includes(item.id)"
        @click="openBookmark(item.url)"
        @edit="$emit('edit', item)"
        @search-tag="$emit('search-tag', $event)"
        @single-delete="$emit('single-delete', item)"
        @toggle-selection="$emit('toggle-item-selection', item.id)"
        @view-details="$emit('view-details', item)"
      />
    </div>

    <!-- Card View Loading State -->
    <BookmarkLoadingState v-else-if="loading" />

    <!-- Card View No Data -->
    <BookmarkNoDataState
      v-else
      :search-term="searchTerm"
      :search-type="searchType"
    />

    <!-- Card View Pagination -->
    <BookmarkCardPagination
      v-if="Math.ceil(totalItems / serverOptions.itemsPerPage) > 1"
      :current-page="serverOptions.page"
      :items-per-page="serverOptions.itemsPerPage"
      :total-items="totalItems"
      @update-page="$emit('update-page', $event)"
    />

    <!-- Domain Collapse Indicators (Card View) -->
    <BookmarkTableCollapseIndicators
      v-if="collapsedDomains.length > 0"
      class="mt-4"
      :collapsed-domains="collapsedDomains"
      :expanding-domain="expandingDomain"
      @expand-domain="$emit('expand-domain', $event)"
    />

    <!-- Swipe Feedback (Card View) -->
    <v-snackbar
      v-model="swipeFeedback.show"
      color="info"
      location="bottom"
      :timeout="1000"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2" icon="mdi-gesture-swipe-horizontal" />
        {{ swipeFeedback.message }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { toRef } from 'vue'
import BookmarkCard from '@/components/BookmarkCard.vue'
import BookmarkCardHeader from '@/components/BookmarkCardHeader.vue'
import BookmarkCardPagination from '@/components/BookmarkCardPagination.vue'
import BookmarkLoadingState from '@/components/BookmarkLoadingState.vue'
import BookmarkNoDataState from '@/components/BookmarkNoDataState.vue'
import BookmarkTableCollapseIndicators from '@/components/BookmarkTableCollapseIndicators.vue'
import { useBookmarkSwipe } from '@/composables/useBookmarkSwipe'

const props = defineProps({
  bookmarks: Array,
  collapsedDomains: Array,
  expandingDomain: String,
  isAllSelected: Boolean,
  isIndeterminate: Boolean,
  loading: Boolean,
  searchTerm: String,
  searchType: String,
  selectedItems: Array,
  serverOptions: Object,
  totalItems: Number,
})

const emit = defineEmits([
  'expand-domain',
  'single-delete',
  'toggle-item-selection',
  'toggle-select-all',
  'update-page',
  'view-details',
  'edit',
  'search-tag',
])

// Swipe functionality
const { swipeFeedback, swipeToNextPage, swipeToPrevPage } = useBookmarkSwipe(
  toRef(props, 'serverOptions'),
  toRef(props, 'totalItems'),
  emit
)

function openBookmark(url) {
  window.open(url, '_blank')
}
</script>

<style scoped>
.bookmark-card-view {
  padding: 0;
}

.cards-container {
  padding: 0;
}

/* Desktop card view adjustments */
@media (min-width: 960px) {
  .cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 2px;
  }
}

/* Mobile card view */
@media (max-width: 959px) {
  .cards-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>