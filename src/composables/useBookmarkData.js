import { ref, watch } from 'vue'
import supabase from '@/lib/supabaseClient'

export function useBookmarkData(appStore, searchType = 'all', searchTerm = '') {
  const loading = ref(false)
  const bookmarks = ref([])
  const totalItems = ref(0)
  const serverOptions = ref({
    page: 1,
    itemsPerPage: 15,
    sortBy: [{ key: 'created_at', order: 'desc' }]
  })

  // Helper function to get the actual values (handles both refs and primitive values)
  const getSearchType = () => {
    return typeof searchType === 'object' && searchType.value !== undefined ? searchType.value : searchType
  }
  
  const getSearchTerm = () => {
    return typeof searchTerm === 'object' && searchTerm.value !== undefined ? searchTerm.value : searchTerm
  }

  // Watch for bookmark refresh trigger
  watch(() => appStore.bookmarkRefreshTrigger, () => {
    loadBookmarks()
  })

  // Watch for search parameter changes and reset pagination
  watch(() => [getSearchType(), getSearchTerm()], () => {
    // Reset to first page when search parameters change
    serverOptions.value = {
      ...serverOptions.value,
      page: 1
    }
    loadBookmarks()
  }, { immediate: false })

  // Function to reset pagination (can be called externally)
  function resetPagination() {
    serverOptions.value = {
      ...serverOptions.value,
      page: 1
    }
  }

  // Server-side data loading
  async function loadBookmarks() {
    loading.value = true
    
    try {
      const { page, itemsPerPage, sortBy } = serverOptions.value
      const currentSearchType = getSearchType()
      const currentSearchTerm = getSearchTerm()
      
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
      
      // Apply search based on type
      if (currentSearchTerm && currentSearchTerm.trim()) {
        const term = currentSearchTerm.trim()
        
        if (currentSearchType === 'search') {
          // Search in title and URL only
          query = query.or(`title.ilike.%${term}%,url.ilike.%${term}%`)
        } else if (currentSearchType === 'tag') {
          // For tag search, we need to join with bookmark_tags and filter by tag title
          // First, get all bookmark IDs that have this tag
          const { data: bookmarkIdsWithTag, error: tagError } = await supabase
            .from('bookmark_tags')
            .select(`
              bookmark_id,
              tags!inner(title)
            `)
            .ilike('tags.title', term)

          if (tagError) {
            console.error('Error fetching bookmarks by tag:', tagError)
            throw tagError
          }

          // Extract bookmark IDs
          const bookmarkIds = (bookmarkIdsWithTag || []).map(bt => bt.bookmark_id)
          
          if (bookmarkIds.length === 0) {
            // No bookmarks found with this tag
            bookmarks.value = []
            totalItems.value = 0
            loading.value = false
            return
          }

          // Filter the main query to only include these bookmark IDs
          query = query.in('id', bookmarkIds)
        }
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

  return {
    loading,
    bookmarks,
    totalItems,
    serverOptions,
    loadBookmarks,
    updateServerOptions,
    resetPagination
  }
}