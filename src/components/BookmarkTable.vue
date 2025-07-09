<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import supabase from '@/lib/supabaseClient';
import { useAppStore } from '@/stores/app';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

const props = defineProps({
  dialogOpen: Boolean,
  selectedItems: Array
});

const emit = defineEmits(['update:selected-items', 'bookmark-updated']);

const appStore = useAppStore();

// Server-side data table state
const loading = ref(false);
const bookmarks = ref([]);
const totalItems = ref(0);
const serverOptions = ref({
  page: 1,
  itemsPerPage: 15,
  sortBy: [{ key: 'created_at', order: 'desc' }],
  search: ''
});

const itemsPerPageOptions = [15, 30, 45, 60, -1];

const focusedRowIndex = ref(-1);

// Edit dialog state
const editDialog = ref(false);
const editLoading = ref(false);
const editForm = ref({
  id: null,
  title: '',
  url: '',
  tags: ''
});
const editError = ref('');
const editSuccess = ref(false);

// Details dialog state
const detailsDialog = ref(false);
const detailsBookmark = ref(null);

// Actions menu state
const actionsMenus = ref({});

// Debounced search state
const searchTimeout = ref(null);

// Watch for search changes from the store with debouncing
watch(() => appStore.bookmarkSearch, (newSearch) => {
  // Clear any existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  // Set up new timeout for debounced search
  searchTimeout.value = setTimeout(() => {
    serverOptions.value.search = newSearch;
    serverOptions.value.page = 1; // Reset to first page when searching
    loadBookmarks();
  }, 1000); // 1000ms delay
});

// Watch for bookmark refresh trigger
watch(() => appStore.bookmarkRefreshTrigger, () => {
  loadBookmarks();
});

const isAllSelected = computed(() => {
  return bookmarks.value.length > 0 && props.selectedItems.length === bookmarks.value.length;
});

const isIndeterminate = computed(() => {
  return props.selectedItems.length > 0 && props.selectedItems.length < bookmarks.value.length;
});

function toggleSelectAll() {
  if (isAllSelected.value) {
    emit('update:selected-items', []);
  } else {
    emit('update:selected-items', [...bookmarks.value.map(item => item.id)]);
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
    focusedRowIndex.value === index && props.selectedItems.includes(item.id)
      ? 'bg-red-darken-3'
      : '',
    focusedRowIndex.value === index && !props.selectedItems.includes(item.id)
      ? 'bg-blue-grey-darken-3'
      : '',
    props.selectedItems.includes(item.id) && focusedRowIndex.value !== index
      ? 'bg-red-darken-3'
      : '',
  ].filter(Boolean).join(' ');
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

// Helper function to format tags for display
function formatTags(tags) {
  if (!tags) return '';
  if (Array.isArray(tags)) {
    return tags.join(', ');
  }
  if (typeof tags === 'string') {
    return tags;
  }
  return '';
}

function openEditDialog(bookmark) {
  // Reset states
  editError.value = '';
  editSuccess.value = false;
  
  // Copy bookmark data to form (properly handle tags)
  editForm.value = {
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    tags: formatTags(bookmark.tags) // Convert array to comma-separated string
  };
  
  editDialog.value = true;
  closeActionsMenu(bookmark.id);
}

function closeEditDialog() {
  editDialog.value = false;
  editForm.value = {
    id: null,
    title: '',
    url: '',
    tags: ''
  };
  editError.value = '';
  editSuccess.value = false;
}

function openDetailsDialog(bookmark) {
  detailsBookmark.value = bookmark;
  detailsDialog.value = true;
  closeActionsMenu(bookmark.id);
}

function closeDetailsDialog() {
  detailsDialog.value = false;
  detailsBookmark.value = null;
}

function openActionsMenu(bookmarkId) {
  // Close all other menus first
  Object.keys(actionsMenus.value).forEach(id => {
    if (id !== bookmarkId) {
      actionsMenus.value[id] = false;
    }
  });
  actionsMenus.value[bookmarkId] = true;
}

function closeActionsMenu(bookmarkId) {
  actionsMenus.value[bookmarkId] = false;
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
    // Convert comma-separated tags back to array
    const tagsArray = editForm.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    const { data, error } = await supabase
      .from('bookmarks')
      .update({ 
        title: editForm.value.title.trim(), 
        url: normalizedUrl,
        tags: tagsArray // Save as array
      })
      .eq('id', editForm.value.id)
      .select()
      .single();

    if (error) throw error;

    editSuccess.value = true;
    
    // Emit event to parent to refresh bookmarks
    emit('bookmark-updated', data);
    
    // Refresh current page data
    await loadBookmarks();
    
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

// Server-side data loading
async function loadBookmarks() {
  loading.value = true;
  
  try {
    const { page, itemsPerPage, sortBy, search } = serverOptions.value;
    
    // Build the query
    let query = supabase
      .from('bookmarks')
      .select(`
        id,
        url,
        title,
        favicon,
        created_at,
        bookmark_tags ( 
          tags (
            id,
            title
          )
        )
      `, { count: 'exact' });
    
    // Apply search if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,url.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
    }
    
    // Apply sorting
    if (sortBy && sortBy.length > 0) {
      const sort = sortBy[0];
      query = query.order(sort.key, { ascending: sort.order === 'asc' });
    } else {
      // Default sort by created_at desc
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination (handle "show all" case)
    if (itemsPerPage !== -1) {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }
    // If itemsPerPage is -1, don't apply range() to get all items
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error loading bookmarks:', error);
      throw error;
    }
    
    bookmarks.value = (data || []).map(b => ({
      ...b,
      tags: (b.bookmark_tags || []).map(bt => bt.tags?.title).filter(Boolean)
    }));
    totalItems.value = count || 0;
    
    
  } catch (error) {
    console.error('Failed to load bookmarks:', error);
    bookmarks.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
}

// Handle server options update (pagination, sorting, etc.)
function updateServerOptions(newOptions) {
  serverOptions.value = { ...serverOptions.value, ...newOptions };
  loadBookmarks();
}

// Keyboard navigation
const handleKeydown = (event) => {
  // Tab to focus on table rows
  if (event.key === 'Tab' && !event.shiftKey && !props.dialogOpen && !editDialog.value && !detailsDialog.value) {
    if (bookmarks.value.length > 0) {
      event.preventDefault();
      focusedRowIndex.value = focusedRowIndex.value < bookmarks.value.length - 1 
        ? focusedRowIndex.value + 1 
        : 0;
    }
  }
  
  // Shift+Tab to go backwards through table rows
  if (event.key === 'Tab' && event.shiftKey && !props.dialogOpen && !editDialog.value && !detailsDialog.value) {
    if (bookmarks.value.length > 0) {
      event.preventDefault();
      focusedRowIndex.value = focusedRowIndex.value > 0 
        ? focusedRowIndex.value - 1 
        : bookmarks.value.length - 1;
    }
  }
  
  // Spacebar to select/deselect focused row
  if (event.key === ' ' && focusedRowIndex.value >= 0 && !props.dialogOpen && !editDialog.value && !detailsDialog.value) {
    event.preventDefault();
    const item = bookmarks.value[focusedRowIndex.value];
    if (item) {
      toggleItemSelection(item.id);
    }
  }
  
  // Arrow keys for navigation
  if (event.key === 'ArrowDown' && bookmarks.value.length > 0 && !editDialog.value && !detailsDialog.value) {
    event.preventDefault();
    focusedRowIndex.value = focusedRowIndex.value < bookmarks.value.length - 1 
      ? focusedRowIndex.value + 1 
      : 0;
  }
  
  if (event.key === 'ArrowUp' && bookmarks.value.length > 0 && !editDialog.value && !detailsDialog.value) {
    event.preventDefault();
    focusedRowIndex.value = focusedRowIndex.value > 0 
      ? focusedRowIndex.value - 1 
      : bookmarks.value.length - 1;
  }

  if (event.key === 'ArrowLeft' && bookmarks.value.length > 0 && !editDialog.value && !detailsDialog.value) {
    event.preventDefault();
    focusedRowIndex.value = -1;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  loadBookmarks();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  
  // Clear any pending search timeout when component unmounts
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
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
    sortable: true,
    width: '400px'
  },
  {
    title: 'URL',
    key: 'url',
    sortable: true,
    width: '400px'
  },
  {
    title: 'Tags',
    key: 'tags',
    sortable: true,
    width: '600px'
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
  const cleanedUrl = url
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '');
  
  return cleanedUrl.length > 50 
    ? cleanedUrl.substring(0, 47) + '...' 
    : cleanedUrl;
}

// Function to search by tag
function searchByTag(tag) {
  appStore.setBookmarkSearch(tag);
}

// Setup keyboard shortcuts
useKeyboardShortcuts({
  onAddBookmark: () => { appStore.openAddBookmarkDialog() },
  onRefreshBookmarks: () => { appStore.triggerBookmarkRefresh() }
});

</script>

<template>
  <v-data-table-server
    :headers="headers"
    :items="bookmarks"
    :items-length="totalItems"
    :loading="loading"
    :search="serverOptions.search"
    :items-per-page-options="itemsPerPageOptions"
    items-per-page="15"
    v-model:options="serverOptions"
    @update:options="updateServerOptions"
    class="elevation-1 bg-transparent"
    density="compact"
    show-current-page
    :mobile-breakpoint="600"
  >

    <template v-slot:top="{ pagination, options, updateServerOptions }">
      <v-data-table-footer
        :pagination="pagination" 
        :options="options"
        :items-per-page-options="itemsPerPageOptions"
        @update:options="updateServerOptions"
        show-current-page
      />
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

    <!-- Custom row styling and events -->
    <template #item="{ item, index }">
      <tr
        :class="getRowClasses(item, index)"
        tabindex="0"
        @dblclick="toggleItemSelection(item.id)"
        class="cursor-pointer"
      >
        <td>
          <v-checkbox
            :model-value="selectedItems.includes(item.id)"
            @update:model-value="() => toggleItemSelection(item.id)"
            hide-details
            density="compact"
          />
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
          <v-list-item
            :href="item.url"
            target="_blank"
            class="text-primary-lighten-3"
            :text="`${displayUrl(item.url)}`"
          >
        </v-list-item>
        </td>
        <td>
          <div v-if="item.tags && item.tags.length > 0">
            <v-chip
              v-for="tag in item.tags"
              :key="tag"
              size="small"
              variant="tonal"
              color="primary-lighten-3"
              class="cursor-pointer mr-1"
              @click="searchByTag(tag)"
              :title="`Click to search for ${tag}`"
            >
              {{ tag }}
            </v-chip>
          </div>
          <span v-else class="text-grey-darken-1">No tags</span>
        </td>
        <td>
          {{ formatDate(item.created_at) }}
        </td>
        <td>
          <v-menu
            v-model="actionsMenus[item.id]"
            :close-on-content-click="true"
            location="bottom end"
            offset="8"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                variant="flat"
                size="small"
                v-bind="props"
                @click="openActionsMenu(item.id)"
                :title="`Actions for ${item.title}`"
              >
                <v-icon icon="mdi-dots-vertical"></v-icon>
              </v-btn>
            </template>
            
            <v-list density="compact" min-width="160">
              <v-list-item
                @click="openDetailsDialog(item)"
                prepend-icon="mdi-eye"
                title="View Details"
              />
              <v-list-item
                @click="openEditDialog(item)"
                prepend-icon="mdi-note-edit"
                title="Edit Bookmark"
              />
            </v-list>
          </v-menu>
        </td>
      </tr>
    </template>

    <template #no-data>
      <v-alert type="info">No bookmarks found.</v-alert>
    </template>
  </v-data-table-server>

  <!-- Details Dialog -->
  <v-dialog 
    v-model="detailsDialog" 
    max-width="600"
  >
    <v-card v-if="detailsBookmark">
      <v-card-title class="d-flex align-center pa-4">
        <v-avatar rounded="0" size="32" class="me-3">
          <img
            :src="detailsBookmark.favicon"
            alt="favicon"
            width="32"
            height="32"
            @error="e => e.target.src = '/favicon.png'"
          />
        </v-avatar>
        Bookmark Details
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <div class="d-flex flex-column ga-4">
          <div>
            <div class="text-caption text-grey-darken-1 mb-1">Title</div>
            <div class="text-h6 text-white" style="line-height: 1.4;">
              {{ detailsBookmark.title }}
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-darken-1 mb-1">URL</div>
            <div class="text-white">
              <a 
                :href="detailsBookmark.url" 
                target="_blank" 
                class="text-primary-lighten-3 text-decoration-none"
              >
                {{ detailsBookmark.url }}
                <v-icon icon="mdi-open-in-new" size="14" class="ml-1" />
              </a>
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-darken-1 mb-1">Tags</div>
            <div>
              <div v-if="detailsBookmark.tags && detailsBookmark.tags.length > 0">
                <v-chip
                  v-for="tag in detailsBookmark.tags"
                  :key="tag"
                  size="small"
                  variant="tonal"
                  color="primary-lighten-3"
                  class="mr-1 mb-1"
                >
                  {{ tag }}
                </v-chip>
              </div>
              <span v-else class="text-grey-darken-1">No tags</span>
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-darken-1 mb-1">Created</div>
            <div class="text-white">
              {{ formatDate(detailsBookmark.created_at) }}
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn
          color="primary"
          variant="flat"
          :href="detailsBookmark.url"
          @click="closeDetailsDialog"
          target="_blank"
          prepend-icon="mdi-open-in-new"
        >
          Open Link
        </v-btn>
        
        <v-spacer />
        
        <v-btn
          variant="text"
          @click="closeDetailsDialog"
        >
          Close this dialog
          <v-badge
            color="grey-darken-3"
            content="Esc"
            inline
          />
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
            label="Tags (comma separated)"
            prepend-icon="mdi-tag"
            :disabled="editLoading"
            hint="Enter tags separated by commas, e.g., programming, vue, tutorial"
            persistent-hint
          />
          
          <v-alert v-if="editError" type="error" class="mt-4">
            {{ editError }}
          </v-alert>
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

.v-table__wrapper table tr {
  user-select: none;
}

.v-table__wrapper table tr:hover {
  background: #2a3236;
}

.v-data-table__th:nth-of-type(4) .v-data-table-header__content {
	padding-left: 16px;
}

.v-table__wrapper table tr td {
  user-select: auto;
}
</style>