<template>
  <AppTopBar @delete-selected="handleDeleteSelected" />
    <v-app id="inspire" class="mt-16" style="background: url(https://images.unsplash.com/photo-1488415032361-b7e238421f1b?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) center center no-repeat; background-size:  cover;">
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