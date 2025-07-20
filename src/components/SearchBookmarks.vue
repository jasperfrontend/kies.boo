<script setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDisplay, useHotkey } from 'vuetify'
  import commandPaletteService from '@/lib/commandPaletteService'

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

    // Check if it's a command
    if (commandPaletteService.isCommand(searchQuery.value)) {
      const executed = await commandPaletteService.executeCommand(searchQuery.value, router)
      if (executed) {
        // Command executed successfully, clear search and blur
        handleBlurSearch()
        return
      }
      // Command failed, fall through to normal search
    }

    // Normal search behavior
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
    showCommandSuggestions.value = false
    commandSuggestions.value = []
  }

  // Watch for command input to filter suggestions
  watch(searchQuery, (newValue) => {
    if (commandPaletteService.isCommand(newValue)) {
      // Is a command, show suggestions
      const commandPart = newValue.slice(1) // Remove prefix
      commandSuggestions.value = commandPaletteService.getCommandSuggestions(commandPart)
      showCommandSuggestions.value = true
    } else {
      // Not a command, hide suggestions and clear commands
      showCommandSuggestions.value = false
      commandSuggestions.value = []
    }
  })

  // Handle input focus - just focus, don't show anything
  function handleFocus() {
    // Do nothing - only show commands when user types "/"
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
    
    // Hide menu with short delay to allow for menu interactions
    setTimeout(() => {
      showCommandSuggestions.value = false
      commandSuggestions.value = []
    }, 150)
  }

  // Handle command suggestion selection
  function selectCommandSuggestion(command) {
    searchQuery.value = `/${command.key}`
    showCommandSuggestions.value = false
    handleSearch()
  }

  // Handle menu state changes
  function handleMenuUpdate(isOpen) {
    if (!isOpen) {
      showCommandSuggestions.value = false
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
    // Initialize command palette
    await commandPaletteService.initialize()
    
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
      @focus="handleFocus"
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
      @focus="handleFocus"
      @keydown.enter="handleSearch"
      @keydown.esc="handleBlurSearch"
    />

    <!-- Command Suggestions Dropdown -->
    <v-menu
      v-if="showCommandSuggestions && commandSuggestions.length > 0"
      v-model="showCommandSuggestions"
      :activator="searchInputRef"
      :close-on-back="false"
      :close-on-content-click="false"
      location="bottom start"
      max-width="400"
      :no-click-animation="true"
      offset="4"
      :persistent="true"
      @update:model-value="handleMenuUpdate"
    >
      <v-card @click.stop @mousedown.stop>
        <v-card-title class="pa-3 pb-1">
          <v-icon class="mr-2" icon="mdi-flash" size="16" />
          Commands
        </v-card-title>
        <v-list density="compact">
          <v-list-item
            v-for="command in commandSuggestions.slice(0, 8)"
            :key="command.key"
            class="px-3"
            @click.stop="selectCommandSuggestion(command)"
            @mousedown.stop.prevent
          >
            <template #prepend>
              <v-chip
                class="mr-3"
                color="primary"
                size="x-small"
                variant="outlined"
              >
                /{{ command.key }}
              </v-chip>
            </template>
            <v-list-item-title>{{ command.description }}</v-list-item-title>
            <template #append>
              <v-chip
                v-if="command.isCustom"
                color="secondary"
                size="x-small"
                variant="tonal"
              >
                Custom
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
        <v-card-actions class="pa-2">
          <v-spacer />
          <div class="text-caption text-medium-emphasis">
            Press Enter to execute command
          </div>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
}
</style>