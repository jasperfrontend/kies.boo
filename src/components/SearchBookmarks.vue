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
    v-model="searchQuery"
    label="Search bookmarks (Alt+k)"
    prepend-inner-icon="mdi-magnify"
    variant="solo-inverted"
    density="compact"
    class="mr-2"
    hide-details
    clearable
    @keydown.enter="handleSearch"
  />
</template>