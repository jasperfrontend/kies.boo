<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchInputRef = ref(null)
const searchQuery = ref('')

// Handle search submission
function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search/${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

// Handle focus search hotkey event
function handleFocusSearch() {
  searchInputRef.value?.focus()
}

onMounted(() => {
  // Listen for focus search hotkey event
  document.addEventListener('focus-search', handleFocusSearch)
})

onUnmounted(() => {
  document.removeEventListener('focus-search', handleFocusSearch)
})
</script>

<template>
  <v-text-field
    ref="searchInputRef"
    v-model="searchQuery"
    label="Search bookmarks (Alt+K to focus here, Enter to search)"
    prepend-inner-icon="mdi-magnify"
    variant="outlined"
    density="compact"
    hide-details
    clearable
    @keydown.enter="handleSearch"
  />
</template>