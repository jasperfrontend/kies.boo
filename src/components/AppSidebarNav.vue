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
    
    <v-list-subheader class="mt-8">App navigation</v-list-subheader>

    <v-list-item>

      <v-btn to="/" class="pa-2 mb-2 py-3 d-block" color="blue-darken-2" variant="tonal"><v-icon icon="mdi-home"></v-icon> Bookmarks</v-btn> 
      <v-btn to="/import" class="pa-2 mb-2 py-3 d-block" color="pink-darken-2" variant="tonal"><v-icon icon="mdi-import"></v-icon> Import</v-btn> 
      <v-btn to="/profile" class="pa-2 py-3 d-block" color="green-darken-2" variant="tonal"><v-icon icon="mdi-import"></v-icon> Profile</v-btn> 
    </v-list-item>
    <v-list-subheader class="mt-8">Keyboard shortcuts</v-list-subheader>
    <v-list-item> 
      <v-chip
        pill="true"
        ripple="false"
        size="small"
        variant="tonal"
      >
        Ctrl
      </v-chip> + <v-chip
        pill="true"
        ripple="false"
        size="small"
        variant="tonal"
      >
        /
      </v-chip>
    </v-list-item>
  </v-list>
</v-card>
</template>