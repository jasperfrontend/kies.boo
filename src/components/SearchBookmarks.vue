<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useHotkey, useDisplay } from 'vuetify'

  const router = useRouter()
  const searchInputRef = ref(null)
  const searchQuery = ref('')
  const mobile = useDisplay()

  // Handle search submission
  function handleSearch () {
    if (searchQuery.value.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.value.trim())}`)
      handleBlurSearch()
    }
  }

  // Handle focus search hotkey event
  function handleFocusSearch () {
    searchInputRef.value?.focus()
  }
  function handleBlurSearch () {
    searchQuery.value = ''
    searchInputRef.value?.blur()
  }

  useHotkey('esc', () => {
    handleBlurSearch()
  }, {
    inputs: true,
    sequenceTimeout: 1000,
  })

  onMounted(() => {
    // Listen for focus search hotkey event
    document.addEventListener('focus-search', handleFocusSearch)
  })

  onUnmounted(() => {
    document.removeEventListener('focus-search', handleFocusSearch)
  })

</script>

<template>
  <v-text-field v-if="mobile === true"
    ref="searchInputRef"
    v-model="searchQuery"
    clearable
    density="compact"
    hide-details
    :autofocus
    label="Find bookmarks"
    prepend-inner-icon="mdi-magnify"
    variant="outlined"
    @keydown.enter="handleSearch"
  >
    <v-tooltip
      activator="parent"
      location="bottom"
    >
      F to focus here, Enter to search
    </v-tooltip>
  </v-text-field>
  <v-text-field v-else
    ref="searchInputRef"
    v-model="searchQuery"
    clearable
    density="compact"
    hide-details
    label="Find bookmarks"
    prepend-inner-icon="mdi-magnify"
    variant="outlined"
    @keydown.enter="handleSearch"
  >
  </v-text-field>

</template>
