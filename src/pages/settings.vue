<script setup>
  import { onMounted, ref } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'
  import BackgroundSelectionDialog from '@/components/BackgroundSelectionDialog.vue'
  import { useUserPreferences } from '@/composables/useUserPreferences'
  import { useViewModeStore } from '@/stores/viewMode'

  const { mobile } = useDisplay()
  const theme = useTheme()
  const viewModeStore = useViewModeStore()

  const selectedTheme = ref('system')
  const showBackgroundDialog = ref(false)

  const {
    doubleClickBehavior,
    domainCollapsing,
    itemsPerPage,
    saveDoubleClickBehavior,
    saveDomainCollapsing,
    saveItemsPerPage,
  } = useUserPreferences()

  const itemsPerPageOptions = [
    { title: '15 items', value: 15 },
    { title: '30 items', value: 30 },
    { title: '45 items', value: 45 },
    { title: '60 items', value: 60 },
  ]

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

  async function changeDoubleClickBehavior (newBehavior) {
    await saveDoubleClickBehavior(newBehavior)
  }

  async function changeDomainCollapsing (enabled) {
    await saveDomainCollapsing(enabled)
  }

  async function changeItemsPerPage (value) {
    await saveItemsPerPage(value)
  }

  function handleViewModeChange (mode) {
    if (!mobile.value) {
      viewModeStore.setMode(mode)
    }
  }

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme-preference') || 'system'
    selectedTheme.value = savedTheme
    changeTheme(savedTheme)

    if (mobile.value) {
      viewModeStore.setMode('card')
    } else {
      viewModeStore.initialize()
    }
  })

  function onBackgroundChanged () {
  // placeholder for future updates
  }
</script>

<template>
  <div class="settings-root d-flex justify-center">
    <v-card
      class="settings-card py-10 px-6 px-md-12 elevation-1"
      color="surface"
      max-width="800"
      min-width="500"
      width="100%"
      rounded="xl"
    >
      <!-- HEADINGS -->
      <div class="text-h5 font-weight-bold mb-1 d-flex align-center text-high-emphasis">
        <v-icon class="mr-3" icon="mdi-cog" size="32" color="primary" />
        User Settings
      </div>
      <div class="text-body-1 text-medium-emphasis mb-7">Personalize your experience</div>
      
      <!-- Theme Selector -->
      <div class="settings-section mb-6">
        <div class="d-flex align-center justify-space-between">
          <div class="text-subtitle-2 font-weight-medium text-high-emphasis">Theme</div>
          <v-btn-toggle
            v-model="selectedTheme"
            class="theme-toggle"
            divided
            density="comfortable"
            variant="outlined"
            @update:model-value="changeTheme"
          >
            <v-btn size="small" value="light">
              <v-tooltip
                activator="parent"
                location="bottom center"
              >
                Light mode
              </v-tooltip>
              <v-icon icon="mdi-white-balance-sunny" size="16" color="warning" />
            </v-btn>
            <v-btn size="small" value="dark">
              <v-tooltip
                activator="parent"
                location="bottom center"
              >
                Dark mode
              </v-tooltip>
              <v-icon icon="mdi-moon-waning-crescent" size="16" color="info" />
            </v-btn>
            <v-btn size="small" value="system">
              <v-tooltip
                activator="parent"
                location="bottom center"
              >
                System
              </v-tooltip>
              <v-icon icon="mdi-theme-light-dark" size="16" color="secondary" />
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <!-- Items Per Page -->
      <div class="settings-section mb-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-2 font-weight-medium text-high-emphasis">Items per page</div>
            <div class="text-caption text-medium-emphasis">Number of items in tables</div>
          </div>
          <v-select
            v-model="itemsPerPage"
            :items="itemsPerPageOptions"
            class="settings-select"
            hide-details
            density="comfortable"
            variant="outlined"
            style="max-width: 150px"
            @update:model-value="changeItemsPerPage"
          >
            <template #prepend-inner>
              <v-icon icon="mdi-table-row" size="16" color="primary" />
            </template>
          </v-select>
        </div>
      </div>

      <!-- Table Behavior -->
      <div class="settings-section mb-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="d-flex align-center">
              <span class="text-subtitle-2 font-weight-medium text-high-emphasis">Table behavior</span>
              <v-chip
                append-icon="mdi-flask-outline"
                class="ml-2 cursor-pointer"
                color="warning"
                density="compact"
                size="small"
                variant="tonal"
                text="medium-emphasis"
              >
                Experimental
                <v-tooltip
                  activator="parent"
                  location="bottom center"
                >
                  This feature works best when you set Items per page to at least 30.
                </v-tooltip>
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis">
              Collapse similar domains (when more than 5 bookmarks of the same domain are visible on the same page).
            </div>
          </div>
          <v-switch
            v-model="domainCollapsing"
            color="primary"
            hide-details
            density="comfortable"
            class="ml-2"
            @update:model-value="changeDomainCollapsing"
          />
        </div>
      </div>

      <!-- Double-Click Behavior -->
      <div class="settings-section mb-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-2 font-weight-medium text-high-emphasis">Double-click</div>
            <div class="text-caption text-medium-emphasis">What happens when you double-click a table row?</div>
          </div>
          <v-btn-toggle
            v-model="doubleClickBehavior"
            class="double-click-toggle"
            density="comfortable"
            divided
            variant="outlined"
            @update:model-value="changeDoubleClickBehavior"
          >
            <v-btn size="small" value="select">
              <v-icon icon="mdi-cursor-default-click" size="16" color="primary" /> Select
            </v-btn>
            <v-btn size="small" value="open">
              <v-icon icon="mdi-open-in-new" size="16" color="primary" /> Open
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <!-- Bookmark View Mode -->
      <div class="settings-section mb-7">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-subtitle-2 font-weight-medium text-high-emphasis">Bookmark view mode</div>
            <div class="text-caption text-medium-emphasis"><v-chip density="compact" color="warning">Desktop only</v-chip> 
              Mobile view defaults to Cards.</div>
          </div>
          <v-btn-toggle
            v-model="viewModeStore.mode"
            class="view-mode-toggle"
            density="comfortable"
            divided
            variant="outlined"
            @update:model-value="handleViewModeChange"
          >
            <v-btn size="small" value="table">
              <v-icon icon="mdi-table" size="16" color="primary" /> Table
            </v-btn>
            <v-btn size="small" value="card">
              <v-icon icon="mdi-view-module" size="16" color="primary" /> Cards
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <!-- Change background button -->
      <v-divider class="my-3" />
      <div class="d-flex justify-end">
        <v-btn
          prepend-icon="mdi-image"
          variant="outlined"
          color="primary"
          size="large"
          rounded="lg"
          @click="showBackgroundDialog = true"
        >
          Change background
        </v-btn>
      </div>
    </v-card>

    <BackgroundSelectionDialog
      v-model="showBackgroundDialog"
      @background-changed="onBackgroundChanged"
    />
  </div>
</template>


<style scoped>
.settings-root {
  min-height: 90vh;
  align-items: flex-start;
  padding-top: 48px;
}
.settings-card {
  box-shadow: 0 6px 32px rgba(0,0,0,0.10), 0 1.5px 4px rgba(0,0,0,0.07);
  background: rgba(255,255,255,0.88);
  margin: 0 auto;
  backdrop-filter: blur(6px);
}
.settings-section + .settings-section {
  border-top: 1px solid rgba(60,60,60,0.07);
  padding-top: 1.5em;
}
/* .theme-toggle, .double-click-toggle, .view-mode-toggle {
  background: transparent !important;
} */
.settings-select {
  min-width: 100px;
}
@media (max-width: 768px) {
  .settings-card {
    min-width: unset !important;
    max-width: 98vw !important;
    width: 90vw !important;
    padding-left: 10px !important;
    padding-right: 10px !important;
  }
  .settings-root {
    padding-top: 12px;
  }
}
</style>

<route lang="yaml">
meta:
  layout: contentpage
</route>
