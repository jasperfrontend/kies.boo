<script setup>
  import { onMounted, onUnmounted } from 'vue'

  defineProps({
    modelValue: Boolean,
  })

  const emit = defineEmits(['update:modelValue', 'bookmark-added'])

  // Keyboard shortcut to open the Add Bookmark dialog
  const handleKeydown = event => {
    if (event.altKey && event.key === 'a') {
      event.preventDefault()
      emit('update:modelValue', true)
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
  <v-dialog
    max-width="500"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card title="Add a new bookmark">
      <v-card-text>
        <AddBookmark @bookmark-added="$emit('bookmark-added')" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          text="Close this"
          @click="$emit('update:modelValue', false)"
        >
          Close this
          <v-tooltip
            activator="parent"
            location="bottom"
          >
            Escape
          </v-tooltip>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
