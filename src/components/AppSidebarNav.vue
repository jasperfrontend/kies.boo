<script setup>
import { ref } from 'vue'
const items = ref([
  { text: 'minecraft', icon: 'mdi-minecraft' },
  { text: 'coding', icon: 'mdi-application-braces' },
  { text: 'stockphotos', icon: 'mdi-image-area' },
])
</script>

<template>
<v-card
  class="mx-auto"
  max-width="300"
>
  <v-list>
    <v-list-subheader>Recents</v-list-subheader>

    <RecentBookmarks />
    
    <v-list-subheader class="mt-8">Collections</v-list-subheader>

    <v-list-item
      v-for="(item, i) in items"
      :key="i"
      :value="item"
    >
      <template v-slot:prepend>
        <v-icon :icon="item.icon"></v-icon>
      </template>

      <v-list-item-title v-text="item.text"></v-list-item-title>
    </v-list-item>
  </v-list>
</v-card>
</template>