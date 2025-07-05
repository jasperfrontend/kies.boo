<template>
  <v-app id="inspire">
    <AppTopBar @delete-selected="handleDeleteSelected" />
    <v-main>
      <router-view @delete-selected="handleDeleteSelected"></router-view>
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script setup>
// Handle the delete event from AppTopBar and pass it to the current route
function handleDeleteSelected() {
  // This will be handled by the router-view component (index.vue)
  // We need to emit this event to the active route component
  const event = new CustomEvent('delete-selected-bookmarks')
  document.dispatchEvent(event)
}
</script>