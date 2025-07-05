// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // Search state
    bookmarkSearch: '',
    
    // Add bookmark dialog state
    addBookmarkDialog: false,
    
    // Selected items state
    selectedItems: [],
    
    // Deleting state
    deleting: false,
    
    // Bookmark refresh trigger
    bookmarkRefreshTrigger: 0,
  }),
  
  actions: {
    setBookmarkSearch(value) {
      this.bookmarkSearch = value
    },
    
    openAddBookmarkDialog() {
      this.addBookmarkDialog = true
    },
    
    closeAddBookmarkDialog() {
      this.addBookmarkDialog = false
    },
    
    toggleAddBookmarkDialog() {
      this.addBookmarkDialog = !this.addBookmarkDialog
    },
    
    setSelectedItems(items) {
      this.selectedItems = items
    },
    
    clearSelectedItems() {
      this.selectedItems = []
    },
    
    setDeleting(value) {
      this.deleting = value
    },
    
    triggerBookmarkRefresh() {
      this.bookmarkRefreshTrigger++
    }
  }
})