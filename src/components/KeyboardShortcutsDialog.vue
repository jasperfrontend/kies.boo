<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import keyboardShortcuts from '@/lib/keyboardShortcuts'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const showDialog = ref(false)

  // Watch for prop changes
  const updateDialog = value => {
    showDialog.value = value
    emit('update:modelValue', value)
  }

  // Handle keyboard shortcut to close dialog
  const handleKeydown = event => {
    // Esc to close dialog when it's open
    if (event.key === 'Escape' && showDialog.value) {
      event.preventDefault()
      updateDialog(false)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    showDialog.value = props.modelValue
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  // Helper function to format key combinations
  const formatKeyCombo = key => {
    return key.split(' + ').map(k => k.trim())
  }
</script>

<template>
  <v-dialog
    max-width="700"
    :model-value="modelValue"
    scrollable
    @update:model-value="updateDialog"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-keyboard</v-icon>
        Keyboard Shortcuts
      </v-card-title>

      <v-divider />

      <v-card-text style="max-height: 500px;">
        <div
          v-for="(category, index) in keyboardShortcuts"
          :key="category.category"
          :class="{ 'mt-6': index > 0 }"
        >
          <h3 class="text-h6 mb-3 text-primary">
            {{ category.category }}
          </h3>

          <v-list class="pa-0" density="compact">
            <v-list-item
              v-for="shortcut in category.shortcuts"
              :key="shortcut.action"
              class="px-0"
            >
              <template #prepend>
                <div class="d-flex align-center mr-4" style="min-width: 140px;">
                  <v-chip
                    v-for="(key, keyIndex) in formatKeyCombo(shortcut.key)"
                    :key="keyIndex"
                    class="mr-1"
                    color="primary"
                    density="compact"
                    size="small"
                    variant="outlined"
                  >
                    {{ key }}
                  </v-chip>
                </div>
              </template>

              <v-list-item-title>
                {{ shortcut.description }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <v-divider class="my-4" />

        <div class="text-caption text-center text-grey-darken-1">
          Press <v-chip size="x-small" variant="outlined">Ctrl</v-chip> +
          <v-chip size="x-small" variant="outlined">/</v-chip>
          to open this dialog anytime
        </div>

      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="updateDialog(false)"
        >
          Close
          <v-badge
            color="grey-darken-3"
            content="Esc"
            inline
          />
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-list-item {
  min-height: 36px;
}

.v-chip {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}
</style>
