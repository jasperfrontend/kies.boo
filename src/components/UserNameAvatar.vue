<script setup>
  import { onMounted, ref } from 'vue'
  import supabase from '@/lib/supabaseClient'

  const user = ref(null)

  onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
    })
  })
</script>

<template>
  <v-card
    v-if="user && user.user_metadata && user.user_metadata.avatar_url && user.user_metadata.custom_claims && user.user_metadata.custom_claims.global_name"
    :prepend-avatar="user.user_metadata.avatar_url"
    subtitle="View your profile"
    :title="user.user_metadata.custom_claims.global_name"
    to="/profile"
  />
</template>
