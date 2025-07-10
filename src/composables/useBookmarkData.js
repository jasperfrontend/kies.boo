import { ref, watch } from 'vue'
import supabase from '@/lib/supabaseClient'

export function useBookmarkData(appStore) {
  const loading = ref(false)
  const bookmarks = ref([])
  const totalItems = ref(0)
  const serverOptions = ref({
    page: 1,
    itemsPerPage: 15,
    sortBy: [{ key: 'created_at', order: 'desc' }],
    search: ''
  })

  // Debounced search state
  const searchTimeout = ref(null)
  const skipNextDebouncedSearch = ref(false)

  // Watch for search changes from the store with debouncing
  watch(() => appStore.bookmarkSearch, (newSearch) => {
    // Clear any existing timeout
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    
    // Skip debounced search if we just did an immediate search
    if (skipNextDebouncedSearch.value) {
      skipNextDebouncedSearch.value = false
      return
    }
    
    // Set up new timeout for debounced search
    searchTimeout.value = setTimeout(() => {
      serverOptions.value.search = newSearch
      serverOptions.value.page = 1 // Reset to first page when searching
      loadBookmarks()
    }, 1000) // 1000ms delay
  })

  // Watch for bookmark refresh trigger
  watch(() => appStore.bookmarkRefreshTrigger, () => {
    loadBookmarks()
  })

  // Server-side data loading
  async function loadBookmarks() {
    loading.value = true
    
    try {
      const { page, itemsPerPage, sortBy, search } = serverOptions.value
      
      // Build the query
      let query = supabase
        .from('bookmarks')
        .select(`
          id,
          url,
          title,
          favicon,
          created_at,
          bookmark_tags ( 
            tags (
              id,
              title
            )
          )
        `, { count: 'exact' })
      
      // Apply search if provided
      if (search && search.trim()) {
        const searchTerm = search.trim()
        const { data, error } = await supabase.rpc('search_bookmarks', { term: searchTerm })

        if (error) {
          console.error(error)
          throw error
        }

        bookmarks.value = (data || []).map(b => ({
          ...b,
          tags: (b.bookmark_tags || []).map(bt => bt.tags?.title).filter(Boolean)
        }))
        totalItems.value = data?.length || 0
        return // <- important!
      }
      
      // Apply sorting
      if (sortBy && sortBy.length > 0) {
        const sort = sortBy[0]
        query = query.order(sort.key, { ascending: sort.order === 'asc' })
      } else {
        // Default sort by created_at desc
        query = query.order('created_at', { ascending: false })
      }
      
      // Apply pagination (handle "show all" case)
      if (itemsPerPage !== -1) {
        const from = (page - 1) * itemsPerPage
        const to = from + itemsPerPage - 1
        query = query.range(from, to)
      }
      // If itemsPerPage is -1, don't apply range() to get all items
      
      const { data, error, count } = await query
      
      if (error) {
        console.error('Error loading bookmarks:', error)
        throw error
      }
      
      bookmarks.value = (data || []).map(b => ({
        ...b,
        tags: (b.bookmark_tags || []).map(bt => bt.tags?.title).filter(Boolean)
      }))
      totalItems.value = count || 0
      
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
      bookmarks.value = []
      totalItems.value = 0
    } finally {
      loading.value = false
    }
  }

  // Handle server options update (pagination, sorting, etc.)
  function updateServerOptions(newOptions) {
    serverOptions.value = { ...serverOptions.value, ...newOptions }
    loadBookmarks()
  }

  // NEW: Trigger immediate search (for programmatic search changes)
  function triggerImmediateSearch() {
    // Clear any existing timeout
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    
    // Set flag to skip the next debounced search
    skipNextDebouncedSearch.value = true
    
    // Update server options and search immediately
    serverOptions.value.search = appStore.bookmarkSearch
    serverOptions.value.page = 1
    loadBookmarks()
  }

  // Cleanup function
  function cleanup() {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
  }

  return {
    loading,
    bookmarks,
    totalItems,
    serverOptions,
    loadBookmarks,
    updateServerOptions,
    triggerImmediateSearch, // NEW: Export the immediate search function
    cleanup
  }
}