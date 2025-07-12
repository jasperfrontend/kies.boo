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
#inspire {
  min-height: 100vh;
}

#inspire {
  transition: background 0.3s ease-in-out;
}
</style>