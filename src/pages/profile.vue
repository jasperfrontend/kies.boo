<script setup>
import { ref, onMounted } from 'vue'
import supabase from '@/lib/supabaseClient'
import JasperApiDemo from '@/components/JasperApiDemo.vue'

const isAuthenticated = ref(false)
const user = ref(null)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  isAuthenticated.value = !!session
  user.value = session?.user || null
  supabase.auth.onAuthStateChange((_event, session) => {
    isAuthenticated.value = !!session
    user.value = session?.user || null
  })
})

async function logout() {
  await supabase.auth.signOut()
}
</script>

<template>
  <div class="pa-1">
    <div v-if="isAuthenticated && user">
      <v-card class="mx-auto">
        <v-card-title class="d-flex align-center">
          <v-avatar size="56" class="me-4">
            <img :src="user.user_metadata?.avatar_url" alt="User avatar" />
          </v-avatar>
          <div>
            <div class="text-h6">{{ user.user_metadata?.custom_claims?.global_name || user.user_metadata?.full_name || user.email }}</div>
            <div class="text-caption">{{ user.email }}</div>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-btn color="error" @click="logout">Log out</v-btn>
        </v-card-actions>
      </v-card>
      <JasperApiDemo />
    </div>
    <div v-else>
      <p>You are not logged in.</p>
    </div>
  </div>
</template>