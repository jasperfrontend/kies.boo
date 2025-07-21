<template>
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
            :label="selectedCount > 0 ? selectedCount + ' selected' : ' Select all'"
            :model-value="isAllSelected"
            @update:model-value="$emit('toggle-select-all')"
          />
        </div>
        <div class="text-caption text-medium-emphasis">
          {{ totalDisplayed }} of {{ totalItems }} bookmarks
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  isAllSelected: Boolean,
  isIndeterminate: Boolean,
  selectedCount: Number,
  totalDisplayed: Number,
  totalItems: Number,
})

defineEmits(['toggle-select-all'])
</script>

<style scoped>
.surface-card {
  backdrop-filter: blur(8px);
}
</style>