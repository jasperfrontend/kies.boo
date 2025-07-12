<template>
  <AppTopBar />
  <v-app id="inspire" class="mt-16">
    <v-main>
      <v-container fluid class="pa-4 content-page-layout">
        <v-row justify="center">
          <v-col 
            cols="12" md="8" lg="8" 
            class="mt-3"
            :style="{
              backgroundColor: `rgba(var(--v-theme-surface), 0.95)`
            }"
          >
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
      <UnsplashCredits />
    </v-main>
  </v-app>
</template>

<script setup>
import { useBackground } from '@/composables/useBackground'
import UnsplashCredits from '@/components/UnsplashCredits.vue'

// Initialize background management
useBackground()
</script>

<style>
#inspire {
  min-height: 100vh;
  transition: background 0.3s ease-in-out;
}

.content-page-layout {
  margin-bottom: 10em;
}
</style>