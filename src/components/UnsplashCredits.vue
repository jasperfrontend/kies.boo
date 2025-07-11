<script setup>
import { ref, onMounted } from 'vue';
import supabase from '@/lib/supabaseClient';

const userObject = ref()
const userPreferences = ref(null) // is object, geen array
const attributionHtml = ref(null)

async function getCurrentlyLoggedInUser() {
  const { data: { user } } = await supabase.auth.getUser()
  userObject.value = user;
  if (user) {
    await getUserBackground(user.id)
  } else {
    console.error("Error retrieving currently logged in user. Please log in again.");
  }
}

async function getUserBackground(uid) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('preferences')
    .eq('user_id', uid)
    .single() // We verwachten maar 1 resultaat!

  if (error) {
    console.error("error getting user background", error)
    return
  }
  userPreferences.value = data.preferences
  // Check of het een Unsplash image is, en of attribution bestaat
  if (
    userPreferences.value?.background?.type === 'image' &&
    userPreferences.value.background.attribution?.html
  ) {
    attributionHtml.value = userPreferences.value.background.attribution.html
  } else {
    attributionHtml.value = null
  }
}

onMounted(getCurrentlyLoggedInUser)
</script>

<template>
<v-sheet
  v-if="attributionHtml"
  elevation="0"
  class="pa-2"
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
    v-html="attributionHtml"
    style="
      pointer-events: auto;
      color: #fff;
    "
    class="unsplash-attribution"
  ></span>
</v-sheet>


</template>
<style lang="css" scoped>
::v-deep .unsplash-attribution a {
  color: #fff !important;
  text-decoration: underline;
  opacity: 0.9;
  transition: color 0.2s;
}
::v-deep .unsplash-attribution a:hover {
  color: #ffe082 !important;
}
</style>