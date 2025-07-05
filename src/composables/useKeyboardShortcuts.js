import { onMounted, onUnmounted } from 'vue';

export function useKeyboardShortcuts(callbacks) {
  const handleKeydown = (event) => {
    // Alt+a to add bookmark
    if (event.altKey && event.key === 'a') {
      event.preventDefault();
      callbacks.onAddBookmark?.();
    }
    
    // Alt+i to delete selected items
    if (event.altKey && event.key === 'i') {
      event.preventDefault();
      callbacks.onDeleteSelected?.();
    }
    
    // Alt+u to undo delete
    if (event.altKey && event.key === 'u') {
      event.preventDefault();
      callbacks.onUndoDelete?.();
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  return {
    handleKeydown
  };
}