import { computed } from 'vue'

export function useTableSelection(bookmarks, selectedItems, emit) {
  const isAllSelected = computed(() => {
    return bookmarks.value.length > 0 && selectedItems.value.length === bookmarks.value.length
  })

  const isIndeterminate = computed(() => {
    return selectedItems.value.length > 0 && selectedItems.value.length < bookmarks.value.length
  })

  function toggleSelectAll() {
    if (isAllSelected.value) {
      emit('update:selected-items', [])
    } else {
      emit('update:selected-items', [...bookmarks.value.map(item => item.id)])
    }
  }

  function toggleItemSelection(itemId) {
    const newSelection = [...selectedItems.value]
    const index = newSelection.indexOf(itemId)
    if (index > -1) {
      newSelection.splice(index, 1)
    } else {
      newSelection.push(itemId)
    }
    emit('update:selected-items', newSelection)
  }

  return {
    isAllSelected,
    isIndeterminate,
    toggleSelectAll,
    toggleItemSelection
  }
}