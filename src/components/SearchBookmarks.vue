<script setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useHotkey, useDisplay } from 'vuetify'
  import commandPaletteService from '@/lib/commandPaletteService'

  const router = useRouter()
  const searchInputRef = ref(null)
  const searchQuery = ref('')
  const mobile = useDisplay()
  const showCommandSuggestions = ref(false)
  const commandSuggestions = ref([])
  const isMenuOpen = ref(false)

  // Handle search submission
  async function handleSearch() {
    if (!searchQuery.value.trim()) return

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
    isMenuOpen.value = false
  }

  // Watch for command input to filter suggestions
  watch(searchQuery, (newValue) => {
    if (commandPaletteService.isCommand(newValue)) {
      const commandPart = newValue.slice(1) // Remove prefix
      commandSuggestions.value = commandPaletteService.getCommandSuggestions(commandPart)
    } else {
      // Show all commands when not typing a command
      commandSuggestions.value = commandPaletteService.getAllCommands()
    }
  })

  // Handle input focus - show all commands
  function handleFocus() {
    console.log('Search input focused')
    commandSuggestions.value = commandPaletteService.getAllCommands()
    showCommandSuggestions.value = true
    isMenuOpen.value = true
  }

  // Handle input blur - hide suggestions with delay
  function handleBlur() {
    console.log('Search input blurred')
    // Longer delay to allow click on suggestions
    setTimeout(() => {
      if (!isMenuOpen.value) {
        showCommandSuggestions.value = false
      }
    }, 200)
  }

  // Handle command suggestion selection
  function selectCommandSuggestion(command) {
    console.log('Command suggestion selected:', command.key)
    searchQuery.value = `/${command.key}`
    showCommandSuggestions.value = false
    isMenuOpen.value = false
    handleSearch()
  }

  // Handle menu state changes
  function handleMenuUpdate(isOpen) {
    console.log('Menu state changed:', isOpen)
    isMenuOpen.value = isOpen
    if (!isOpen) {
      showCommandSuggestions.value = false
    }
  }

  // Handle escape key
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
  })

  onUnmounted(() => {
    document.removeEventListener('focus-search', handleFocusSearch)
  })
</script>

<template>
  <div class="search-container">
    <v-text-field
      v-if="mobile === true"
      ref="searchInputRef"
      v-model="searchQuery"
      clearable
      density="compact"
      hide-details
      :autofocus
      label="Find bookmarks or use /commands"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      @focus="handleFocus"
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
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.enter="handleSearch"
      @keydown.esc="handleBlurSearch"
    />

    <!-- Command Suggestions Dropdown -->
    <v-menu
      v-model="showCommandSuggestions"
      :activator="searchInputRef"
      location="bottom start"
      :close-on-content-click="false"
      max-width="400"
      offset="4"
      :persistent="true"
      @update:model-value="handleMenuUpdate"
    >
      <v-card>
        <v-card-title class="pa-3 pb-1">
          <v-icon class="mr-2" icon="mdi-flash" size="16" />
          Commands
        </v-card-title>
        <v-list density="compact">
          <v-list-item
            v-for="command in commandSuggestions.slice(0, 8)"
            :key="command.key"
            class="px-3"
            @click="selectCommandSuggestion(command)"
            @mousedown.prevent
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