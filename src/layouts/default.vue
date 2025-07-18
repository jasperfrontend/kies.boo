<template>
  <AppTopBar />
  <v-app id="inspire" :class="appClasses">
    <v-main>
      <router-view />
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
/* .desktop-layout {} */

/* Mobile layout without app bar */
.mobile-layout {
  margin-top: 0 !important;
  padding-bottom: 100px; /* Add padding for FAB area */
}
</style>