// src/composables/useNumericPagination.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useNumericPagination(updatePage, getTotalPages, isDialogOpen) {
  const numberBuffer = ref('')
  const numberTimeout = ref(null)
  const SEQUENCE_TIMEOUT = 1500 // 1.5 seconds to complete number sequence

  function clearNumberBuffer() {
    numberBuffer.value = ''
    if (numberTimeout.value) {
      clearTimeout(numberTimeout.value)
      numberTimeout.value = null
    }
  }

  function handleNumberInput(digit) {
    // Don't handle if any dialogs are open
    if (isDialogOpen && isDialogOpen()) {
      return
    }

    // Don't handle if focused on an input element
    const activeElement = document.activeElement
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.contentEditable === 'true' ||
      activeElement.closest('.v-field__input') ||
      activeElement.closest('.v-text-field')
    )) {
      return
    }

    // Add digit to buffer
    numberBuffer.value += digit

    // Clear any existing timeout
    if (numberTimeout.value) {
      clearTimeout(numberTimeout.value)
    }

    // Set new timeout to execute the page change
    numberTimeout.value = setTimeout(() => {
      const pageNumber = parseInt(numberBuffer.value)
      const totalPages = getTotalPages()
      
      if (pageNumber > 0 && pageNumber <= totalPages) {
        updatePage(pageNumber)
      }
      
      clearNumberBuffer()
    }, SEQUENCE_TIMEOUT)
  }

  function handleKeydown(event) {
    // Only handle single digit keys 1-9 (not numpad)
    if (event.key >= '1' && event.key <= '9' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault()
      handleNumberInput(event.key)
    }
    
    // Clear buffer on Escape
    if (event.key === 'Escape') {
      clearNumberBuffer()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    clearNumberBuffer()
  })

  return {
    numberBuffer,
    clearNumberBuffer
  }
}