<template>
  <AppTopBar />
  <v-app id="inspire" class="mt-16">
    <v-main>
      <router-view></router-view>
      <UnsplashCredits />
    </v-main>
  </v-app>
</template>

<script setup>
import { useBackground } from '@/composables/useBackground'
import UnsplashCredits from '@/components/UnsplashCredits.vue';

// Initialize background management
useBackground()
</script>

<style>
/* Remove hardcoded background - now handled by useBackground composable */
#inspire {
  /* Default background will be handled by Vuetify theme */
  min-height: 100vh;
}

/* Ensure smooth transitions when background changes */
#inspire {
  transition: background 0.3s ease-in-out;
}
</style>