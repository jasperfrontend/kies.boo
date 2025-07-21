// src/composables/useBookmarkSwipe.js
import { ref } from 'vue'

export function useBookmarkSwipe(serverOptions, totalItems, emit) {
  // Swipe feedback state
  const swipeFeedback = ref({
    show: false,
    message: '',
  })

  let swipeFeedbackTimeout = null

  function swipeToNextPage() {
    const currentPage = serverOptions.value.page
    const totalPages = Math.ceil(totalItems.value / serverOptions.value.itemsPerPage)

    if (currentPage < totalPages) {
      emit('update-page', currentPage + 1)
      showSwipeFeedback('Next page')
    }
  }

  function swipeToPrevPage() {
    const currentPage = serverOptions.value.page

    if (currentPage > 1) {
      emit('update-page', currentPage - 1)
      showSwipeFeedback('Previous page')
    }
  }

  function showSwipeFeedback(message) {
    swipeFeedback.value = {
      show: true,
      message,
    }

    if (swipeFeedbackTimeout) {
      clearTimeout(swipeFeedbackTimeout)
    }

    swipeFeedbackTimeout = setTimeout(() => {
      swipeFeedback.value.show = false
    }, 1000)
  }

  return {
    swipeFeedback,
    swipeToNextPage,
    swipeToPrevPage,
    showSwipeFeedback,
  }
}