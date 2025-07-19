// Handle escape key<script setup>
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
  const isMenuOpen = ref(false)
  const isMouseDown = ref(false)
  const focusTimeoutId = ref(null)
  const blurTimeoutId = ref(null)
  const clickInProgress = ref(false)

  // Handle search submission
  async function handleSearch () {
    console.log('🚀 HANDLE SEARCH CALLED')
    console.log('  - Search query:', searchQuery.value)

    if (!searchQuery.value.trim()) {
      console.log('  - Empty query, returning')
      return
    }

    // Check if it's a command
    if (commandPaletteService.isCommand(searchQuery.value)) {
      console.log('  - Is a command, executing...')
      const executed = await commandPaletteService.executeCommand(searchQuery.value, router)
      if (executed) {
        console.log('  - Command executed successfully, clearing search')
        // Command executed successfully, clear search and blur
        handleBlurSearch()
        return
      }
      console.log('  - Command failed, falling through to normal search')
      // Command failed, fall through to normal search
    }

    // Normal search behavior
    if (searchQuery.value.trim()) {
      console.log('  - Performing normal search, navigating to:', `/search/${encodeURIComponent(searchQuery.value.trim())}`)
      router.push(`/search/${encodeURIComponent(searchQuery.value.trim())}`)
      handleBlurSearch()
    }
  }

  // Handle focus search hotkey event
  function handleFocusSearch () {
    searchInputRef.value?.focus()
  }

  function handleBlurSearch () {
    console.log('🚫 HANDLE BLUR SEARCH CALLED')
    console.log('  - Clearing search query and hiding menu')

    // Clear any pending timeouts
    if (focusTimeoutId.value) {
      clearTimeout(focusTimeoutId.value)
      focusTimeoutId.value = null
    }
    if (blurTimeoutId.value) {
      clearTimeout(blurTimeoutId.value)
      blurTimeoutId.value = null
    }

    searchQuery.value = ''
    searchInputRef.value?.blur()
    showCommandSuggestions.value = false
    isMenuOpen.value = false
    console.log('  - Final state: showCommandSuggestions =', showCommandSuggestions.value)
  }

  // Watch for command input to filter suggestions
  watch(searchQuery, (newValue, oldValue) => {
    console.log('🔍 SEARCH QUERY CHANGED')
    console.log('  - Old value:', oldValue)
    console.log('  - New value:', newValue)

    if (commandPaletteService.isCommand(newValue)) {
      const commandPart = newValue.slice(1) // Remove prefix
      console.log('  - Is command, filtering for:', commandPart)
      commandSuggestions.value = commandPaletteService.getCommandSuggestions(commandPart)
    } else {
      console.log('  - Not a command, showing all commands')
      // Show all commands when not typing a command
      commandSuggestions.value = commandPaletteService.getAllCommands()
    }
    console.log('  - Updated suggestions count:', commandSuggestions.value.length)
  })

  // Handle mouse events to prevent blur during click
  function handleMouseDown () {
    console.log('🖱️ MOUSE DOWN EVENT')
    isMouseDown.value = true
    clickInProgress.value = true

    // Clear any pending blur timeout
    if (blurTimeoutId.value) {
      console.log('  - Clearing existing blur timeout')
      clearTimeout(blurTimeoutId.value)
      blurTimeoutId.value = null
    }
  }

  function handleMouseUp () {
    console.log('🖱️ MOUSE UP EVENT')
    isMouseDown.value = false

    // Keep click in progress for a bit longer to prevent immediate blur
    setTimeout(() => {
      clickInProgress.value = false
      console.log('  - Click sequence completed')
    }, 100)
  }

  // Handle actual click event (this fires after focus/blur)
  function handleClick () {
    console.log('👆 CLICK EVENT TRIGGERED')
    console.log('  - Current showCommandSuggestions:', showCommandSuggestions.value)

    // If menu is already showing, don't interfere
    if (showCommandSuggestions.value) {
      console.log('  - Menu already showing, ignoring click')
      return
    }

    // Force show the menu on click
    commandSuggestions.value = commandPaletteService.getAllCommands()
    showCommandSuggestions.value = true
    console.log('  - Forced menu to show via click handler')
  }

  // Handle input focus - show all commands
  function handleFocus (event) {
    console.log('🎯 FOCUS EVENT TRIGGERED')
    console.log('  - Event type:', event.type)
    console.log('  - Target:', event.target)
    console.log('  - Related target:', event.relatedTarget)
    console.log('  - Current showCommandSuggestions:', showCommandSuggestions.value)
    console.log('  - Current isMenuOpen:', isMenuOpen.value)
    console.log('  - Mouse is down:', isMouseDown.value)

    // Clear any pending focus timeout
    if (focusTimeoutId.value) {
      clearTimeout(focusTimeoutId.value)
      focusTimeoutId.value = null
    }

    commandSuggestions.value = commandPaletteService.getAllCommands()
    console.log('  - Command suggestions loaded:', commandSuggestions.value.length)

    // Show menu immediately, don't wait for timeout
    console.log('  - Setting showCommandSuggestions to true immediately')
    showCommandSuggestions.value = true
    console.log('  - showCommandSuggestions is now:', showCommandSuggestions.value)
  }

  // Handle input blur - hide suggestions with proper delay
  function handleBlur (event) {
    console.log('❌ BLUR EVENT TRIGGERED')
    console.log('  - Event type:', event.type)
    console.log('  - Target:', event.target)
    console.log('  - Related target:', event.relatedTarget)
    console.log('  - Current showCommandSuggestions:', showCommandSuggestions.value)
    console.log('  - Current isMenuOpen:', isMenuOpen.value)
    console.log('  - Mouse is down:', isMouseDown.value)
    console.log('  - Click in progress:', clickInProgress.value)

    // If mouse is down or click is in progress, ignore this blur event
    if (isMouseDown.value || clickInProgress.value) {
      console.log('  - BLUR IGNORED: Mouse/click activity detected')
      return
    }

    // Clear any pending focus timeout
    if (focusTimeoutId.value) {
      console.log('  - Clearing pending focus timeout')
      clearTimeout(focusTimeoutId.value)
      focusTimeoutId.value = null
    }

    // Don't hide if the blur is caused by clicking on the menu or its contents
    const relatedTarget = event.relatedTarget
    if (relatedTarget) {
      console.log('  - Related target element:', relatedTarget)
      console.log('  - Closest .v-menu:', relatedTarget.closest('.v-menu'))
      console.log('  - Closest .v-overlay:', relatedTarget.closest('.v-overlay'))
      console.log('  - Closest [role="menu"]:', relatedTarget.closest('[role="menu"]'))

      if (relatedTarget.closest('.v-menu')
        || relatedTarget.closest('.v-overlay')
        || relatedTarget.closest('[role="menu"]')) {
        console.log('  - BLUR IGNORED: Click was on menu element')
        return
      }
    }

    console.log('  - Setting timeout to hide menu in 200ms')
    // Shorter delay but more reliable hiding
    blurTimeoutId.value = setTimeout(() => {
      console.log('  - TIMEOUT EXECUTED: Hiding menu unconditionally')
      showCommandSuggestions.value = false
      isMenuOpen.value = false
    }, 200)
  }

  // Handle command suggestion selection
  function selectCommandSuggestion (command) {
    console.log('Command suggestion selected:', command.key)
    searchQuery.value = `/${command.key}`
    showCommandSuggestions.value = false
    isMenuOpen.value = false
    handleSearch()
  }

  // Handle menu state changes
  function handleMenuUpdate (isOpen) {
    console.log('Menu state changed:', isOpen)
    isMenuOpen.value = isOpen
    if (!isOpen) {
      showCommandSuggestions.value = false
    }
  }

  // Add window blur handler to hide menu when switching tabs
  function handleWindowBlur () {
    console.log('🪟 WINDOW BLUR - hiding command palette')
    showCommandSuggestions.value = false
    isMenuOpen.value = false

    // Clear any pending timeouts
    if (focusTimeoutId.value) {
      clearTimeout(focusTimeoutId.value)
      focusTimeoutId.value = null
    }
    if (blurTimeoutId.value) {
      clearTimeout(blurTimeoutId.value)
      blurTimeoutId.value = null
    }
  }
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

    // Clean up any pending timeouts
    if (focusTimeoutId.value) {
      clearTimeout(focusTimeoutId.value)
    }
    if (blurTimeoutId.value) {
      clearTimeout(blurTimeoutId.value)
    }
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
      @click="handleClick"
      @focus="handleFocus"
      @keydown.enter="handleSearch"
      @keydown.esc="handleBlurSearch"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
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
      @click="handleClick"
      @focus="handleFocus"
      @keydown.enter="handleSearch"
      @keydown.esc="handleBlurSearch"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
    />

    <!-- Command Suggestions Dropdown -->
    <v-menu
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
