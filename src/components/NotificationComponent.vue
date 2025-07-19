<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'success',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value),
    },
    message: {
      type: String,
      required: true,
    },
    timeout: {
      type: Number,
      default: 5000,
    },
    position: {
      type: String,
      default: 'bottom-right',
      validator: value => [
        'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'top-center', 'bottom-center',
      ].includes(value),
    },
  })

  const emit = defineEmits(['close'])

  const internalShow = ref(false)

  // Watch for prop changes
  watch(() => props.show, newValue => {
    internalShow.value = newValue
    if (newValue && props.timeout > 0) {
      setTimeout(() => {
        closeNotification()
      }, props.timeout)
    }
  }, { immediate: true })

  function closeNotification () {
    internalShow.value = false
    emit('close')
  }

  // Compute position classes
  // const positionClasses = {
  //   'top-left': 'top-0 left-0',
  //   'top-right': 'top-0 right-0',
  //   'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
  //   'bottom-left': 'bottom-0 left-0',
  //   'bottom-right': 'bottom-0 right-0',
  //   'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
  // }

  // Compute color based on type
  const colorMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  }

  // Compute icon based on type
  const iconMap = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
  }
</script>

<template>
  <v-snackbar
    v-model="internalShow"
    :color="colorMap[type]"
    elevation="6"
    :location="position.replace('-', ' ')"
    rounded="lg"
    :timeout="timeout"
    @update:model-value="(value) => !value && closeNotification()"
  >
    <div class="d-flex align-center">
      <v-icon
        class="me-2"
        :icon="iconMap[type]"
        size="20"
      />
      <span>{{ message }}</span>
    </div>

    <template #actions>
      <v-btn
        size="small"
        variant="text"
        @click="closeNotification"
      >
        <v-icon icon="mdi-close" size="18" />
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
/* */
</style>
