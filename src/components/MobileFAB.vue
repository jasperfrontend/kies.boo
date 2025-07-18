<template>
  <div v-if="mobile" class="mobile-fab-container">
    <!-- Search Input Bottom Sheet -->
    <v-bottom-sheet
      v-model="showSearchSheet"
      inset
      persistent
    >
      <v-card class="search-bottom-sheet">
        <v-card-text class="pa-4">
          <v-text-field
            ref="mobileSearchRef"
            v-model="searchQuery"
            autofocus
            clearable
            density="comfortable"
            hide-details
            label="Search your bookmarks..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            @keydown.enter="handleSearch"
            @keydown.esc="closeSearch"
          >
            <template #append-inner>
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                @click="closeSearch"
              />
            </template>
          </v-text-field>
          
          <div class="d-flex justify-space-between align-center mt-3">
            <div class="text-caption text-medium-emphasis">
              Press Enter to search, Esc to close
            </div>
            <v-btn
              color="primary"
              size="small"
              variant="flat"
              @click="handleSearch"
            >
              Search
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- Speed Dial FAB -->
    <v-speed-dial
      v-model="fabOpen"
      location="bottom end"
      transition="slide-y-reverse-transition"
    >
      <template #activator="{ props: activatorProps }">
        <v-fab
          v-bind="activatorProps"
          color="primary"
          icon="mdi-menu"
          size="56"
        />
      </template>

      <!-- Search Action -->
      <v-btn
        key="search"
        color="secondary"
        size="small"
        variant="elevated"
        @click="openSearch"
      >
        <v-icon class="mr-2" icon="mdi-magnify" />
        Search
      </v-btn>

      <!-- Add Bookmark Action -->
      <v-btn
        key="add"
        color="secondary"
        size="small"
        variant="elevated"
        @click="openAddBookmark"
      >
        <v-icon class="mr-2" icon="mdi-bookmark-plus" />
        Add Bookmark
      </v-btn>

      <!-- Navigation: Bookmarks -->
      <v-btn
        key="bookmarks"
        color="secondary"
        size="small"
        variant="elevated"
        @click="navigateTo('/')"
      >
        <v-icon class="mr-2" icon="mdi-bookmark" />
        Bookmarks
      </v-btn>

      <!-- Navigation: Tags -->
      <v-btn
        key="tags"
        color="secondary"
        size="small"
        variant="elevated"
        @click="navigateTo('/tags')"
      >
        <v-icon class="mr-2" icon="mdi-tag" />
        Tags
      </v-btn>

      <!-- Navigation: Paths -->
      <v-btn
        key="paths"
        color="secondary"
        size="small"
        variant="elevated"
        @click="navigateTo('/paths')"
      >
        <v-icon class="mr-2" icon="mdi-slash-forward-box" />
        Paths
      </v-btn>

      <!-- Profile Menu -->
      <v-btn
        key="profile"
        color="secondary"
        size="small"
        variant="elevated"
        @click="openProfile"
      >
        <v-icon class="mr-2" icon="mdi-account" />
        Profile
      </v-btn>
    </v-speed-dial>
  </div>
</template>

<script setup>
  import { computed, nextTick, ref, watch } from 'vue'
  import { useDisplay } from 'vuetify'
  import { useRouter } from 'vue-router'
  import { useAppStore } from '@/stores/app'

  const { mobile } = useDisplay()
  const router = useRouter()
  const appStore = useAppStore()

  // FAB state
  const fabOpen = ref(false)
  const showSearchSheet = ref(false)
  const searchQuery = ref('')
  const mobileSearchRef = ref(null)

  // Future expansion flags
  const showQuickActions = ref(false) // Can be enabled later

  // Emit event to trigger profile menu from AppTopBar
  const emit = defineEmits(['open-profile-menu'])

  // Dynamic FAB classes based on current route
  const fabClasses = computed(() => {
    const classes = ['mobile-fab']
    
    // Adjust position based on current page to avoid conflicts
    if (router.currentRoute.value.path.includes('/profile')) {
      classes.push('fab-offset-profile')
    }
    
    return classes.join(' ')
  })

  // Methods
  function openSearch() {
    fabOpen.value = false
    showSearchSheet.value = true
    
    // Focus the search input after the sheet opens
    nextTick(() => {
      if (mobileSearchRef.value) {
        mobileSearchRef.value.focus()
      }
    })
  }

  function closeSearch() {
    showSearchSheet.value = false
    searchQuery.value = ''
  }

  function handleSearch() {
    if (searchQuery.value.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery.value.trim())}`)
      closeSearch()
    }
  }

  function openAddBookmark() {
    fabOpen.value = false
    appStore.openAddBookmarkDialog()
  }

  function navigateTo(path) {
    fabOpen.value = false
    router.push(path)
  }

  function openProfile() {
    fabOpen.value = false
    // Emit event to trigger profile menu in AppTopBar
    emit('open-profile-menu')
  }

  function openQuickActions() {
    fabOpen.value = false
    // Future: Open quick actions menu
    console.log('Quick actions - to be implemented')
  }

  // Auto-close search sheet when navigating
  watch(() => router.currentRoute.value.path, () => {
    if (showSearchSheet.value) {
      closeSearch()
    }
  })

  // Close FAB when search sheet opens
  watch(showSearchSheet, (newValue) => {
    if (newValue) {
      fabOpen.value = false
    }
  })
</script>

<style scoped>
.mobile-fab-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

/* Search bottom sheet styling */
.search-bottom-sheet {
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
}

/* Ensure proper layering above other content */
:deep(.v-overlay__content) {
  z-index: 1001;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .mobile-fab-container {
    bottom: 16px;
    right: 16px;
  }
}

/* Ensure FAB doesn't interfere with bottom navigation if added later */
@media (orientation: landscape) and (max-height: 500px) {
  .mobile-fab-container {
    bottom: 12px;
    right: 12px;
  }
  
  :deep(.v-speed-dial) {
    transform: scale(0.9);
  }
}
</style>