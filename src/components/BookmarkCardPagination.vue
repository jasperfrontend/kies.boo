<template>
  <v-card
    class="mt-4 surface-card"
    :style="{
      backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
    }"
    variant="outlined"
  >
    <v-card-text class="pa-3">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="text-body-2">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="text-caption text-medium-emphasis">
          {{ totalItems }} total items
        </div>
      </div>

      <div class="d-flex align-center justify-center">
        <v-btn
          :disabled="currentPage <= 1"
          icon="mdi-chevron-left"
          size="small"
          variant="text"
          @click="$emit('update-page', currentPage - 1)"
        />

        <div class="mx-4 text-body-2">
          {{ currentPage }}
        </div>

        <v-btn
          :disabled="currentPage >= totalPages"
          icon="mdi-chevron-right"
          size="small"
          variant="text"
          @click="$emit('update-page', currentPage + 1)"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: Number,
  itemsPerPage: Number,
  totalItems: Number,
})

defineEmits(['update-page'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))
</script>

<style scoped>
.surface-card {
  backdrop-filter: blur(8px);
}
</style>