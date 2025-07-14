// src/composables/useAppHotkeys.js
import { useHotkey } from 'vuetify'
import { ref, computed } from 'vue'

// Global state for hotkey management
const showShortcutsDialog = ref(false)
const currentDialogState = ref({
  addBookmark: false,
  editBookmark: false,
  details: false
})

export function useAppHotkeys(router, appStore) {
  // Navigation shortcuts (G-based sequences)
  const setupNavigationHotkeys = () => {
    // G then B - Go to bookmarks (home)
    useHotkey('g-b', () => {
      router.push('/')
    }, { 
      inputs: false,
      sequenceTimeout: 1000
    })

    // G then T - Go to tags
    useHotkey('g-t', () => {
      router.push('/hellotags')
    }, { 
      inputs: false,
      sequenceTimeout: 1000
    })

    // G then P - Go to saved paths
    useHotkey('g-p', () => {
      router.push('/saved-searches')
    }, { 
      inputs: false,
      sequenceTimeout: 1000
    })

    // G then U - Open user profile menu
    useHotkey('g-u', () => {
      // Emit event to open profile menu in AppTopBar
      document.dispatchEvent(new CustomEvent('open-profile-menu'))
    }, { 
      inputs: false,
      sequenceTimeout: 1000
    })
  }

  // Global action shortcuts
  const setupGlobalHotkeys = () => {
    // Ctrl+I - Add bookmark (was Alt+A)
    useHotkey('ctrl+i', () => {
      appStore.openAddBookmarkDialog()
    }, { 
      inputs: false
    })

    // Ctrl+A - Select all in bookmark table
    useHotkey('ctrl+a', (e) => {
      // Only trigger if we're on a page with a bookmark table
      const isBookmarkPage = ['/', '/search', '/tag'].some(path => 
        router.currentRoute.value.path.startsWith(path)
      )
      
      if (isBookmarkPage) {
        document.dispatchEvent(new CustomEvent('select-all-bookmarks'))
      }
    }, { 
      inputs: false
    })

    // Ctrl+Delete - Delete selected items
    useHotkey('ctrl+delete', () => {
      document.dispatchEvent(new CustomEvent('delete-selected-bookmarks'))
    }, { 
      inputs: true
    })

    // Ctrl+S - Save current action
    useHotkey('ctrl+s', (e) => {
      document.dispatchEvent(new CustomEvent('save-current-action'))
    }, { 
      inputs: true, // Allow in inputs for form saving
      preventDefault: true
    })

    // Ctrl+/ - Show shortcuts dialog
    useHotkey('ctrl+/', (e) => {
      // Prevent double firing by checking if already open
      if (!showShortcutsDialog.value) {
        showShortcutsDialog.value = true
      }
    }, { 
      inputs: false
    })

    // F - Focus search
    useHotkey('f', () => {
      document.dispatchEvent(new CustomEvent('focus-search'))
    }, { 
      inputs: false
    })
  }

  // Table navigation shortcuts (these need to be context-aware)
  const setupTableHotkeys = () => {
    // Tab - Navigate through table rows
    useHotkey('tab', (e) => {
      // Only in bookmark table context and when no dialogs are open
      if (isInTableContext() && !hasOpenDialogs()) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('table-navigate-next'))
      }
    }, { 
      inputs: false
    })

    // Shift+Tab - Navigate backwards
    useHotkey('shift+tab', (e) => {
      if (isInTableContext() && !hasOpenDialogs()) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('table-navigate-prev'))
      }
    }, { 
      inputs: false
    })

    // Space - Select/deselect focused row
    useHotkey('space', (e) => {
      if (isInTableContext() && !hasOpenDialogs()) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('table-toggle-selection'))
      }
    }, { 
      inputs: false
    })

    // Arrow keys for table navigation
    useHotkey('arrowdown', (e) => {
      if (isInTableContext() && !hasOpenDialogs()) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('table-arrow-down'))
      }
    }, { 
      inputs: false
    })

    useHotkey('arrowup', (e) => {
      if (isInTableContext() && !hasOpenDialogs()) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('table-arrow-up'))
      }
    }, { 
      inputs: false
    })

    useHotkey('arrowleft', (e) => {
      if (isInTableContext() && !hasOpenDialogs()) {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('table-clear-focus'))
      }
    }, { 
      inputs: false
    })
  }

  // Helper functions
  const isInTableContext = () => {
    // Check if we're on a page that has bookmark tables
    return ['/', '/search', '/tag'].some(path => router.currentRoute.value.path.startsWith(path))
  }

  const hasOpenDialogs = () => {
    return Object.values(currentDialogState.value).some(isOpen => isOpen)
  }

  // Method to update dialog state from components
  const updateDialogState = (dialogName, isOpen) => {
    currentDialogState.value[dialogName] = isOpen
  }

  // Setup all hotkeys
  const setupHotkeys = () => {
    setupNavigationHotkeys()
    setupGlobalHotkeys()
    setupTableHotkeys()
  }

  return {
    showShortcutsDialog,
    setupHotkeys,
    updateDialogState,
    currentDialogState: computed(() => currentDialogState.value)
  }
}

// Global shortcuts that don't need router context
export function useGlobalHotkeys() {
  return {
    showShortcutsDialog
  }
}