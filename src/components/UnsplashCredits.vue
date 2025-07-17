<script setup>
  import { onMounted, ref, watch } from 'vue'
  import supabase from '@/lib/supabaseClient'

  const userObject = ref()
  const userPreferences = ref(null)
  const attributionHtml = ref(null)

  async function getCurrentlyLoggedInUser () {
    const { data: { user } } = await supabase.auth.getUser()
    userObject.value = user
    if (user) {
      await getUserBackground(user.id)
    } else {
      console.error('Error retrieving currently logged in user. Please log in again.')
    }
  }

  async function getUserBackground (uid) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', uid)
      .single()

    if (error) {
      console.error('error getting user background', error)
      return
    }
    userPreferences.value = data.preferences
    updateAttribution()
  }

  function updateAttribution () {
    // Check of het een Unsplash image is, en of attribution bestaat
    attributionHtml.value = userPreferences.value?.background?.type === 'image'
      && userPreferences.value.background.attribution?.html
      ? userPreferences.value.background.attribution.html
      : null
  }

  // Watch for changes in userPreferences to update attribution reactively
  watch(() => userPreferences.value?.background, newBackground => {
    updateAttribution()
  }, { deep: true })

  // Listen for real-time changes to user_preferences table
  function setupRealtimeSubscription () {
    if (!userObject.value?.id) return

    const channel = supabase
      .channel('user-preferences-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${userObject.value.id}`,
        },
        payload => {
          // Update local data when database changes
          userPreferences.value = payload.new.preferences
        },
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel)
    }
  }

  onMounted(async () => {
    await getCurrentlyLoggedInUser()

    // Set up real-time subscription after user is loaded
    if (userObject.value?.id) {
      setupRealtimeSubscription()
    }
  })
</script>

<template>
  <v-sheet
    v-if="attributionHtml"
    class="pa-2"
    elevation="0"
    style="
    position: absolute;
    bottom: 2em;
    right: 2em;
    background: rgba(15,15,15,0.45);
    box-shadow: none;
    opacity: 0.92;
    font-size: 0.95em;
    border-radius: 8px;
    pointer-events: none;
    backdrop-filter: blur(1.5px);
  "
  >
    <span
      class="unsplash-attribution"
      style="
      pointer-events: auto;
      color: #fff;
    "
      v-html="attributionHtml"
    />
  </v-sheet>

</template>
<style lang="css" scoped>
:deep(.unsplash-attribution a) {
  color: #fff !important;
  text-decoration: underline;
  opacity: 0.9;
  transition: color 0.2s;
}
:deep(.unsplash-attribution a:hover) {
  color: #ffe082 !important;
}
</style>
