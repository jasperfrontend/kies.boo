<script setup>
  import { onMounted, onUnmounted } from 'vue'

  defineProps({
    modelValue: Boolean,
    deletedItems: Array,
  })

  const emit = defineEmits(['update:modelValue', 'undo', 'dismiss'])

  // Keyboard shortcut for undo
  const handleKeydown = event => {
    if (event.altKey && event.key === 'u') {
      event.preventDefault()
      emit('undo')
    }

    if (event.altKey && event.key === 'i') {
      event.preventDefault()
    // This will be handled by the parent component
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
</script>

<template>
  <v-snackbar
    class="mb-4"
    color="info"
    location="bottom"
    :model-value="modelValue"
    :timeout="-1"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">mdi-information</v-icon>
      <span>
        {{ deletedItems.length }} item{{ deletedItems.length === 1 ? '' : 's' }} deleted
      </span>
    </div>

    <template #actions>
      <v-btn
        color="white"
        variant="text"
        @click="$emit('undo')"
      >
        Undo
        <v-badge
          color="white"
          content="Alt+U"
          inline
        />
      </v-btn>
      <v-btn
        color="white"
        variant="text"
        @click="$emit('dismiss')"
      >
        Dismiss
      </v-btn>
    </template>
  </v-snackbar>
</template>
