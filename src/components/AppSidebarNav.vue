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