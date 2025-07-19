// src/composables/useNumericPagination.js
import { onMounted, onUnmounted, ref } from 'vue'

export function useNumericPagination (updatePage, getTotalPages, isDialogOpen) {
  const numberBuffer = ref('')
  const errorMessage = ref('')
  const numberTimeout = ref(null)
  const errorTimeout = ref(null)
  const SEQUENCE_TIMEOUT = 1500 // 1.5 seconds to complete number sequence
  const ERROR_DISPLAY_TIMEOUT = 3000 // 3 seconds to show error

  function clearNumberBuffer () {
    numberBuffer.value = ''
    if (numberTimeout.value) {
      clearTimeout(numberTimeout.value)
      numberTimeout.value = null
    }
  }

  function clearErrorMessage () {
    errorMessage.value = ''
    if (errorTimeout.value) {
      clearTimeout(errorTimeout.value)
      errorTimeout.value = null
    }
  }

  function showError (message) {
    clearErrorMessage()
    errorMessage.value = message

    errorTimeout.value = setTimeout(() => {
      clearErrorMessage()
    }, ERROR_DISPLAY_TIMEOUT)
  }

  function isInFormInput () {
    const activeElement = document.activeElement
    if (!activeElement) {
      return false
    }

    // Check if focused on any input element
    const inputTags = ['INPUT', 'TEXTAREA', 'SELECT']
    if (inputTags.includes(activeElement.tagName)) {
      return true
    }

    // Check for contenteditable elements
    if (activeElement.contentEditable === 'true') {
      return true
    }

    // Check for Vuetify input components (they often use nested input elements)
    if (activeElement.closest('.v-field__input')
      || activeElement.closest('.v-text-field')
      || activeElement.closest('.v-textarea')
      || activeElement.closest('.v-select')
      || activeElement.closest('.v-autocomplete')
      || activeElement.closest('.v-combobox')
      || activeElement.closest('.v-color-picker')
      || activeElement.closest('[role="textbox"]')
      || activeElement.closest('[role="combobox"]')
      || activeElement.closest('[role="searchbox"]')) {
      return true
    }

    // Check if we're in a dialog with form inputs
    const dialog = activeElement.closest('.v-dialog')
    if (dialog) {
      // If we're in a dialog and there are any input fields, be more cautious
      const hasInputs = dialog.querySelector('input, textarea, select, [contenteditable="true"], .v-field__input')
      if (hasInputs) {
        return true
      }
    }

    return false
  }

  function handleNumberInput (digit) {
    // Don't handle if any dialogs are open
    if (isDialogOpen && isDialogOpen()) {
      return
    }

    // Don't handle if focused on any form input
    if (isInFormInput()) {
      return
    }

    // Clear any existing error message when starting new input
    clearErrorMessage()

    // Add digit to buffer
    numberBuffer.value += digit

    // Clear any existing timeout
    if (numberTimeout.value) {
      clearTimeout(numberTimeout.value)
    }

    // Set new timeout to execute the page change
    numberTimeout.value = setTimeout(() => {
      const pageNumber = Number.parseInt(numberBuffer.value)
      const totalPages = getTotalPages()

      console.log(`🔢 Numeric pagination: Attempting to go to page ${pageNumber} of ${totalPages}`)

      if (pageNumber > 0 && pageNumber <= totalPages) {
        console.log(`✅ Valid page number, calling updatePage(${pageNumber})`)
        updatePage(pageNumber)
      } else {
        console.log(`❌ Invalid page number: ${pageNumber} (total pages: ${totalPages})`)
        showError(`Invalid page ${pageNumber} (total: ${totalPages})`)
      }

      clearNumberBuffer()
    }, SEQUENCE_TIMEOUT)
  }

  function handleKeydown (event) {
    // Only handle single digit keys 1-9 (not numpad)
    if (event.key >= '1' && event.key <= '9' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      // Additional check: don't interfere with form inputs
      if (isInFormInput()) {
        return // Let the input handle the number normally
      }

      event.preventDefault()
      handleNumberInput(event.key)
    }

    // Clear buffer and error on Escape
    if (event.key === 'Escape') {
      clearNumberBuffer()
      clearErrorMessage()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    clearNumberBuffer()
    clearErrorMessage()
  })

  return {
    numberBuffer,
    errorMessage,
    clearNumberBuffer,
    clearErrorMessage,
  }
}
