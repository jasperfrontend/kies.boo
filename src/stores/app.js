// src/stores/app.js
import { defineStore } from 'pinia'
import supabase from '@/lib/supabaseClient'

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
    
    // Saved searches state
    savedSearches: [],
    savedSearchesLoaded: false,
  }),
  
  getters: {
    isPathSaved: (state) => {
      return (path) => state.savedSearches.some(search => search.url === path)
    },
    
    getSavedSearchByPath: (state) => {
      return (path) => state.savedSearches.find(search => search.url === path)
    }
  },
  
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
    },
    
    // Saved searches actions
    async loadSavedSearches() {
      try {
        const { data, error } = await supabase
          .from('saved_searches')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error loading saved searches:', error)
          return false
        }
        
        this.savedSearches = data || []
        this.savedSearchesLoaded = true
        return true
      } catch (error) {
        console.error('Error loading saved searches:', error)
        return false
      }
    },
    
    async addSavedSearch(path) {
      try {
        const { data, error } = await supabase
          .from('saved_searches')
          .insert({ url: path })
          .select()
          .single()
        
        if (error) {
          console.error('Error saving search:', error)
          return { success: false, error: error.message }
        }
        
        // Add to local state
        this.savedSearches.unshift(data)
        return { success: true, data }
      } catch (error) {
        console.error('Error saving search:', error)
        return { success: false, error: error.message }
      }
    },
    
    async removeSavedSearch(path) {
      try {
        const { error } = await supabase
          .from('saved_searches')
          .delete()
          .eq('url', path)
        
        if (error) {
          console.error('Error removing saved search:', error)
          return { success: false, error: error.message }
        }
        
        // Remove from local state
        this.savedSearches = this.savedSearches.filter(search => search.url !== path)
        return { success: true }
      } catch (error) {
        console.error('Error removing saved search:', error)
        return { success: false, error: error.message }
      }
    },
    
    // Initialize saved searches if not loaded
    async ensureSavedSearchesLoaded() {
      if (!this.savedSearchesLoaded) {
        await this.loadSavedSearches()
      }
    }
  }
})