<template>
  <AppTopBar />
  <v-app id="inspire" class="mt-16">
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
  import UnsplashCredits from '@/components/UnsplashCredits.vue'
  import { useBackground } from '@/composables/useBackground'

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
