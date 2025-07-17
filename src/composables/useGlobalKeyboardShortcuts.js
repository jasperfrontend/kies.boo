import { onMounted, onUnmounted, ref } from 'vue'

const showShortcutsDialog = ref(false)

export function useGlobalKeyboardShortcuts () {
  const handleGlobalKeydown = event => {
    // Global shortcut: Ctrl + / to show shortcuts dialog
    if (event.ctrlKey && event.key === '/') {
      event.preventDefault()
      showShortcutsDialog.value = true
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleGlobalKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleGlobalKeydown)
  })

  return {
    showShortcutsDialog,
  }
}
