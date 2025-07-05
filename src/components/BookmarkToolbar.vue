<script setup>
defineProps({
  search: String,
  selectedItems: Array,
  deleting: Boolean
});

defineEmits(['update:search', 'add-bookmark', 'delete-selected']);
</script>

<template>
  <v-row class="mb-4 d-flex align-items-center">
    <v-col cols="12" md="6">
      <v-text-field
        :model-value="search"
        @update:model-value="$emit('update:search', $event)"
        label="Search bookmarks"
        prepend-inner-icon="mdi-magnify"
      />
    </v-col>
    <v-col cols="12" md="6">
      <v-btn
        color="blue-darken-4"
        text="Add Bookmark (Alt+A)"
        variant="flat"
        @click="$emit('add-bookmark')"
      />
      <v-btn
        v-if="selectedItems.length > 0"
        color="red-darken-4"
        variant="elevated"
        :loading="deleting"
        @click="$emit('delete-selected')"
        class="mx-4"
      >
        Delete {{ selectedItems.length }} item{{ selectedItems.length === 1 ? '' : 's' }} (alt+i)
      </v-btn>
    </v-col>
  </v-row>
</template>