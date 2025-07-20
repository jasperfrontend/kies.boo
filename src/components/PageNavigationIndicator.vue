<template>
  <v-fade-transition>
    <v-alert
      v-if="numberBuffer || errorMessage"
      class="mb-4 text-center"
      density="compact"
      style="position: fixed; top: 80px; right: 20px; z-index: 1000; min-width: 200px;"
      :type="isError ? 'error' : 'info'"
      variant="elevated"
    >
      <div class="d-flex align-center justify-center">
        <span v-if="isError">{{ errorMessage }}</span>
        <span v-else>Going to page: <strong>{{ numberBuffer }}</strong></span>
        <v-progress-circular
          v-if="!isError"
          class="ml-2"
          indeterminate
          size="16"
          width="2"
        />
      </div>
    </v-alert>
  </v-fade-transition>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    numberBuffer: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  })

  const isError = computed(() => !!props.errorMessage)
</script>
