<script setup>

</script>

<template>
<v-card
  class="mx-auto"
  max-width="300"
>
  <v-list>
    <v-list-subheader>Recents</v-list-subheader>

    <RecentBookmarks />
    
    <v-list-subheader class="mt-8">Import bookmarks</v-list-subheader>

    <v-list-item>
      <v-btn to="/import" class="pa-2 py-3"><v-icon icon="mdi-import"></v-icon> Import</v-btn> 
    </v-list-item>
    <v-list-subheader class="mt-8">Keyboard shortcuts</v-list-subheader>
    <v-list-item>
      <span class="text-sm">Hit Ctrl+/ to open the keyboard shortcuts dialog</span>
    </v-list-item>
  </v-list>
</v-card>
</template>