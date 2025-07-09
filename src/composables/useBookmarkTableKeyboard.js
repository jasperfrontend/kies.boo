import { ref, onMounted, onUnmounted } from 'vue'

export function useBookmarkTableKeyboard(bookmarks, selectedItems, toggleItemSelection, dialogsOpen) {
  const focusedRowIndex = ref(-1)

  const handleKeydown = (event) => {
    // Only handle keyboard navigation when no dialogs are open
    const anyDialogOpen = Object.values(dialogsOpen.value).some(isOpen => isOpen)
    if (anyDialogOpen) return

    const bookmarkCount = bookmarks.value.length

    // Tab to focus on table rows
    if (event.key === 'Tab' && !event.shiftKey && bookmarkCount > 0) {
      event.preventDefault()
      focusedRowIndex.value = focusedRowIndex.value < bookmarkCount - 1 
        ? focusedRowIndex.value + 1 
        : 0
    }
    
    // Shift+Tab to go backwards through table rows
    if (event.key === 'Tab' && event.shiftKey && bookmarkCount > 0) {
      event.preventDefault()
      focusedRowIndex.value = focusedRowIndex.value > 0 
        ? focusedRowIndex.value - 1 
        : bookmarkCount - 1
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
      focusedRowIndex.value = focusedRowIndex.value < bookmarkCount - 1 
        ? focusedRowIndex.value + 1 
        : 0
    }
    
    if (event.key === 'ArrowUp' && bookmarkCount > 0) {
      event.preventDefault()
      focusedRowIndex.value = focusedRowIndex.value > 0 
        ? focusedRowIndex.value - 1 
        : bookmarkCount - 1
    }

    if (event.key === 'ArrowLeft' && bookmarkCount > 0) {
      event.preventDefault()
      focusedRowIndex.value = -1
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    focusedRowIndex
  }
}