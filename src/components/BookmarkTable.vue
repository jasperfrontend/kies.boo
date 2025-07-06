<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import supabase from '@/lib/supabaseClient';

const editedBookmarkData = ref(null);

const props = defineProps({
  bookmarks: Array,
  loading: Boolean,
  selectedItems: Array,
  dialogOpen: Boolean
});

const emit = defineEmits(['update:selected-items']);

const itemsPerPage = ref(20);
const focusedRowIndex = ref(-1);

const isAllSelected = computed(() => {
  return props.bookmarks.length > 0 && props.selectedItems.length === props.bookmarks.length;
});

const isIndeterminate = computed(() => {
  return props.selectedItems.length > 0 && props.selectedItems.length < props.bookmarks.length;
});

function toggleSelectAll() {
  if (isAllSelected.value) {
    emit('update:selected-items', []);
  } else {
    emit('update:selected-items', [...props.bookmarks.map(item => item.id)]);
  }
}

function toggleItemSelection(itemId) {
  const newSelection = [...props.selectedItems];
  const index = newSelection.indexOf(itemId);
  if (index > -1) {
    newSelection.splice(index, 1);
  } else {
    newSelection.push(itemId);
  }
  emit('update:selected-items', newSelection);
}

function getRowClasses(item, index) {
  return [
    'cursor-pointer',
    focusedRowIndex.value === index && props.selectedItems.includes(item.id)
      ? 'bg-red-darken-3'
      : '',
    focusedRowIndex.value === index && !props.selectedItems.includes(item.id)
      ? 'bg-blue-grey-darken-3'
      : '',
    props.selectedItems.includes(item.id) && focusedRowIndex.value !== index
      ? 'bg-red-darken-4'
      : '',
  ].filter(Boolean).join(' ');
}

function doubleClickHandler(url) {
  window.open(url, '_blank');
  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection) selection.removeAllRanges();
  }
}

function formatDate(dateString) {
  const d = new Date(dateString);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear().toString().substring(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function handleEditBookmark(id, title, tags = [], url) {
  const { data, error } = await supabase
  .from('bookmarks')
  .update({ title: title, url: url, tags: tags })
  .eq('id', id)
  .select()

  if (error) {
    return console.error("Error updating Bookmark: ", error)
  }

  console.log(data);
  

}

// Keyboard navigation
const handleKeydown = (event) => {
  // Tab to focus on table rows
  if (event.key === 'Tab' && !event.shiftKey && !props.dialogOpen) {
    if (props.bookmarks.length > 0) {
      event.preventDefault();
      focusedRowIndex.value = focusedRowIndex.value < props.bookmarks.length - 1 
        ? focusedRowIndex.value + 1 
        : 0;
    }
  }
  
  // Shift+Tab to go backwards through table rows
  if (event.key === 'Tab' && event.shiftKey && !props.dialogOpen) {
    if (props.bookmarks.length > 0) {
      event.preventDefault();
      focusedRowIndex.value = focusedRowIndex.value > 0 
        ? focusedRowIndex.value - 1 
        : props.bookmarks.length - 1;
    }
  }
  
  // Spacebar to select/deselect focused row
  if (event.key === ' ' && focusedRowIndex.value >= 0 && !props.dialogOpen) {
    event.preventDefault();
    const item = props.bookmarks[focusedRowIndex.value];
    if (item) {
      toggleItemSelection(item.id);
    }
  }
  
  // Arrow keys for navigation
  if (event.key === 'ArrowDown' && props.bookmarks.length > 0) {
    event.preventDefault();
    focusedRowIndex.value = focusedRowIndex.value < props.bookmarks.length - 1 
      ? focusedRowIndex.value + 1 
      : 0;
  }
  
  if (event.key === 'ArrowUp' && props.bookmarks.length > 0) {
    event.preventDefault();
    focusedRowIndex.value = focusedRowIndex.value > 0 
      ? focusedRowIndex.value - 1 
      : props.bookmarks.length - 1;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Define headers for the data table
const headers = [
  {
    title: '',
    key: 'select',
    sortable: false,
    width: '48px'
  },
  {
    title: '',
    key: 'favicon',
    sortable: false,
    width: '48px'
  },
  {
    title: 'Title',
    key: 'title',
    sortable: true
  },
  {
    title: 'URL',
    key: 'url',
    sortable: true
  },
  {
    title: 'Created',
    key: 'created_at',
    sortable: true
  }
  ,
  {
    title: '',
    key: '',
    sortable: false
  }
];

function displayUrl(url) {
  return url
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');
}

</script>

<template>
  <v-data-table
    :headers="headers"
    :items="bookmarks"
    :items-per-page="itemsPerPage === -1 ? bookmarks.length : itemsPerPage"
    :loading="loading"
    class="elevation-1"
    :mobile-breakpoint="600"
    :row-props="({ item, index }) => ({
      class: getRowClasses(item, index),
      tabindex: 0
    })"
  >
    <!-- Table rows -->
    <template #item="{ item, index }">
      <tr
        :class="getRowClasses(item, index)"
        tabindex="0"
        @dblclick="doubleClickHandler(item.url)"
      >
        <td>
          <v-checkbox
            :model-value="selectedItems.includes(item.id)"
            @update:model-value="() => toggleItemSelection(item.id)"
            hide-details
            density="compact"
          />
        </td>
        <td class="pa-2">
          <v-avatar rounded="0" size="24">
            <img
              :src="item.favicon"
              alt="favicon"
              width="24"
              height="24"
              @error="e => e.target.src = '/favicon.png'"
            />
          </v-avatar>
        </td>
        <td class="pa-2">{{ item.title }}</td>
        <td class="pa-2">
          <a
            :href="item.url"
            target="_blank"
            class="text-decoration-none"
            :title="item.url"
          >{{ displayUrl(item.url) }}</a>
        </td>
        <td class="pa-2">
          {{ formatDate(item.created_at) }}
        </td class="pa-2">

        <td>
          <v-dialog max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                color="surface-variant"
                text="Edit"
                variant="flat"
              ></v-btn>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card 
                title="Edit Bookmark"
                :subtitle="`${item.title} - ID: ${item.id}`"
              >
                <v-card-text>
                  <v-text-field 
                    v-model="item.title"
                    label="Title"
                  ></v-text-field>
                  <v-text-field 
                    v-model="item.url"
                    label="URL"
                  ></v-text-field>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    text="Save Bookmark"
                    color="success"
                    @click="handleEditBookmark(item.id, item.title, [], item.url); isActive.value = false"
                  ></v-btn>
                  <v-btn
                    text="Close Dialog"
                    @click="isActive.value = false"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </td>
      </tr>
    </template>

    <!-- Select all checkbox in header -->
    <template #header.select="">
      <v-checkbox
        :model-value="isAllSelected"
        :indeterminate="isIndeterminate"
        @update:model-value="toggleSelectAll"
        hide-details
        density="compact"
      />
    </template>

    <template #no-data>
      <v-alert type="info">No bookmarks found.</v-alert>
    </template>

  </v-data-table>
</template>