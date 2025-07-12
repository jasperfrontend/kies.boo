<template>
  <v-app>
    <component :is="isAuthenticated ? 'router-view' : Login" />
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Login from './components/Login.vue'
import supabase from './lib/supabaseClient'

const isAuthenticated = ref(false)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  isAuthenticated.value = !!session
  supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session
  })
})
</script>
