<template>
  <v-app-bar 
    app 
    elevation="1" 
    color="surface"
    height="64"
  >
    <v-container fluid class="d-flex align-center pa-0 px-4">
      <!-- Left Navigation -->
      <div class="d-flex align-center">
        <v-btn
          to="/"
          variant="text"
          class="mr-4 text-body-1"
          :class="{ 'text-primary': $route.path === '/' }"
        >
          Bookmarks
        </v-btn>

        <v-btn
          to="/hellotags"
          variant="text"
          class="mr-4 text-body-1"
          :class="{ 'text-primary': $route.path === '/hellotags' }"
        >
          Tags
        </v-btn>
        
        <v-btn
          to="/saved-searches"
          variant="text"
          class="text-body-1"
          :class="{ 'text-primary': $route.path === '/saved-searches' }"
        >
          Paths
        </v-btn>

      </div>
      <v-spacer />
      <!-- Center Search -->
      <div class="search-container mx-8" style="width: 30%;">
        <SearchBookmarks />
      </div>
      <v-spacer />
      <!-- Right Profile Menu -->
      <div class="d-flex align-center">
                
        <v-btn
          @click="appStore.openAddBookmarkDialog()"
          variant="text"
          class="text-body-1"
        >
          Add
          <v-badge
            color="grey-darken-3"
            content="Alt+A"
            inline
          />
        </v-btn>

        <v-menu
          v-model="profileMenu"
          :close-on-content-click="false"
          location="bottom end"
          offset="8"
          min-width="280"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              class="ml-2"
            >
              <v-avatar 
                v-if="user?.user_metadata?.avatar_url"
                size="40" 
                :image="user.user_metadata.avatar_url"
              />
              <v-icon v-else icon="mdi-account-circle" size="32" />
            </v-btn>
          </template>

          <v-card>
            <!-- User Info Section -->
            <v-card-text class="pb-0">
              <div class="d-flex align-center mb-2">
                <v-avatar 
                  v-if="user?.user_metadata?.avatar_url"
                  size="50" 
                  class="mr-3"
                  :image="user.user_metadata.avatar_url"
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
                @update:model-value="changeTheme"
                variant="outlined"
                density="compact"
                divided
                class="w-100"
              >
                <v-btn value="light" size="small" class="flex-grow-1">
                  <v-icon icon="mdi-white-balance-sunny" class="mr-1" size="16" />
                  Light
                </v-btn>
                <v-btn value="dark" size="small" class="flex-grow-1">
                  <v-icon icon="mdi-moon-waning-crescent" class="mr-1" size="16" />
                  Dark
                </v-btn>
                <v-btn value="system" size="small" class="flex-grow-1">
                  <v-icon icon="mdi-theme-light-dark" class="mr-1" size="16" />
                  System
                </v-btn>
              </v-btn-toggle>
            </v-card-text>

            <v-divider />

            <!-- Double Click Behavior Section -->
            <v-card-text class="py-2">
              <div class="text-caption text-medium-emphasis mb-2">Double-click behavior</div>
              <v-btn-toggle
                v-model="doubleClickBehavior"
                @update:model-value="changeDoubleClickBehavior"
                variant="outlined"
                density="compact"
                divided
                class="w-100"
              >
                <v-btn value="select" size="small" class="flex-grow-1">
                  <v-icon icon="mdi-cursor-default-click" class="mr-1" size="16" />
                  Select
                </v-btn>
                <v-btn value="open" size="small" class="flex-grow-1">
                  <v-icon icon="mdi-open-in-new" class="mr-1" size="16" />
                  Open
                </v-btn>
              </v-btn-toggle>
              <div class="text-caption text-medium-emphasis mt-2">
                Choose what happens when you double-click a bookmark row
              </div>
            </v-card-text>

            <v-divider />

            <!-- Menu Items -->
            <v-list density="compact" class="py-0">
              <v-list-item
                to="/profile"
                @click="profileMenu = false"
                prepend-icon="mdi-account"
              >
                <v-list-item-title>Your Profile</v-list-item-title>
              </v-list-item>
              <v-list-item
                @click="showBackgroundDialog = true; profileMenu = false"
                prepend-icon="mdi-image"
              >
                <v-list-item-title>Change background</v-list-item-title>
              </v-list-item>
              
              <v-list-item
                href="https://help.kies.boo/about/"
                target="_blank"
                rel="noopener"
                prepend-icon="mdi-information-outline"
              >
                <v-list-item-title>About</v-list-item-title>
              </v-list-item>
              
              <v-list-item
                href="https://help.kies.boo"
                target="_blank"
                rel="noopener"
                @click.stop="profileMenu = false"
                prepend-icon="mdi-help-circle-outline"
              >
                <v-list-item-title>Help</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-divider />

            <v-list density="compact" class="py-0">
              <v-list-item
                @click="logout"
                prepend-icon="mdi-logout"
                class="text-error"
              >
                <v-list-item-title>Log Out</v-list-item-title>
              </v-list-item>
            </v-list>

            <v-divider />

            <!-- Footer Links -->
            <v-card-actions class="justify-center pa-2">
              <v-btn
                href="https://help.kies.boo/privacy/"
                target="_blank"
                rel="noopener"
                variant="text"
                size="x-small"
                class="text-caption"
              >
                Privacy
              </v-btn>
              <span class="text-caption mx-1">·</span>
              <v-btn
                href="https://help.kies.boo/terms/"
                target="_blank"
                rel="noopener"
                variant="text"
                size="x-small"
                class="text-caption"
              >
                Terms
              </v-btn>
              <span class="text-caption mx-1">·</span>
              <v-btn
                href="https://help.kies.boo/cookies/"
                target="_blank"
                rel="noopener"
                variant="text"
                size="x-small"
                class="text-caption"
              >
                Cookie Policy
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </div>
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
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      position="bottom-right"
      @close="closeNotification"
    />

    <KeyboardShortcutsDialog v-model="showShortcutsDialog" />
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useTheme } from 'vuetify'
import supabase from '@/lib/supabaseClient'
import SearchBookmarks from '@/components/SearchBookmarks.vue'
import BackgroundSelectionDialog from '@/components/BackgroundSelectionDialog.vue'
import { useGlobalKeyboardShortcuts } from '@/composables/useGlobalKeyboardShortcuts'
import { useUserPreferences } from '@/composables/useUserPreferences'
import AddBookmarkDialog from '@/components/AddBookmarkDialog.vue';
import NotificationComponent from '@/components/NotificationComponent.vue';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

const { showShortcutsDialog } = useGlobalKeyboardShortcuts()
const { doubleClickBehavior, saveDoubleClickBehavior } = useUserPreferences()
const appStore = useAppStore()
const theme = useTheme()

// Notification state
const notification = ref({
  show: false,
  type: 'success',
  message: ''
});

const user = ref(null)
const profileMenu = ref(false)
const selectedTheme = ref('system')
const showBackgroundDialog = ref(false)

const memberSince = computed(() => {
  if (!user.value?.created_at) return 'Unknown'
  const date = new Date(user.value.created_at)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

// Background change handler
function onBackgroundChanged(backgroundData) {
  // Background is already applied by the dialog component
  // We could emit an event here if other components need to know
  console.log('Background changed:', backgroundData)
}

// Theme management
function changeTheme(newTheme) {
  selectedTheme.value = newTheme
  
  if (newTheme === 'system') {
    // Use system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.global.name.value = isDark ? 'supabaseDarkTheme' : 'light'
  } else if (newTheme === 'dark') {
    theme.global.name.value = 'supabaseDarkTheme'
  } else {
    theme.global.name.value = 'light'
  }
  
  // Save preference to localStorage
  localStorage.setItem('theme-preference', newTheme)
}

// Double-click behavior management
async function changeDoubleClickBehavior(newBehavior) {
  const success = await saveDoubleClickBehavior(newBehavior)
  if (!success) {
    console.error('Failed to save double-click behavior preference')
  }
}

// Initialize theme
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme-preference') || 'system'
  selectedTheme.value = savedTheme
  changeTheme(savedTheme)
}

// Logout function
async function logout() {
  try {
    await supabase.auth.signOut()
    profileMenu.value = false
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

function openExternalHelp(url) {
  return window.open(url, '_blank');
}

// Load user data
async function loadUserData() {
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
function setupSystemThemeListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (selectedTheme.value === 'system') {
      theme.global.name.value = e.matches ? 'supabaseDarkTheme' : 'light'
    }
  })
}


// Watch for dialog state changes from store
watch(() => appStore.addBookmarkDialog, (newValue) => {
  if (!newValue) {
    // Dialog was closed, trigger bookmark refresh
    appStore.triggerBookmarkRefresh();
  }
});

function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  };
}

function closeNotification() {
  notification.value.show = false;
}


async function onBookmarkAdded() {
  try {
    appStore.closeAddBookmarkDialog();

    // Trigger refresh for recent bookmarks in sidebar
    appStore.triggerBookmarkRefresh();
    showNotification('success', 'Bookmark added successfully!');
  } catch (error) {
    console.error('Failed to refresh bookmarks:', error);
    showNotification('error', 'Failed to refresh bookmarks');
  }
}

// Setup keyboard shortcuts
useKeyboardShortcuts({
  onAddBookmark: () => { appStore.openAddBookmarkDialog() }
});

onMounted(() => {
  loadUserData()
  initializeTheme()
  setupSystemThemeListener()
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