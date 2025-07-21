<!-- src/components/BookmarkCard.vue -->
<template>
  <v-card
    class="bookmark-card surface-card mb-2 mb-md-0"
    :class="{ 'selected': isSelected }"
    :style="{
      backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
    }"
    variant="flat"
    @click="$emit('click')"
  >
    <v-card-text class="pa-3">
      <!-- Header Row: Favicon, Title, Checkbox -->
      <div class="d-flex align-start mb-2">
        <v-checkbox
          density="compact"
          hide-details
          :model-value="isSelected"
          width="40"
          @click.stop="$emit('toggle-selection')"
          @update:model-value="$emit('toggle-selection')"
        />

        <div class="flex-grow-1 min-width-0">
          <div class="bookmark-title text-caption font-weight-medium mb-1">
            {{ bookmark.title }}
          </div>
          <div class="bookmark-url text-caption text-medium-emphasis mb-1">
            {{ displayUrl(bookmark.url) }}
          </div>
        </div>

        <BookmarkCardMenu
          :bookmark="bookmark"
          @edit="$emit('edit')"
          @open="$emit('click')"
          @single-delete="$emit('single-delete')"
          @view-details="$emit('view-details')"
        />
      </div>

      <!-- Tags Row -->
      <div class="d-flex justify-space-between align-center">
        <BookmarkTagList
          :tags="bookmark.tags"
          @search-tag="$emit('search-tag', $event)"
        />
        <div class="text-caption text-medium-emphasis">
          {{ formatDate(bookmark.created_at) }}
        </div>
      </div>
    </v-card-text>

    <!-- Color Accent Bar (if bookmark has vibrant color) -->
    <div
      v-if="bookmark.metadata?.vibrant_color"
      class="color-accent-bar"
      :style="{
        backgroundColor: `rgb(${bookmark.metadata.vibrant_color.join(',')})`,
        opacity: isSelected ? 1 : 0.5
      }"
    />
  </v-card>
</template>

<script setup>
import BookmarkCardMenu from '@/components/BookmarkCardMenu.vue'
import BookmarkTagList from '@/components/BookmarkTagList.vue'
import { useBookmarkFormatting } from '@/composables/useBookmarkFormatting'

defineProps({
  bookmark: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

defineEmits([
  'click',
  'edit',
  'search-tag',
  'single-delete',
  'toggle-selection',
  'view-details',
])

const { displayUrl, formatDate } = useBookmarkFormatting()
</script>

<style scoped>
.bookmark-card {
  position: relative;
  transition: background 0.2s ease;
  cursor: pointer;
}

.bookmark-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bookmark-card.selected {
  border-color: rgb(var(--v-theme-surface));
  background-color: rgba(var(--v-theme-surface), 0.7) !important;
}

.surface-card {
  backdrop-filter: blur(8px);
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

/* Mobile card view */
@media (max-width: 959px) {
  .bookmark-card .v-card-text {
    padding: 12px !important;
  }
}
</style>