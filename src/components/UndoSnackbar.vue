<script setup>
import { onMounted, onUnmounted } from 'vue';

defineProps({
  modelValue: Boolean,
  deletedItems: Array
});

const emit = defineEmits(['update:modelValue', 'undo', 'dismiss']);

// Keyboard shortcut for undo
const handleKeydown = (event) => {
  if (event.altKey && event.key === 'u') {
    event.preventDefault();
    emit('undo');
  }
  
  if (event.altKey && event.key === 'i') {
    event.preventDefault();
    // This will be handled by the parent component
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <v-snackbar
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :timeout="-1"
    color="info"
    location="bottom"
    class="mb-4"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">mdi-information</v-icon>
      <span>
        {{ deletedItems.length }} item{{ deletedItems.length === 1 ? '' : 's' }} deleted
      </span>
    </div>
    
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="$emit('undo')"
        color="white"
      >
        Undo (Alt+U)
      </v-btn>
      <v-btn
        variant="text"
        @click="$emit('dismiss')"
        color="white"
      >
        Dismiss
      </v-btn>
    </template>
  </v-snackbar>
</template>