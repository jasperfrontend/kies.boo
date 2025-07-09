<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
const searchInputRef = ref(null)

// Keyboard shortcut
const handleKeydown = (event) => {
  // Alt+k to focus search bar
  if (event.altKey && event.key === 'k') {
    event.preventDefault()
    searchInputRef.value?.focus()
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
<v-text-field
  ref="searchInputRef"
  v-model="appStore.bookmarkSearch"
  label="Search bookmarks (Alt+k)"
  prepend-inner-icon="mdi-magnify"
  variant="solo-inverted"
  density="compact"
  class="mr-2"
  hide-details
  clearable
/>
</template>