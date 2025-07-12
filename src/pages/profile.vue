<script setup>
import { ref, onMounted, computed } from 'vue'
import supabase from '@/lib/supabaseClient'
import JasperApiDemo from '@/components/JasperApiDemo.vue'
import contentpage from '@/layouts/contentpage.vue'

const isAuthenticated = ref(false)
const user = ref(null)
const loading = ref(false)
const error = ref('')

// Statistics data
const stats = ref({
  bookmarks: {
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
    loading: false
  },
  tags: {
    total: 0,
    mostUsed: [],
    loading: false
  },
  savedSearches: {
    total: 0,
    recent: [],
    loading: false
  }
})

// Computed values for display
const memberSince = computed(() => {
  if (!user.value?.created_at) return 'Unknown'
  const date = new Date(user.value.created_at)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const statsCards = computed(() => [
  {
    title: 'Total Bookmarks',
    value: stats.value.bookmarks.total,
    icon: 'mdi-bookmark',
    color: 'blue-darken-1',
    loading: stats.value.bookmarks.loading
  },
  {
    title: 'Tags Created',
    value: stats.value.tags.total,
    icon: 'mdi-tag',
    color: 'secondary',
    loading: stats.value.tags.loading
  },
  {
    title: 'Saved Paths',
    value: stats.value.savedSearches.total,
    icon: 'mdi-magnify-plus',
    color: 'indigo-lighten-1',
    loading: stats.value.savedSearches.loading
  }
])

onMounted(async () => {
  await loadUserData()
  if (isAuthenticated.value) {
    await loadUserStatistics()
  }
})

async function loadUserData() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    isAuthenticated.value = !!session
    user.value = session?.user || null
    
    supabase.auth.onAuthStateChange((_event, session) => {
      isAuthenticated.value = !!session
      user.value = session?.user || null
    })
  } catch (err) {
    console.error('Error loading user data:', err)
    error.value = 'Failed to load user data'
  }
}

async function loadUserStatistics() {
  if (!user.value?.id) return
  
  loading.value = true
  
  try {
    await Promise.all([
      loadBookmarkStats(),
      loadTagStats(),
      loadSavedSearchStats()
    ])
  } catch (err) {
    console.error('Error loading statistics:', err)
    error.value = 'Failed to load statistics'
  } finally {
    loading.value = false
  }
}

async function loadBookmarkStats() {
  stats.value.bookmarks.loading = true
  
  try {
    // Get total bookmarks count
    const { count: totalCount, error: totalError } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)
    
    if (totalError) throw totalError
    stats.value.bookmarks.total = totalCount || 0
    
    // Get bookmarks from this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { count: monthCount, error: monthError } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)
      .gte('created_at', startOfMonth.toISOString())
    
    if (monthError) throw monthError
    stats.value.bookmarks.thisMonth = monthCount || 0
    
    // Get bookmarks from this week
    const startOfWeek = new Date()
    const dayOfWeek = startOfWeek.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const { count: weekCount, error: weekError } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)
      .gte('created_at', startOfWeek.toISOString())
    
    if (weekError) throw weekError
    stats.value.bookmarks.thisWeek = weekCount || 0
    
  } catch (err) {
    console.error('Error loading bookmark stats:', err)
  } finally {
    stats.value.bookmarks.loading = false
  }
}

async function loadTagStats() {
  stats.value.tags.loading = true
  
  try {
    // Get total tags count
    const { count: totalCount, error: totalError } = await supabase
      .from('tags')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)
    
    if (totalError) throw totalError
    stats.value.tags.total = totalCount || 0
    
    // Get most used tags by properly counting bookmark_tags relationships
    // We need to join through bookmark_tags and ensure we only count user's bookmarks
    const { data: tagUsage, error: usageError } = await supabase
      .from('tags')
      .select(`
        id,
        title,
        bookmark_tags!inner(
          bookmark_id,
          bookmarks!inner(
            user_id
          )
        )
      `)
      .eq('user_id', user.value.id)
      .eq('bookmark_tags.bookmarks.user_id', user.value.id)
    
    if (usageError) throw usageError
    
    // Calculate usage count and sort
    const tagsWithCount = (tagUsage || []).map(tag => ({
      id: tag.id,
      title: tag.title,
      usage_count: tag.bookmark_tags?.length || 0
    }))
    .filter(tag => tag.usage_count > 0)
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 3)
    
    stats.value.tags.mostUsed = tagsWithCount
    
  } catch (err) {
    console.error('Error loading tag stats:', err)
    // Fallback method if the complex query fails
    try {
      console.log('Trying fallback method for tag usage...')
      const { data: fallbackTags, error: fallbackError } = await supabase
        .from('tags')
        .select('id, title')
        .eq('user_id', user.value.id)
      
      if (fallbackError) throw fallbackError
      
      // For each tag, count its usage manually
      const tagCounts = []
      for (const tag of fallbackTags || []) {
        const { count, error: countError } = await supabase
          .from('bookmark_tags')
          .select('bookmark_id', { count: 'exact', head: true })
          .eq('tag_id', tag.id)
          .in('bookmark_id', 
            supabase
              .from('bookmarks')
              .select('id')
              .eq('user_id', user.value.id)
          )
        
        if (!countError && count > 0) {
          tagCounts.push({
            id: tag.id,
            title: tag.title,
            usage_count: count
          })
        }
      }
      
      stats.value.tags.mostUsed = tagCounts
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 3)
        
    } catch (fallbackErr) {
      console.error('Fallback method also failed:', fallbackErr)
    }
  } finally {
    stats.value.tags.loading = false
  }
}

async function loadSavedSearchStats() {
  stats.value.savedSearches.loading = true
  
  try {
    // Get total saved searches count
    const { count: totalCount, error: totalError } = await supabase
      .from('saved_searches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)
    
    if (totalError) throw totalError
    stats.value.savedSearches.total = totalCount || 0
    
    // Get recent saved searches
    const { data: recentSearches, error: recentError } = await supabase
      .from('saved_searches')
      .select('url, created_at')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (recentError) throw recentError
    stats.value.savedSearches.recent = recentSearches || []
    
  } catch (err) {
    console.error('Error loading saved search stats:', err)
  } finally {
    stats.value.savedSearches.loading = false
  }
}

async function logout() {
  try {
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Error logging out:', err)
    error.value = 'Failed to log out'
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
<contentpage>
  <v-alert
    v-if="error"
    type="error"
    class="mb-4"
    closable
    @click:close="error = ''"
  >
    {{ error }}
  </v-alert>

  <!-- User Profile Section -->
  <v-card class="pa-6 mb-6 bg-transparent" flat>
    <v-card-title class="text-h4 mb-4">
      Your Profile
    </v-card-title>
    
    <v-card-text class="mb-6">
      <div v-if="isAuthenticated && user">
        <v-card class="mx-auto pa-0" elevation="0">
          <v-card-title class="d-flex align-center">
            <v-avatar size="56" class="me-4">
              <img :src="user.user_metadata?.avatar_url" alt="User avatar" />
            </v-avatar>
            <div>
              <div class="text-h6">{{ user.user_metadata?.custom_claims?.global_name || user.user_metadata?.full_name || user.email }}</div>
              <div class="text-caption">{{ user.email }}</div>
              <div class="text-caption text-grey-darken-1">Member since {{ memberSince }}</div>
            </div>
          </v-card-title>
          <v-card-actions>
            <v-btn color="error" @click="logout">Log out</v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-card-text>
  </v-card>


  <!-- Statistics Overview -->
  <v-card class="pa-6 bg-transparent" flat>
    <v-card-title class="text-h5 mb-4 d-flex align-center">
      <v-icon icon="mdi-chart-box" class="mr-2" />
      Your Statistics
    </v-card-title>
    
    <!-- Main Stats Cards -->
    <v-row class="mb-6">
      <v-col
        v-for="stat in statsCards"
        :key="stat.title"
        cols="12"
        sm="4"
      >
        <v-card
          :color="stat.color"
          variant="flat"
          class="text-center pa-4"
        >
          <v-icon 
            :icon="stat.icon" 
            size="32" 
            class="mb-2"
          />
          <div class="text-h4 font-weight-bold">
            <span v-if="!stat.loading">{{ stat.value.toLocaleString() }}</span>
            <v-skeleton-loader v-else type="text" width="60" />
          </div>
          <div class="text-caption">{{ stat.title }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detailed Breakdown -->
    <v-row>
      <!-- Bookmark Details -->
      <v-col cols="12" md="4">
        <v-card variant="flat" class="pa-4 h-100 bg-surface">
          <v-card-title class="text-subtitle-1 pb-2">
            <v-icon icon="mdi-bookmark" class="mr-2" size="20" />
            Bookmark Activity
          </v-card-title>
          <v-card-text class="pa-0">
            <div v-if="!stats.bookmarks.loading">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-caption">This week:</span>
                <v-chip size="small" color="success" variant="flat">
                  {{ stats.bookmarks.thisWeek }}
                </v-chip>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption">This month:</span>
                <v-chip size="small" color="info" variant="flat">
                  {{ stats.bookmarks.thisMonth }}
                </v-chip>
              </div>
            </div>
            <v-skeleton-loader v-else type="list-item-two-line" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Tag Details -->
      <v-col cols="12" md="4">
        <v-card variant="flat" class="pa-4 h-100 bg-surface">
          <v-card-title class="text-subtitle-1 pb-2">
            <v-icon icon="mdi-tag" class="mr-2" size="20" />
            Most Used Tags
          </v-card-title>
          <v-card-text class="pa-0">
            <div v-if="!stats.tags.loading">
              <div 
                v-if="stats.tags.mostUsed.length > 0"
                v-for="(tag, index) in stats.tags.mostUsed"
                :key="tag.id"
                class="d-flex justify-space-between align-center pa-2 rounded cursor-pointer hover-bg"
                @click="$router.push(`/tag/${encodeURIComponent(tag.title)}`)"
              >
                <span class="text-caption text-secondary">{{ tag.title }}</span>
                <v-chip size="x-small" color="secondary" variant="flat">
                  {{ tag.usage_count }}
                </v-chip>
              </div>
              <div v-else class="text-caption text-grey-darken-1">
                No tags created yet
              </div>
            </div>
            <v-skeleton-loader v-else type="list-item-two-line" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Saved Searches Details -->
      <v-col cols="12" md="4">
        <v-card variant="flat" class="pa-4 h-100 bg-surface">
          <v-card-title class="text-subtitle-1 pb-2">
            <v-icon icon="mdi-magnify-plus" class="mr-2" size="20" />
            Recent Saved Paths
          </v-card-title>
          <v-card-text class="pa-0">
            <div v-if="!stats.savedSearches.loading">
              <div 
                v-if="stats.savedSearches.recent.length > 0"
                v-for="(search, index) in stats.savedSearches.recent"
                :key="index"
                class="mb-2"
              >
                <router-link 
                  :to="search.url" 
                  class="text-caption text-indigo-lighten-1 text-decoration-none"
                >
                  {{ search.url }}
                </router-link>
                <div class="text-caption text-grey-darken-2">
                  {{ formatDate(search.created_at) }}
                </div>
              </div>
              <div v-else class="text-caption text-grey-darken-1">
                No saved searches yet
              </div>
            </div>
            <v-skeleton-loader v-else type="list-item-two-line" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card variant="outlined" class="pa-4">
          <v-card-title class="text-subtitle-1 pb-2">
            <v-icon icon="mdi-lightning-bolt" class="mr-2" size="20" />
            Quick Actions
          </v-card-title>
          <v-card-text class="pa-0">
            <div class="d-flex gap-2 flex-wrap">
              <v-btn
                to="/"
                size="small"
                variant="outlined"
                prepend-icon="mdi-bookmark"
                class="mr-2"
              >
                View Bookmarks
              </v-btn>
              <v-btn
                to="/hellotags"
                size="small"
                variant="outlined"
                prepend-icon="mdi-tag"
                class="mr-2"
              >
                Manage Tags
              </v-btn>
              <v-btn
                to="/saved-searches"
                size="small"
                variant="outlined"
                prepend-icon="mdi-magnify-plus"
                class="mr-2"
              >
                Saved Paths
              </v-btn>
              <v-btn
                to="/import"
                size="small"
                variant="outlined"
                prepend-icon="mdi-cloud-upload"
                class="mr-2"
              >
                Import More
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
  
  </contentpage>
</template>

<style scoped>
.hover-bg {
  transition: background-color 0.2s ease;
}

.hover-bg:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.cursor-pointer {
  cursor: pointer;
}
</style>