<script setup>
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()

// Emit event for delete action
const emit = defineEmits(['delete-selected'])
function handleDeleteSelected() {
  emit('delete-selected')
}

</script>

<template>
<v-btn
  v-if="appStore.selectedItems.length > 0"
  color="red-darken-4"
  variant="outlined"
  :loading="appStore.deleting"
  @click="handleDeleteSelected"
  prepend-icon="mdi-delete"
  class="mx-4"
>
  Delete {{ appStore.selectedItems.length }} item{{ appStore.selectedItems.length === 1 ? '' : 's' }} 
  <v-badge
    color="grey-darken-3"
    content="Alt+I"
    inline
  ></v-badge>
</v-btn>
</template>