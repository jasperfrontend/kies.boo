<template>
  <!-- Hide entire app bar on mobile -->
  <v-app-bar
    v-if="!mobile"
    app
    color="surface"
    elevation="1"
    height="64"
  >
    <v-container class="d-flex align-center pa-0 px-4" fluid>
      <!-- DESKTOP NAV ONLY (mobile handled by FAB) -->
      <div class="d-flex align-center">
        <v-btn
          class="mr-4 text-body-1"
          :class="[$route.path === '/' ? 'text-primary' : '']"
          to="/"
          variant="text"
        >
          Bookmarks
          <v-tooltip activator="parent" location="bottom">G then B</v-tooltip>
        </v-btn>
        <v-btn
          class="mr-4 text-body-1"
          :class="[$route.path === '/tags' ? 'text-primary' : '']"
          to="/tags"
          variant="text"
        >
          Tags
          <v-tooltip activator="parent" location="bottom">G then T</v-tooltip>
        </v-btn>
        <v-btn
          class="text-body-1"
          :class="[$route.path === '/paths' ? 'text-primary' : '']"
          to="/paths"
          variant="text"
        >
          Paths
          <v-tooltip activator="parent" location="bottom">G then P</v-tooltip>
        </v-btn>
      </div>
      <v-spacer />
      <div class="search-container mx-8" style="width: 30%;">
        <SearchBookmarks />
      </div>

      <v-spacer />

      <!-- Add bookmark (desktop only) -->
      <v-btn
        color="primary-darken-1"
        variant="elevated"
        @click="appStore.openAddBookmarkDialog()"
      >
        New bookmark
        <v-tooltip activator="parent" location="bottom">Ctrl+i</v-tooltip>
      </v-btn>

      <!-- Profile menu -->
      <v-menu
        v-model="profileMenu"
        :close-on-content-click="false"
        location="bottom end"
        min-width="280"
        offset="8"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            ref="profileMenuButton"
            class="ml-2"
            icon
            variant="text"
          >
            <v-avatar
              v-if="user?.user_metadata?.avatar_url"
              :image="user.user_metadata.avatar_url"
              size="40"
            />
            <v-icon v-else icon="mdi-account-circle" size="32" />
          </v-btn>
        </template>

        <!-- Profile menu content - keeping existing structure -->
        <v-card>
          <!-- User Info Section -->
          <v-card-text class="pb-0">
            <div class="d-flex align-center mb-2">
              <v-avatar
                v-if="user?.user_metadata?.avatar_url"
                class="mr-3"
                :image="user.user_metadata.avatar_url"
                size="50"
              />

              <v-icon v-else icon="mdi-account-circle" size="40" />

              <div>
                <div class="font-weight-medium">
                  {{ user?.user_metadata?.custom_claims?.global_name || user?.user_metadata?.full_name || 'User' }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ user?.email }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Member since {{ memberSince }}
                </div>
              </div>
            </div>
          </v-card-text>

          <v-divider />

          <!-- Menu Items -->
          <v-list class="py-0" density="compact">
            <v-list-item
              prepend-icon="mdi-account"
              to="/profile"
              @click="profileMenu = false"
            >
              <v-list-item-title>
                Your Profile
                <v-tooltip
                  activator="parent"
                  location="bottom"
                >
                  G then U
                </v-tooltip>
              </v-list-item-title>
            </v-list-item>
            <v-list-item
              prepend-icon="mdi-cog"
              to="/settings"
              @click="profileMenu = false"
            >
              <v-list-item-title>User Settings</v-list-item-title>
            </v-list-item>

            <v-list-item
              href="https://help.kies.boo/about/"
              prepend-icon="mdi-information-outline"
              rel="noopener"
              target="_blank"
            >
              <v-list-item-title>About</v-list-item-title>
            </v-list-item>

            <v-list-item
              href="https://help.kies.boo"
              prepend-icon="mdi-help-circle-outline"
              rel="noopener"
              target="_blank"
              @click.stop="profileMenu = false"
            >
              <v-list-item-title>Help</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider />

          <v-list class="py-0" density="compact">
            <v-list-item
              class="text-error"
              prepend-icon="mdi-logout"
              @click="logout"
            >
              <v-list-item-title>Log Out</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider />

          <!-- Footer Links -->
          <v-card-actions class="justify-center pa-2">
            <v-btn
              class="text-caption"
              href="https://help.kies.boo/privacy/"
              rel="noopener"
              size="x-small"
              target="_blank"
              variant="text"
            >
              Privacy
            </v-btn>
            <span class="text-caption mx-1">·</span>
            <v-btn
              class="text-caption"
              href="https://help.kies.boo/terms/"
              rel="noopener"
              size="x-small"
              target="_blank"
              variant="text"
            >
              Terms
            </v-btn>
            <span class="text-caption mx-1">·</span>
            <v-btn
              class="text-caption"
              href="https://help.kies.boo/cookies/"
              rel="noopener"
              size="x-small"
              target="_blank"
              variant="text"
            >
              Cookie Policy
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-container>

    <AddBookmarkDialog
      v-model="appStore.addBookmarkDialog"
      @bookmark-added="onBookmarkAdded"
    />

    <NotificationComponent
      :message="notification.message"
      position="bottom-right"
      :show="notification.show"
      :type="notification.type"
      @close="closeNotification"
    />
  </v-app-bar>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'
  import AddBookmarkDialog from '@/components/AddBookmarkDialog.vue'
  import NotificationComponent from '@/components/NotificationComponent.vue'
  import SearchBookmarks from '@/components/SearchBookmarks.vue'
  import supabase from '@/lib/supabaseClient'
  import { useAppStore } from '@/stores/app'

  const { mobile } = useDisplay()

  const appStore = useAppStore()
  const theme = useTheme()

  // Notification state
  const notification = ref({
    show: false,
    type: 'success',
    message: '',
  })

  const user = ref(null)
  const profileMenu = ref(false)
  const profileMenuButton = ref(null)
  const selectedTheme = ref('system')

  const memberSince = computed(() => {
    if (!user.value?.created_at) return 'Unknown'
    const date = new Date(user.value.created_at)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  // Handle hotkey event for opening profile menu
  function handleOpenProfileMenu () {
    // Instead of directly setting profileMenu.value = true,
    // simulate a click on the profile button so Vuetify knows the position
    if (profileMenuButton.value?.$el) {
      profileMenuButton.value.$el.click()
    } else {
      // Fallback if ref isn't available
      profileMenu.value = true
    }
  }

  // Theme management
  function changeTheme (newTheme) {
    selectedTheme.value = newTheme

    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.global.name.value = isDark ? 'supabaseDarkTheme' : 'light'
    } else if (newTheme === 'dark') {
      theme.global.name.value = 'supabaseDarkTheme'
    } else {
      theme.global.name.value = 'light'
    }

    localStorage.setItem('theme-preference', newTheme)
  }

  // Initialize theme
  function initializeTheme () {
    const savedTheme = localStorage.getItem('theme-preference') || 'system'
    selectedTheme.value = savedTheme
    changeTheme(savedTheme)
  }

  // Logout function
  async function logout () {
    try {
      await supabase.auth.signOut()
      profileMenu.value = false
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Load user data
  async function loadUserData () {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null

      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user || null
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Listen for system theme changes
  function setupSystemThemeListener () {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', e => {
      if (selectedTheme.value === 'system') {
        theme.global.name.value = e.matches ? 'supabaseDarkTheme' : 'light'
      }
    })
  }

  // Watch for dialog state changes from store
  watch(() => appStore.addBookmarkDialog, newValue => {
    if (!newValue) {
      appStore.triggerBookmarkRefresh()
    }
  })

  function showNotification (type, message) {
    notification.value = {
      show: true,
      type,
      message,
    }
  }

  function closeNotification () {
    notification.value.show = false
  }

  async function onBookmarkAdded () {
    try {
      appStore.closeAddBookmarkDialog()
      appStore.triggerBookmarkRefresh()
      showNotification('success', 'Bookmark added successfully!')
    } catch (error) {
      console.error('Failed to refresh bookmarks:', error)
      showNotification('error', 'Failed to refresh bookmarks')
    }
  }

  onMounted(() => {
    loadUserData()
    initializeTheme()
    setupSystemThemeListener()

    // Listen for profile menu hotkey event
    document.addEventListener('open-profile-menu', handleOpenProfileMenu)
  })

  onUnmounted(() => {
    document.removeEventListener('open-profile-menu', handleOpenProfileMenu)
  })
</script>

<style scoped>
.search-container {
  min-width: 200px;
}

/* Ensure proper keyboard navigation styling */
kbd {
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  color: rgb(var(--v-theme-on-surface));
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875em;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.24);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .search-container {
    max-width: 250px;
  }
}

@media (max-width: 600px) {
  .search-container {
    display: none;
  }
}
</style>
