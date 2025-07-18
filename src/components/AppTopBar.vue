<template>
  <v-app-bar app color="surface" elevation="1" height="64">
    <v-container class="d-flex align-center pa-0 px-4" fluid>
      <!-- MOBILE NAV -->
      <template v-if="mobile">
        <!-- Hamburger menu -->
        <v-menu
          v-model="mobileNavOpen"
          location="bottom start"
          offset="8"
        >
          <template #activator="{ props }">
            <v-btn icon v-bind="props" class="mr-1">
              <v-icon icon="mdi-menu" />
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/" @click="mobileNavOpen = false">
              <v-list-item-title>Bookmarks</v-list-item-title>
            </v-list-item>
            <v-list-item to="/tags" @click="mobileNavOpen = false">
              <v-list-item-title>Tags</v-list-item-title>
            </v-list-item>
            <v-list-item to="/paths" @click="mobileNavOpen = false">
              <v-list-item-title>Paths</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Zoek (vergrootglas) knop die dialog opent -->
        <v-btn icon @click="showMobileSearch = true">
          <v-icon icon="mdi-magnify" />
        </v-btn>
        <!-- Zoek dialog -->
        <v-dialog v-model="showMobileSearch" width="95%">
          <v-card class="pa-2">
            <SearchBookmarks />
          </v-card>
        </v-dialog>
      </template>

      <!-- DESKTOP NAV -->
      <template v-else>
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
      </template>

      <v-spacer />

      <!-- Add bookmark (mobile: icon, desktop: label) -->
      <v-btn
        color="primary-darken-1"
        variant="elevated"
        @click="appStore.openAddBookmarkDialog()"
      >
        <template v-if="mobile">
          <v-icon icon="mdi-plus" />
          <v-tooltip activator="parent" location="bottom">Ctrl+i</v-tooltip>
        </template>
        <template v-else>
          New bookmark
          <v-tooltip activator="parent" location="bottom">Ctrl+i</v-tooltip>
        </template>
      </v-btn>

      <!-- Profile menu, altijd zichtbaar -->
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

          <!-- Theme Switcher Section -->
          <v-card-text class="py-2">
            <div class="text-caption text-medium-emphasis mb-2">Theme</div>
            <v-btn-toggle
              v-model="selectedTheme"
              class="w-100"
              density="compact"
              divided
              variant="outlined"
              @update:model-value="changeTheme"
            >
              <v-btn class="flex-grow-1" size="small" value="light">
                <v-icon class="mr-1" icon="mdi-white-balance-sunny" size="16" />
                Light
              </v-btn>
              <v-btn class="flex-grow-1" size="small" value="dark">
                <v-icon class="mr-1" icon="mdi-moon-waning-crescent" size="16" />
                Dark
              </v-btn>
              <v-btn class="flex-grow-1" size="small" value="system">
                <v-icon class="mr-1" icon="mdi-theme-light-dark" size="16" />
                System
              </v-btn>
            </v-btn-toggle>
          </v-card-text>

          <v-divider />

          <!-- Items Per Page Section -->
          <v-card-text class="py-2">
            <div class="text-caption text-medium-emphasis mb-2">Items per page</div>
            <v-select
              v-model="itemsPerPage"
              density="compact"
              hide-details
              :items="itemsPerPageOptions"
              variant="outlined"
              @update:model-value="changeItemsPerPage"
            >
              <template #prepend-inner>
                <v-icon icon="mdi-table-row" size="16" />
              </template>
            </v-select>
            <div class="text-caption text-medium-emphasis mt-2">
              Number of items to show per page in tables
            </div>
          </v-card-text>

          <v-divider />

          <!-- Domain Collapsing Section -->
          <v-card-text class="py-2">
            <div class="text-caption text-medium-emphasis mb-2">Table behavior</div>
            <v-switch
              v-model="domainCollapsing"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="changeDomainCollapsing"
            >
              <template #label>
                <div class="d-flex align-center">
                  <v-icon class="mr-2" icon="mdi-view-collapse" size="16" />
                  <span class="text-body-2">Collapse similar domains
                    <v-tooltip
                      location="bottom"
                      text="This feature works best when Items per page it set to 30 or more"
                    >
                      <template #activator="{ props }">
                        <v-chip
                          v-bind="props"
                          append-icon="mdi-alert-circle-outline"
                          class="ml-2"
                          color="warning"
                          density="compact"
                          variant="tonal"
                        >Experimental</v-chip>
                      </template>
                    </v-tooltip>
                  </span>
                </div>
              </template>
            </v-switch>
            <div class="text-caption text-medium-emphasis mt-1">
              Groups bookmarks from the same domain when there are more than 5
            </div>
          </v-card-text>

          <v-divider />

          <!-- Double Click Behavior Section -->
          <v-card-text class="py-2">
            <div class="text-caption text-medium-emphasis mb-2">Double-click behavior</div>
            <v-btn-toggle
              v-model="doubleClickBehavior"
              class="w-100"
              density="compact"
              divided
              variant="outlined"
              @update:model-value="changeDoubleClickBehavior"
            >
              <v-btn class="flex-grow-1" size="small" value="select">
                <v-icon class="mr-1" icon="mdi-cursor-default-click" size="16" />
                Select
              </v-btn>
              <v-btn class="flex-grow-1" size="small" value="open">
                <v-icon class="mr-1" icon="mdi-open-in-new" size="16" />
                Open
              </v-btn>
            </v-btn-toggle>
            <div class="text-caption text-medium-emphasis mt-2">
              Choose what happens when you double-click a bookmark row
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
              prepend-icon="mdi-image"
              @click="showBackgroundDialog = true; profileMenu = false"
            >
              <v-list-item-title>Change background</v-list-item-title>
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

    <!-- Background Selection Dialog -->
    <BackgroundSelectionDialog
      v-model="showBackgroundDialog"
      @background-changed="onBackgroundChanged"
    />

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
  import { useTheme, useDisplay } from 'vuetify'
  import AddBookmarkDialog from '@/components/AddBookmarkDialog.vue'
  import BackgroundSelectionDialog from '@/components/BackgroundSelectionDialog.vue'
  import NotificationComponent from '@/components/NotificationComponent.vue'
  import SearchBookmarks from '@/components/SearchBookmarks.vue'
  import { useUserPreferences } from '@/composables/useUserPreferences'
  import supabase from '@/lib/supabaseClient'
  import { useAppStore } from '@/stores/app'

  const { mobile } = useDisplay()

  const {
    doubleClickBehavior,
    domainCollapsing,
    itemsPerPage,
    saveDoubleClickBehavior,
    saveDomainCollapsing,
    saveItemsPerPage,
  } = useUserPreferences()
  const appStore = useAppStore()
  const theme = useTheme()

  // Items per page options (excluding -1 for performance reasons)
  const itemsPerPageOptions = [
    { title: '15 items', value: 15 },
    { title: '30 items', value: 30 },
    { title: '45 items', value: 45 },
    { title: '60 items', value: 60 },
  ]

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
  const showBackgroundDialog = ref(false)
  const mobileNavOpen = ref(false)
  const showMobileSearch = ref(false)

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

  // Background change handler
  function onBackgroundChanged (backgroundData) {
    if(!backgroundData) {
      console.log(backgroundData)
    }
    return
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

  // User preferences
  async function changeDoubleClickBehavior (newBehavior) {
    const success = await saveDoubleClickBehavior(newBehavior)
    if (!success) {
      console.error('Failed to save double-click behavior preference')
    }
  }

  async function changeDomainCollapsing (enabled) {
    const success = await saveDomainCollapsing(enabled)
    if (!success) {
      console.error('Failed to save domain collapsing preference')
    }
  }

  async function changeItemsPerPage (newItemsPerPage) {
    const success = await saveItemsPerPage(newItemsPerPage)
    if (success) {
      showNotification('success', `Items per page updated to ${newItemsPerPage}`)
    } else {
      console.error('Failed to save items per page preference')
      showNotification('error', 'Failed to save items per page preference')
    }
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
    
    console.log("is mobile?", mobile.value)

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
