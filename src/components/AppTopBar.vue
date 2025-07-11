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

      <!-- Center Search -->
      <div class="search-container mx-8" style="width: 100%;">
        <SearchBookmarks />
      </div>

      <!-- Right Profile Menu -->
      <div class="d-flex align-center">
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
              <v-avatar size="32">
                <img
                  v-if="user?.user_metadata?.avatar_url"
                  :src="user.user_metadata.avatar_url"
                  :alt="user.user_metadata?.custom_claims?.global_name || user.email"
                />
                <v-icon v-else icon="mdi-account-circle" size="32" />
              </v-avatar>
            </v-btn>
          </template>

          <v-card>
            <!-- User Info Section -->
            <v-card-text class="pb-0">
              <div class="d-flex align-center mb-2">
                <v-avatar size="40" class="mr-3">
                  <img
                    v-if="user?.user_metadata?.avatar_url"
                    :src="user.user_metadata.avatar_url"
                    :alt="user.user_metadata?.custom_claims?.global_name || user.email"
                  />
                  <v-icon v-else icon="mdi-account-circle" size="40" />
                </v-avatar>
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

            <!-- Menu Items -->
            <v-list density="compact" class="py-0">
              <v-list-item
                @click="showBackgroundDialog = true; profileMenu = false"
                prepend-icon="mdi-image"
              >
                <v-list-item-title>Change background</v-list-item-title>
              </v-list-item>
              
              <v-list-item
                @click="showAboutDialog = true"
                prepend-icon="mdi-information-outline"
              >
                <v-list-item-title>About</v-list-item-title>
              </v-list-item>
              
              <v-list-item
                @click="showHelpDialog = true"
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
                @click="showPrivacyDialog = true"
                variant="text"
                size="x-small"
                class="text-caption"
              >
                Privacy
              </v-btn>
              <span class="text-caption mx-1">·</span>
              <v-btn
                @click="showTermsDialog = true"
                variant="text"
                size="x-small"
                class="text-caption"
              >
                Terms
              </v-btn>
              <span class="text-caption mx-1">·</span>
              <v-btn
                @click="showCookieDialog = true"
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

    <!-- About Dialog -->
    <v-dialog v-model="showAboutDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-information-outline" class="mr-2" />
          About kies.boo
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            kies.boo is a modern bookmark management application that helps you organize, 
            search, and manage your bookmarks efficiently.
          </p>
          <p class="mb-2"><strong>Features:</strong></p>
          <ul class="ml-4">
            <li>Import bookmarks from any browser</li>
            <li>Smart tagging and search</li>
            <li>Keyboard shortcuts for power users</li>
            <li>Save frequently used search paths</li>
            <li>Clean, modern interface</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAboutDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Help Dialog -->
    <v-dialog v-model="showHelpDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-help-circle-outline" class="mr-2" />
          Help & Support
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <h3 class="text-h6 mb-2">Keyboard Shortcuts</h3>
            <p class="mb-2">Press <kbd>Ctrl</kbd> + <kbd>/</kbd> to view all available keyboard shortcuts.</p>
          </div>
          
          <div class="mb-4">
            <h3 class="text-h6 mb-2">Getting Started</h3>
            <ul class="ml-4">
              <li>Import bookmarks from your browser using the Import page</li>
              <li>Add new bookmarks with Alt+A or the Add Bookmark button</li>
              <li>Use tags to organize your bookmarks</li>
              <li>Save search paths for quick access later</li>
            </ul>
          </div>

          <div class="mb-4">
            <h3 class="text-h6 mb-2">Need More Help?</h3>
            <p>Visit our documentation or contact support for additional assistance.</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showHelpDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Privacy Dialog -->
    <v-dialog v-model="showPrivacyDialog" max-width="600">
      <v-card>
        <v-card-title>Privacy Policy</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Your privacy is important to us. This privacy policy explains how we collect, 
            use, and protect your information when you use kies.boo.
          </p>
          <h4 class="text-subtitle-1 mb-2">Information We Collect</h4>
          <p class="mb-3">
            We collect only the information necessary to provide our bookmark management service:
          </p>
          <ul class="ml-4 mb-4">
            <li>Account information (email, display name, avatar from Discord authentication)</li>
            <li>Bookmark data (URLs, titles, tags, descriptions)</li>
            <li>Usage data to improve our service</li>
          </ul>
          <h4 class="text-subtitle-1 mb-2">How We Use Your Information</h4>
          <p class="mb-3">Your information is used to:</p>
          <ul class="ml-4">
            <li>Provide and maintain the bookmark management service</li>
            <li>Authenticate your account</li>
            <li>Improve our application</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showPrivacyDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Terms Dialog -->
    <v-dialog v-model="showTermsDialog" max-width="600">
      <v-card>
        <v-card-title>Terms of Service</v-card-title>
        <v-card-text>
          <p class="mb-4">
            By using kies.boo, you agree to these terms of service.
          </p>
          <h4 class="text-subtitle-1 mb-2">Acceptable Use</h4>
          <p class="mb-3">You agree to:</p>
          <ul class="ml-4 mb-4">
            <li>Use the service only for lawful purposes</li>
            <li>Not share your account credentials</li>
            <li>Not attempt to hack or compromise the service</li>
            <li>Respect the intellectual property rights of others</li>
          </ul>
          <h4 class="text-subtitle-1 mb-2">Service Availability</h4>
          <p class="mb-3">
            We strive to keep kies.boo available 24/7, but we cannot guarantee 
            uninterrupted service. We may perform maintenance that temporarily 
            affects availability.
          </p>
          <h4 class="text-subtitle-1 mb-2">Data and Privacy</h4>
          <p>
            Your bookmark data belongs to you. We will not share, sell, or 
            misuse your personal information. See our Privacy Policy for details.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showTermsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cookie Policy Dialog -->
    <v-dialog v-model="showCookieDialog" max-width="600">
      <v-card>
        <v-card-title>Cookie Policy</v-card-title>
        <v-card-text>
          <p class="mb-4">
            This cookie policy explains how kies.boo uses cookies and similar technologies.
          </p>
          <h4 class="text-subtitle-1 mb-2">What Are Cookies</h4>
          <p class="mb-3">
            Cookies are small text files stored on your device when you visit our website. 
            They help us provide a better user experience.
          </p>
          <h4 class="text-subtitle-1 mb-2">How We Use Cookies</h4>
          <ul class="ml-4 mb-4">
            <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
            <li><strong>Preference Cookies:</strong> Remember your settings like theme preference</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how you use our service</li>
          </ul>
          <h4 class="text-subtitle-1 mb-2">Managing Cookies</h4>
          <p>
            You can control cookies through your browser settings, but disabling 
            essential cookies may affect the functionality of kies.boo.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCookieDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <KeyboardShortcutsDialog v-model="showShortcutsDialog" />
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import supabase from '@/lib/supabaseClient'
import SearchBookmarks from '@/components/SearchBookmarks.vue'
import BackgroundSelectionDialog from '@/components/BackgroundSelectionDialog.vue'
import { useGlobalKeyboardShortcuts } from '@/composables/useGlobalKeyboardShortcuts'

const drawer = ref(null)
const { showShortcutsDialog } = useGlobalKeyboardShortcuts()

const route = useRoute()
const theme = useTheme()

// Reactive data
const user = ref(null)
const profileMenu = ref(false)
const selectedTheme = ref('system')

// Dialog states
const showBackgroundDialog = ref(false)
const showAboutDialog = ref(false)
const showHelpDialog = ref(false)
const showPrivacyDialog = ref(false)
const showTermsDialog = ref(false)
const showCookieDialog = ref(false)

// Computed properties
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