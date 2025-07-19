<template>
  <AppTopBar />
  <v-app id="inspire" :class="appClasses">
    <v-main>
      <v-container class="pa-4 content-page-layout" fluid>
        <v-row justify="center">
          <v-col
            class="mt-3"
            cols="12"
            lg="8"
            md="8"
            :style="{
              backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
            }"
          >
            <router-view />
          </v-col>
        </v-row>
      </v-container>
      <UnsplashCredits />
    </v-main>
  </v-app>
</template>

<script setup>
  import { computed } from 'vue'
  import { useDisplay } from 'vuetify'
  import UnsplashCredits from '@/components/UnsplashCredits.vue'
  import { useBackground } from '@/composables/useBackground'

  const { mobile } = useDisplay()

  // Initialize background management
  useBackground()

  // Adjust top margin based on mobile/desktop
  const appClasses = computed(() => {
    return mobile.value ? 'mobile-layout' : 'desktop-layout mt-16'
  })
</script>

<style>
#inspire {
  min-height: 100vh;
  transition: background 0.3s ease-in-out;
}

/* Desktop layout with app bar */
.desktop-layout .content-page-layout {
  margin-bottom: 10em;
}

/* Mobile layout without app bar */
.mobile-layout {
  margin-top: 0 !important;
}

.mobile-layout .content-page-layout {
  margin-bottom: 10em;
  padding-bottom: 100px; /* Add padding for FAB area */
}
</style>
