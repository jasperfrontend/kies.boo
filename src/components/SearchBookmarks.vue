<script setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay, useHotkey } from 'vuetify'

  const router = useRouter()
  const searchInputRef = ref(null)
  const searchQuery = ref('')
  const mobile = useDisplay()
  const showCommandSuggestions = ref(false)
  const commandSuggestions = ref([])

  // Handle search submission
  async function handleSearch() {
    if (!searchQuery.value.trim()) {
      return
    }

    if (searchQuery.value.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.value.trim())}`)
      handleBlurSearch()
    }
  }

  // Handle focus search hotkey event
  function handleFocusSearch() {
    searchInputRef.value?.focus()
  }

  function handleBlurSearch() {
    searchQuery.value = ''
    searchInputRef.value?.blur()
  }

  // Handle input blur - hide suggestions with delay for menu interactions
  function handleBlur(event) {
    // Don't hide if the blur is caused by clicking on the menu
    const relatedTarget = event.relatedTarget
    if (relatedTarget && (
      relatedTarget.closest('.v-menu') || 
      relatedTarget.closest('.v-overlay') ||
      relatedTarget.closest('[role="menu"]')
    )) {
      return
    }
  }

  // Add window blur handler to hide menu when switching tabs
  function handleWindowBlur() {
    showCommandSuggestions.value = false
    commandSuggestions.value = []
  }

  // Escape key handler
  useHotkey('esc', () => {
    handleBlurSearch()
  }, {
    inputs: true,
    sequenceTimeout: 1000,
  })

  onMounted(async () => {
    
    // Listen for focus search hotkey event
    document.addEventListener('focus-search', handleFocusSearch)
    
    // Listen for window blur to hide menu when switching tabs
    window.addEventListener('blur', handleWindowBlur)
  })

  onUnmounted(() => {
    document.removeEventListener('focus-search', handleFocusSearch)
    window.removeEventListener('blur', handleWindowBlur)
  })
</script>

<template>
  <div class="search-container">
    <v-text-field
      v-if="mobile === true"
      ref="searchInputRef"
      v-model="searchQuery"
      :autofocus
      clearable
      density="compact"
      hide-details
      label="Find bookmarks or use /commands"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      @blur="handleBlur"
      @keydown.enter="handleSearch"
      @keydown.esc="handleBlurSearch"
    >
      <v-tooltip
        activator="parent"
        location="bottom"
      >
        F to focus here, Enter to search, or use /gb, /gt, /gp commands
      </v-tooltip>
    </v-text-field>

    <v-text-field
      v-else
      ref="searchInputRef"
      v-model="searchQuery"
      clearable
      density="compact"
      hide-details
      label="Find bookmarks or use /commands"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      @blur="handleBlur"
      @keydown.enter="handleSearch"
      @keydown.esc="handleBlurSearch"
    />

  </div>
</template>

<style scoped>
.search-container {
  position: relative;
}
</style>