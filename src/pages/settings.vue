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
  <div>
    <v-card class="pa-4 pa-sm-8 mb-6 bg-transparent" flat>
      <v-card-title class="text-h4 mb-6 d-flex align-center">
        <v-icon class="mr-3" icon="mdi-cog" />
        User Settings
      </v-card-title>

      <v-row class="mb-6" dense>
        <v-col cols="12" md="6">
          <div class="text-subtitle-1 mb-2">Theme</div>
          <v-btn-toggle
            v-model="selectedTheme"
            class="w-100"
            density="comfortable"
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
        </v-col>

        <v-col cols="12" md="6">
          <div class="text-subtitle-1 mb-2">Items per page</div>
          <v-select
            v-model="itemsPerPage"
            density="comfortable"
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
        </v-col>
      </v-row>

      <v-row class="mb-6" dense>
        <v-col cols="12" md="6">
          <div class="text-subtitle-1 mb-2">Table behavior
            <v-chip
              append-icon="mdi-alert-circle-outline"
              class="ml-2"
              color="warning"
              density="compact"
              size="small"
              variant="tonal"
            >Experimental</v-chip>
          </div>
          <v-switch
            v-model="domainCollapsing"
            color="primary"
            density="comfortable"
            hide-details
            @update:model-value="changeDomainCollapsing"
          >
            <template #label>
              <div class="d-flex align-center">
                <v-icon class="mr-2" icon="mdi-view-collapse" size="16" />
                <span class="text-body-2">Collapse similar domains</span>
              </div>
            </template>
          </v-switch>
          <div class="text-caption text-medium-emphasis mt-1">
            Groups bookmarks from the same domain when there are more than 5
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <div class="text-subtitle-1 mb-2">Double-click behavior</div>
          <v-btn-toggle
            v-model="doubleClickBehavior"
            class="w-100"
            density="comfortable"
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
        </v-col>
      </v-row>

      <v-row class="mb-6" dense>
        <v-col cols="12" md="6">
          <div class="text-subtitle-1 mb-2">Bookmark view mode</div>
          <v-btn-toggle
            v-model="viewModeStore.mode"
            class="w-100"
            density="comfortable"
            divided
            variant="outlined"
            @update:model-value="handleViewModeChange"
          >
            <v-btn class="flex-grow-1" size="small" value="table">
              <v-icon class="mr-1" icon="mdi-table" size="16" />
              Table
            </v-btn>
            <v-btn class="flex-grow-1" size="small" value="card">
              <v-icon class="mr-1" icon="mdi-view-module" size="16" />
              Cards
            </v-btn>
          </v-btn-toggle>
          <div class="text-caption text-medium-emphasis mt-2">
            Table view works only on desktop screens
          </div>
        </v-col>

        <v-col class="d-flex align-center" cols="12" md="6">
          <v-btn
            prepend-icon="mdi-image"
            variant="outlined"
            @click="showBackgroundDialog = true"
          >
            Change background
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <BackgroundSelectionDialog
      v-model="showBackgroundDialog"
      @background-changed="onBackgroundChanged"
    />
  </div>
</template>

<route lang="yaml">
meta:
  layout: contentpage
</route>
