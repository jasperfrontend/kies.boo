<script setup>
import { ref } from 'vue'
const drawer = ref(null)
</script>

<template>
  <v-navigation-drawer v-model="drawer">
    <UserNameAvatar />
    <AppSidebarNav />
  </v-navigation-drawer>
  <v-app-bar>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-app-bar-title><RouterLink to="/" class="text-white text-decoration-none">kies.boo</RouterLink></v-app-bar-title>
  </v-app-bar>
</template>