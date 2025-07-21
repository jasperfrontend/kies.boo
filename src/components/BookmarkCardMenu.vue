<template>
  <v-btn
    icon
    size="small"
    :title="`Actions for ${bookmark.title}`"
    variant="text"
  >
    <v-icon icon="mdi-dots-vertical" size="16" />
  </v-btn>

  <v-menu activator="parent" location="bottom start" offset="8">
    <v-list density="compact" max-width="100%" min-width="160">
      <v-list-item
        :prepend-avatar="bookmark.favicon"
        @click="$emit('open')"
      >
        <v-list-item-title class="ml-2">
          Open Link
        </v-list-item-title>
      </v-list-item>
      <v-list-item
        prepend-icon="mdi-eye"
        title="View Details"
        @click="$emit('view-details')"
      />
      <v-list-item
        prepend-icon="mdi-note-edit"
        title="Edit Bookmark"
        @click="$emit('edit')"
      />
      <v-divider />
      <v-list-item
        class="text-error"
        prepend-icon="mdi-delete"
        title="Delete"
        @click="$emit('single-delete')"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
defineProps({
  bookmark: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'open', 'single-delete', 'view-details'])
</script>