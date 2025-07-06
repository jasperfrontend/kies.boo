<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import supabase from '@/lib/supabaseClient';

const props = defineProps({
  bookmarks: Array,
  loading: Boolean,
  selectedItems: Array,
  dialogOpen: Boolean
});

const emit = defineEmits(['update:selected-items', 'bookmark-updated']);

const itemsPerPage = ref(20);
const focusedRowIndex = ref(-1);

// Edit dialog state
const editDialog = ref(false);
const editLoading = ref(false);
const editForm = ref({
  id: null,
  title: '',
  url: '',
  tags: []
});
const editError = ref('');
const editSuccess = ref(false);

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

function normalizeUrl(url) {
  if (!url) return url
  
  // Remove any leading/trailing whitespace
  url = url.trim()
  
  // If it already starts with http:// or https://, don't modify it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Check if it looks like a URL (basic pattern: word.word)
  const urlPattern = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/
  
  if (urlPattern.test(url)) {
    return `https://${url}`
  }
  
  // If it doesn't match the pattern, return as-is (let the user handle it)
  return url
}

function isValidUrl(url) {
  if (!url) return false
  
  const normalizedUrl = normalizeUrl(url)
  
  try {
    new URL(normalizedUrl)
    return true
  } catch {
    const basicPattern = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/
    return basicPattern.test(normalizedUrl)
  }
}

function openEditDialog(bookmark) {
  // Reset states
  editError.value = '';
  editSuccess.value = false;
  
  // Copy bookmark data to form (creating a local copy)
  editForm.value = {
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    tags: bookmark.tags
  };
  
  editDialog.value = true;
}

function closeEditDialog() {
  editDialog.value = false;
  editForm.value = {
    id: null,
    title: '',
    url: '',
    tags: []
  };
  editError.value = '';
  editSuccess.value = false;
}

async function handleEditBookmark() {
  editError.value = '';
  editSuccess.value = false;
  
  // Validation
  if (!editForm.value.title.trim()) {
    editError.value = 'Please enter a title for the bookmark.';
    return;
  }

  if (!editForm.value.url.trim()) {
    editError.value = 'Please enter a URL for the bookmark.';
    return;
  }

  if (!editForm.value.tags.trim()) {
    editError.value = 'Please enter 1 or more tags for the bookmark.';
    return;
  }

  // Normalize and validate URL
  const normalizedUrl = normalizeUrl(editForm.value.url);
  if (!isValidUrl(normalizedUrl)) {
    editError.value = 'Please enter a valid URL (e.g., example.com or https://example.com).';
    return;
  }

  editLoading.value = true;

  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .update({ 
        title: editForm.value.title.trim(), 
        url: normalizedUrl,
        tags: [editForm.value.tags.trim()]
      })
      .eq('id', editForm.value.id)
      .select()
      .single();

    if (error) throw error;

    editSuccess.value = true;
    
    // Emit event to parent to refresh bookmarks
    emit('bookmark-updated', data);
    
    closeEditDialog();

  } catch (error) {
    console.error('Error updating bookmark:', error);
    
    if (error.code === '23505') {
      editError.value = 'This URL is already bookmarked.';
    } else {
      editError.value = error.message || 'Failed to update bookmark.';
    }
  } finally {
    editLoading.value = false;
  }
}

// Keyboard navigation
const handleKeydown = (event) => {
  // Tab to focus on table rows
  if (event.key === 'Tab' && !event.shiftKey && !props.dialogOpen && !editDialog.value) {
    if (props.bookmarks.length > 0) {
      event.preventDefault();
      focusedRowIndex.value = focusedRowIndex.value < props.bookmarks.length - 1 
        ? focusedRowIndex.value + 1 
        : 0;
    }
  }
  
  // Shift+Tab to go backwards through table rows
  if (event.key === 'Tab' && event.shiftKey && !props.dialogOpen && !editDialog.value) {
    if (props.bookmarks.length > 0) {
      event.preventDefault();
      focusedRowIndex.value = focusedRowIndex.value > 0 
        ? focusedRowIndex.value - 1 
        : props.bookmarks.length - 1;
    }
  }
  
  // Spacebar to select/deselect focused row
  if (event.key === ' ' && focusedRowIndex.value >= 0 && !props.dialogOpen && !editDialog.value) {
    event.preventDefault();
    const item = props.bookmarks[focusedRowIndex.value];
    if (item) {
      toggleItemSelection(item.id);
    }
  }
  
  // Arrow keys for navigation
  if (event.key === 'ArrowDown' && props.bookmarks.length > 0 && !editDialog.value) {
    event.preventDefault();
    focusedRowIndex.value = focusedRowIndex.value < props.bookmarks.length - 1 
      ? focusedRowIndex.value + 1 
      : 0;
  }
  
  if (event.key === 'ArrowUp' && props.bookmarks.length > 0 && !editDialog.value) {
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
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    width: '75px'
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
    density="compact"
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
          

          <v-tooltip :text="`Click to (de)select row ${index + 1}`">
            <template v-slot:activator="{ props }">
              <v-checkbox
                :model-value="selectedItems.includes(item.id)"
                @update:model-value="() => toggleItemSelection(item.id)"
                hide-details
                density="compact"
                v-bind="props"
              />
            </template>
          </v-tooltip>

        </td>
        <td>
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
        <td>{{ item.title }}</td>
        <td>
          
          <v-tooltip text="Open bookmark in a new tab">
            <template v-slot:activator="{ props }">
              <a
                :href="item.url"
                target="_blank"
                class="text-decoration-none"
                v-bind="props"
              >{{ displayUrl(item.url) }}</a>
            </template>
          </v-tooltip>
        </td>
        <td>
          {{ formatDate(item.created_at) }}
        </td>
        <td>
          <v-tooltip :text="`Edit ${item.title}`">
            <template v-slot:activator="{ props }">
              <v-btn
                variant="flat"
                size="small"
                v-bind="props"
                @click="openEditDialog(item)"
              >
                <v-icon icon="mdi-note-edit"></v-icon>
              </v-btn>
            </template>
          </v-tooltip>
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

  <!-- Edit Dialog -->
  <v-dialog 
    v-model="editDialog" 
    max-width="500"
    persistent
    >
    <v-form @submit.prevent="handleEditBookmark">
      <v-card title="Edit Bookmark">
        <v-card-text>
            <v-text-field
              v-model="editForm.title"
              label="Title"
              prepend-icon="mdi-bookmark"
              :disabled="editLoading"
              autofocus
            />
            <v-text-field
              v-model="editForm.url"
              label="URL"
              prepend-icon="mdi-link"
              :disabled="editLoading"
            />
            <v-text-field
              v-model="editForm.tags"
              label="Tags"
              prepend-icon="mdi-link"
              :disabled="editLoading"
            />
          
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="editLoading"
            :disabled="editLoading"
            text="Save Changes"
            color="primary"
            type="submit"
          />

          <v-btn
            text="Cancel"
            @click="closeEditDialog"
            :disabled="editLoading"
          />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <AppTips />

</template>

<style>
.v-table__wrapper > table > thead > tr > th {
  padding: 0 10px;
}
</style>