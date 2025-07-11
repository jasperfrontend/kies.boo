<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h4 mb-4 d-flex align-center">
            <v-icon icon="mdi-magnify-plus" class="mr-3" />
            Your saved <code class="ml-2">/paths</code>
            <v-spacer />
            <v-chip 
              color="primary" 
              variant="tonal" 
              size="small"
            >
              {{ filteredSearches.length }} path{{ filteredSearches.length === 1 ? '' : 's' }}
            </v-chip>
          </v-card-title>
          
          <!-- Search and Filter Controls -->
          <v-card-text class="pb-2">
            <v-row class="mb-4">
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="searchQuery"
                  label="Search saved paths..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  @keydown.enter="focusFirstPath"
                  ref="searchInput"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="sortOption"
                  :items="sortOptions"
                  label="Sort by"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <!-- Quick Filters -->
            <div class="d-flex flex-wrap gap-2 mb-4">
              <v-chip
                :variant="pathTypeFilter === 'tag' ? 'flat' : 'outlined'"
                :color="pathTypeFilter === 'tag' ? 'primary' : 'default'"
                size="small"
                @click="filterByType('tag')"
                class="cursor-pointer"
                prepend-icon="mdi-tag"
              >
                Tags
              </v-chip>
              <v-chip
                :variant="pathTypeFilter === 'search' ? 'flat' : 'outlined'"
                :color="pathTypeFilter === 'search' ? 'primary' : 'default'"
                size="small"
                @click="filterByType('search')"
                class="cursor-pointer"
                prepend-icon="mdi-text-search"
              >
                Searches
              </v-chip>
              <v-chip
                :variant="pathTypeFilter === null ? 'flat' : 'outlined'"
                :color="pathTypeFilter === null ? 'primary' : 'default'"
                size="small"
                @click="clearTypeFilter"
                class="cursor-pointer"
              >
                All
              </v-chip>
            </div>
          </v-card-text>

          <!-- Paths Display -->
          <v-card-text>
            <div v-if="filteredSearches.length === 0 && searchQuery" class="text-center text-grey-darken-1 py-8">
              <v-icon icon="mdi-magnify-off" size="48" class="mb-2" />
              <p class="text-h6">No paths found</p>
              <p class="text-caption">Try adjusting your search or filters</p>
            </div>

            <div v-else-if="filteredSearches.length === 0" class="text-center text-grey-darken-1 py-8">
              <v-icon icon="mdi-magnify-plus-outline" size="48" class="mb-2" />
              <p class="text-h6">No saved paths yet</p>
              <p class="text-caption">Save paths from tag or search result pages to access them quickly later</p>
            </div>

            <!-- Paths Grid -->
            <div v-else class="paths-grid">
              <v-card
                v-for="(search, index) in paginatedSearches"
                :key="search.id || index"
                :ref="el => pathRefs[index] = el"
                class="path-card cursor-pointer"
                variant="outlined"
                hover
                @click="navigateToPath(search.url)"
                :tabindex="0"
                @keydown.enter="navigateToPath(search.url)"
                @keydown.delete="handleDeletePath(search)"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center justify-space-between">
                    <div class="flex-grow-1 mr-2">
                      <div class="d-flex align-center mb-2">
                        <v-icon 
                          :icon="getPathIcon(search.url)" 
                          size="16" 
                          class="mr-2"
                          :color="getPathColor(search.url)"
                        />
                        <v-chip
                          :color="getPathColor(search.url)"
                          size="x-small"
                          variant="tonal"
                        >
                          {{ getPathType(search.url) }}
                        </v-chip>
                      </div>
                      <div class="text-subtitle-1 font-weight-medium mb-1">
                        {{ formatPathDisplay(search.url) }}
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        {{ formatPathDescription(search.url) }}
                      </div>
                      <div class="text-caption text-grey-darken-2 mt-1">
                        Saved {{ formatDate(search.created_at) }}
                      </div>
                    </div>
                    <div class="d-flex align-center">
                      <v-btn
                        @click.stop="handleDeletePath(search)"
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        :title="`Delete path: ${search.url}`"
                      />
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="7"
                color="primary"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Information Section -->
    <v-row justify="center" class="mt-4 mb-16">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h5 mb-4 d-flex align-center">
            <v-icon icon="mdi-information-outline" class="mr-3" />
            What are Saved Paths?
          </v-card-title>
          <v-card-text>
            <p class="mb-4">Saved Paths are like shortcut portals to specific sets of bookmarks.</p>
            <p class="mb-2">They help you quickly jump back to:</p>
            <ul class="ml-4 mt-2 mb-4">
              <li>Search results you found useful (based on keywords in title/URL).</li>
              <li>Tags you've used to group bookmarks.</li>
            </ul>
            
            <p class="mb-4">In short: instead of hunting again, you just click a saved Path and boom—you're back in the zone.</p>

            <h3 class="text-h6 mt-6 mb-2">Tags vs Search (what's the difference?)</h3>
            <p class="mb-2">Tags are labels you manually assign to bookmarks. Think: #reading, #design, #later.</p>
            <p class="mb-2">Search looks at the bookmark's title and URL.</p>
            <p class="mb-4">So while they often overlap, tags are your own organizing system, and search is more like a smart filter.</p>
            
            <h3 class="text-h6 mt-6 mb-2">Why use Paths?</h3>
            <p class="mb-2">Because remembering stuff is overrated.</p>
            <p class="mb-2">If you saved a great search or a useful tag group, just save the Path. Next time, no typing—just click and go.</p>
            <p class="mt-4 font-italic">You kinda just have to experience it to admire its greatness. I guess.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="400" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-delete" class="mr-2" color="error" />
          Confirm Deletion
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to delete this saved path?
          <v-code class="d-block mt-2 pa-2">{{ confirmDialog.path }}</v-code>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="confirmDialog.show = false"
            :disabled="deleting"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            variant="flat"
            @click="confirmDeletePath"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Notification Snackbar -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type"
      :timeout="3000"
      location="bottom right"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="notification.type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'" 
          class="me-2" 
        />
        {{ notification.message }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import supabase from '@/lib/supabaseClient'

const appStore = useAppStore()
const router = useRouter()

// Reactive data
const searchQuery = ref('')
const pathTypeFilter = ref(null)
const sortOption = ref('recent')
const currentPage = ref(1)
const itemsPerPage = 20
const deleting = ref(false)
const searchInput = ref(null)
const pathRefs = ref([])

// Sort options
const sortOptions = [
  { title: 'Most Recent', value: 'recent' },
  { title: 'Oldest First', value: 'oldest' },
  { title: 'Alphabetical (A-Z)', value: 'alphabetical' },
  { title: 'Alphabetical (Z-A)', value: 'alphabetical-desc' },
  { title: 'Type (Tags first)', value: 'type' }
]

// Dialog states
const confirmDialog = ref({
  show: false,
  search: null,
  path: ''
})

// Notification state
const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

// Use the store's saved searches
const savedSearches = computed(() => appStore.savedSearches)

// Computed properties
const filteredSearches = computed(() => {
  let searches = [...savedSearches.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    searches = searches.filter(search => 
      search.url.toLowerCase().includes(query) ||
      formatPathDisplay(search.url).toLowerCase().includes(query) ||
      formatPathDescription(search.url).toLowerCase().includes(query)
    )
  }

  // Apply type filter
  if (pathTypeFilter.value) {
    searches = searches.filter(search => 
      getPathType(search.url).toLowerCase() === pathTypeFilter.value
    )
  }

  // Apply sorting
  switch (sortOption.value) {
    case 'recent':
      searches.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'oldest':
      searches.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'alphabetical':
      searches.sort((a, b) => formatPathDisplay(a.url).localeCompare(formatPathDisplay(b.url)))
      break
    case 'alphabetical-desc':
      searches.sort((a, b) => formatPathDisplay(b.url).localeCompare(formatPathDisplay(a.url)))
      break
    case 'type':
      searches.sort((a, b) => {
        const typeA = getPathType(a.url)
        const typeB = getPathType(b.url)
        if (typeA !== typeB) {
          return typeA.localeCompare(typeB)
        }
        return formatPathDisplay(a.url).localeCompare(formatPathDisplay(b.url))
      })
      break
  }

  return searches
})

const paginatedSearches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSearches.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSearches.value.length / itemsPerPage)
})

// Methods
function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  }
}

function getPathType(url) {
  if (url.startsWith('/tag/')) {
    return 'Tag'
  } else if (url.startsWith('/search/')) {
    return 'Search'
  }
  return 'Other'
}

function getPathIcon(url) {
  if (url.startsWith('/tag/')) {
    return 'mdi-tag'
  } else if (url.startsWith('/search/')) {
    return 'mdi-magnify'
  }
  return 'mdi-link'
}

function getPathColor(url) {
  if (url.startsWith('/tag/')) {
    return 'secondary'
  } else if (url.startsWith('/search/')) {
    return 'info'
  }
  return 'primary'
}

function formatPathDisplay(url) {
  if (url.startsWith('/tag/')) {
    const tag = decodeURIComponent(url.replace('/tag/', ''))
    return tag
  } else if (url.startsWith('/search/')) {
    const searchTerm = decodeURIComponent(url.replace('/search/', ''))
    return searchTerm
  }
  return url
}

function formatPathDescription(url) {
  if (url.startsWith('/tag/')) {
    return 'Bookmarks tagged with this label'
  } else if (url.startsWith('/search/')) {
    return 'Bookmarks matching this search term'
  }
  return 'Saved bookmark path'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'today'
  } else if (diffDays === 1) {
    return 'yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

function navigateToPath(url) {
  router.push(url)
}

function handleDeletePath(search) {
  confirmDialog.value = {
    show: true,
    search: search,
    path: search.url
  }
}

function filterByType(type) {
  pathTypeFilter.value = pathTypeFilter.value === type ? null : type
  currentPage.value = 1
}

function clearTypeFilter() {
  pathTypeFilter.value = null
  currentPage.value = 1
}

function focusFirstPath() {
  nextTick(() => {
    if (pathRefs.value[0]) {
      pathRefs.value[0].$el.focus()
    }
  })
}

async function confirmDeletePath() {
  if (!confirmDialog.value.search) return
  
  deleting.value = true
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      showNotification('error', 'You must be logged in to delete saved paths')
      return
    }
    
    const userId = session.user.id
    const pathToDelete = confirmDialog.value.search.url
    
    // Delete from Supabase with user_id check for security
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('url', pathToDelete)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting saved path:', error)
      showNotification('error', 'Failed to delete saved path')
      return
    }
    
    // Remove from store
    await appStore.removeSavedSearch(pathToDelete)
    
    showNotification('success', `Deleted path: ${pathToDelete}`)
    
  } catch (error) {
    console.error('Error deleting saved path:', error)
    showNotification('error', 'Failed to delete saved path')
  } finally {
    deleting.value = false
    confirmDialog.value.show = false
    confirmDialog.value.search = null
    confirmDialog.value.path = ''
  }
}

// Watch for filter changes to reset pagination
watch([searchQuery, pathTypeFilter, sortOption], () => {
  currentPage.value = 1
})

// Keyboard shortcuts
function handleKeydown(event) {
  // Ctrl/Cmd + F to focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(async () => {
  // Ensure saved searches are loaded
  await appStore.ensureSavedSearchesLoaded()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.path-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.path-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.path-card:focus {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.cursor-pointer {
  cursor: pointer;
}

.gap-2 {
  gap: 8px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .paths-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .paths-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>