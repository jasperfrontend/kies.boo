<template>
  <AppTopBar />
  <v-app id="inspire" class="mt-16">
    <v-main>
      <router-view />
      <UnsplashCredits />
    </v-main>
  </v-app>
</template>

<script setup>
  import UnsplashCredits from '@/components/UnsplashCredits.vue'
  import { useBackground } from '@/composables/useBackground'

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
