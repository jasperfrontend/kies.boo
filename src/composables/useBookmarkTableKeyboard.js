import { onMounted, onUnmounted, ref } from 'vue'

export function useBookmarkTableKeyboard (
  bookmarks,
  selectedItems,
  toggleItemSelection,
  dialogsOpen,
  router,
  handleEdit,
  handleViewDetails,
) {
  const focusedRowIndex = ref(-1)

  // Function to get the currently focused row element
  function getFocusedRowElement() {
    if (focusedRowIndex.value >= 0) {
      return document.querySelector(`[data-bookmark-row-index="${focusedRowIndex.value}"]`)
    }
    return null
  }

  // Function to focus a specific row and scroll it into view
  function focusRow(index) {
    if (index >= 0 && index < bookmarks.value.length) {
      focusedRowIndex.value = index
      
      // Use nextTick equivalent to ensure DOM is updated
      setTimeout(() => {
        const rowElement = document.querySelector(`[data-bookmark-row-index="${index}"]`)
        if (rowElement) {
          // Focus the row element and scroll it into view
          rowElement.focus({ preventScroll: false })
          
          // Additional scroll into view with smooth behavior
          rowElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          })
        }
      }, 0)
    }
  }

  const handleKeydown = event => {
    // Only handle keyboard navigation when no dialogs are open
    const anyDialogOpen = Object.values(dialogsOpen.value).some(Boolean)
    if (anyDialogOpen) {
      return
    }

    const bookmarkCount = bookmarks.value.length

    // Tab to focus on table rows
    if (event.key === 'Tab' && !event.shiftKey && bookmarkCount > 0) {
      event.preventDefault()
      const newIndex = focusedRowIndex.value < bookmarkCount - 1
        ? focusedRowIndex.value + 1
        : 0
      focusRow(newIndex)
    }

    // Shift+Tab to go backwards through table rows
    if (event.key === 'Tab' && event.shiftKey && bookmarkCount > 0) {
      event.preventDefault()
      const newIndex = focusedRowIndex.value > 0
        ? focusedRowIndex.value - 1
        : bookmarkCount - 1
      focusRow(newIndex)
    }

    // Spacebar to select/deselect focused row
    if (event.key === ' ' && focusedRowIndex.value >= 0) {
      event.preventDefault()
      const item = bookmarks.value[focusedRowIndex.value]
      if (item) {
        toggleItemSelection(item.id)
      }
    }

    // Arrow keys for navigation
    if (event.key === 'ArrowDown' && bookmarkCount > 0) {
      event.preventDefault()
      const newIndex = focusedRowIndex.value < bookmarkCount - 1
        ? focusedRowIndex.value + 1
        : 0
      focusRow(newIndex)
    }

    if (event.key === 'ArrowUp' && bookmarkCount > 0) {
      event.preventDefault()
      const newIndex = focusedRowIndex.value > 0
        ? focusedRowIndex.value - 1
        : bookmarkCount - 1
      focusRow(newIndex)
    }

    if (event.key === 'ArrowLeft' && bookmarkCount > 0) {
      event.preventDefault()
      focusedRowIndex.value = -1
      // Remove focus from any row element
      const focusedElement = document.activeElement
      if (focusedElement && focusedElement.hasAttribute('data-bookmark-row-index')) {
        focusedElement.blur()
      }
    }
  }

  // Keyboard navigation functions
  function handleTableNavigateNext () {
    const bookmarkCount = bookmarks.value.length
    if (!hasOpenDialogs() && bookmarkCount > 0) {
      const newIndex = focusedRowIndex.value < bookmarkCount - 1
        ? focusedRowIndex.value + 1
        : 0
      focusRow(newIndex)
    }
  }

  function handleTableNavigatePrev () {
    const bookmarkCount = bookmarks.value.length
    if (!hasOpenDialogs() && bookmarkCount > 0) {
      const newIndex = focusedRowIndex.value > 0
        ? focusedRowIndex.value - 1
        : bookmarkCount - 1
      focusRow(newIndex)
    }
  }

  function handleTableToggleSelection () {
    if (!hasOpenDialogs() && focusedRowIndex.value >= 0) {
      const item = bookmarks.value[focusedRowIndex.value]
      if (item) {
        toggleItemSelection(item.id)
      }
    }
  }

  function handleTableArrowDown () {
    const bookmarkCount = bookmarks.value.length
    if (!hasOpenDialogs() && bookmarkCount > 0) {
      const newIndex = focusedRowIndex.value < bookmarkCount - 1
        ? focusedRowIndex.value + 1
        : 0
      focusRow(newIndex)
    }
  }

  function handleTableArrowUp () {
    const bookmarkCount = bookmarks.value.length
    if (!hasOpenDialogs() && bookmarkCount > 0) {
      const newIndex = focusedRowIndex.value > 0
        ? focusedRowIndex.value - 1
        : bookmarkCount - 1
      focusRow(newIndex)
    }
  }

  function handleTableClearFocus () {
    if (!hasOpenDialogs()) {
      focusedRowIndex.value = -1
      // Remove focus from any row element
      const focusedElement = document.activeElement
      if (focusedElement && focusedElement.hasAttribute('data-bookmark-row-index')) {
        focusedElement.blur()
      }
    }
  }

  function handleTableEditFocused () {
    if (!hasOpenDialogs() && focusedRowIndex.value >= 0) {
      const item = bookmarks.value[focusedRowIndex.value]
      if (item) {
        handleEdit(item)
      }
    }
  }

  function handleTableViewDetailsFocused () {
    if (!hasOpenDialogs() && focusedRowIndex.value >= 0) {
      const item = bookmarks.value[focusedRowIndex.value]
      if (item) {
        handleViewDetails(item)
      }
    }
  }

  function handleSelectAllBookmarks () {
    // Only trigger if we're on a bookmark table page
    const isBookmarkPage = ['/', '/search', '/tag'].some(path =>
      router.currentRoute.value.path.startsWith(path),
    )

    if (isBookmarkPage) {
      // This will be handled by the parent component's toggleSelectAll
      document.dispatchEvent(new CustomEvent('select-all-internal'))
    }
  }

  function handleDeleteSelectedBookmarks () {
    // Only trigger if we have selected items
    if (selectedItems.value.length > 0) {
      document.dispatchEvent(new CustomEvent('delete-selected-bookmarks-internal'))
    }
  }

  function hasOpenDialogs () {
    return Object.values(dialogsOpen.value).some(Boolean)
  }

  onMounted(() => {
    // Listen for hotkey events
    document.addEventListener('table-navigate-next', handleTableNavigateNext)
    document.addEventListener('table-navigate-prev', handleTableNavigatePrev)
    document.addEventListener('table-toggle-selection', handleTableToggleSelection)
    document.addEventListener('table-arrow-down', handleTableArrowDown)
    document.addEventListener('table-arrow-up', handleTableArrowUp)
    document.addEventListener('table-clear-focus', handleTableClearFocus)
    document.addEventListener('table-edit-focused', handleTableEditFocused)
    document.addEventListener('table-view-details-focused', handleTableViewDetailsFocused)
    document.addEventListener('select-all-bookmarks', handleSelectAllBookmarks)
    document.addEventListener('delete-selected-bookmarks', handleDeleteSelectedBookmarks)
  })

  onUnmounted(() => {
    document.removeEventListener('table-navigate-next', handleTableNavigateNext)
    document.removeEventListener('table-navigate-prev', handleTableNavigatePrev)
    document.removeEventListener('table-toggle-selection', handleTableToggleSelection)
    document.removeEventListener('table-arrow-down', handleTableArrowDown)
    document.removeEventListener('table-arrow-up', handleTableArrowUp)
    document.removeEventListener('table-clear-focus', handleTableClearFocus)
    document.removeEventListener('table-edit-focused', handleTableEditFocused)
    document.removeEventListener('table-view-details-focused', handleTableViewDetailsFocused)
    document.removeEventListener('select-all-bookmarks', handleSelectAllBookmarks)
    document.removeEventListener('delete-selected-bookmarks', handleDeleteSelectedBookmarks)
  })

  return {
    focusedRowIndex,
    focusRow,
  }
}