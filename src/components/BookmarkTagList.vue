<template>
  <div v-if="tags && tags.length > 0" class="mb-0">
    <v-chip
      v-for="tag in tags.slice(0, 3)"
      :key="tag"
      class="mr-1 mb-1"
      color="text-surface-variant"
      density="compact"
      size="x-small"
      @click.stop="$emit('search-tag', tag)"
    >
      {{ tag }}
    </v-chip>
    <v-chip
      v-if="tags.length > 3"
      class="mr-1 mb-1"
      density="compact"
      size="x-small"
      variant="outlined"
    >
      +{{ tags.length - 3 }}
    </v-chip>
  </div>
</template>

<script setup>
defineProps({
  tags: Array,
})

defineEmits(['search-tag'])
</script>