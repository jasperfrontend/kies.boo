<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import supabase from '@/lib/supabaseClient';
import NotificationComponent from '@/components/NotificationComponent.vue';

const bookmarks = ref([]);
const loading = ref(false);
const search = ref('');
const itemsPerPage = ref(20);
const selectedItems = ref([]);
const deleting = ref(false);

// Table navigation state
const focusedRowIndex = ref(-1);
const tableRowsRef = ref([]);

// Dialog state for Add Bookmark
const addBookmarkDialog = ref(false);

// Undo delete state
const undoState = ref({
  show: false,
  deletedItems: [],
  timeoutId: null
});

// keyboard shortcut to open the Add Bookmark dialog
const handleKeydown = (event) => {
  if (event.altKey && event.key === 'a') {
    event.preventDefault();
    addBookmarkDialog.value = true;
  }
  
  // Alt+i to trigger immediate delete with undo option
  if (event.altKey && event.key === 'i') {
    event.preventDefault();
    deleteSelectedItems();
  }
  
  // Alt+u to undo delete
  if (event.altKey && event.key === 'u') {
    event.preventDefault();
    if (undoState.value.show) {
      undoDelete();
    }
  }
  
  // Tab to focus on table rows
  if (event.key === 'Tab' && !event.shiftKey) {
    if (filteredBookmarks.value.length > 0) {
      event.preventDefault();
      focusedRowIndex.value = focusedRowIndex.value < filteredBookmarks.value.length - 1 
        ? focusedRowIndex.value + 1 
        : 0;
    }
  }
  
  // Shift+Tab to go backwards through table rows
  if (event.key === 'Tab' && event.shiftKey) {
    if (filteredBookmarks.value.length > 0) {
      event.preventDefault();
      focusedRowIndex.value = focusedRowIndex.value > 0 
        ? focusedRowIndex.value - 1 
        : filteredBookmarks.value.length - 1;
    }
  }
  
  // Spacebar to select/deselect focused row
  if (event.key === ' ' && focusedRowIndex.value >= 0) {
    event.preventDefault();
    const item = filteredBookmarks.value[focusedRowIndex.value];
    if (item) {
      toggleItemSelection(item.id);
    }
  }
  
  // Arrow keys for navigation
  if (event.key === 'ArrowDown' && filteredBookmarks.value.length > 0) {
    event.preventDefault();
    focusedRowIndex.value = focusedRowIndex.value < filteredBookmarks.value.length - 1 
      ? focusedRowIndex.value + 1 
      : 0;
  }
  
  if (event.key === 'ArrowUp' && filteredBookmarks.value.length > 0) {
    event.preventDefault();
    focusedRowIndex.value = focusedRowIndex.value > 0 
      ? focusedRowIndex.value - 1 
      : filteredBookmarks.value.length - 1;
  }
};

// Notification state
const notification = ref({
  show: false,
  type: 'success',
  message: ''
});

const filteredBookmarks = computed(() => {
  if (!search.value) return bookmarks.value;
  return bookmarks.value.filter(b =>
    (b.title && b.title.toLowerCase().includes(search.value.toLowerCase())) ||
    (b.url && b.url.toLowerCase().includes(search.value.toLowerCase()))
  );
});

const isAllSelected = computed(() => {
  return filteredBookmarks.value.length > 0 && 
         selectedItems.value.length === filteredBookmarks.value.length;
});

const isIndeterminate = computed(() => {
  return selectedItems.value.length > 0 && 
         selectedItems.value.length < filteredBookmarks.value.length;
});

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = [...filteredBookmarks.value.map(item => item.id)];
  }
}

function toggleItemSelection(itemId) {
  const index = selectedItems.value.indexOf(itemId);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(itemId);
  }
}


function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  };
}

function closeNotification() {
  notification.value.show = false;
}

function deleteSelectedItems() {
  if (selectedItems.value.length === 0) return;
  
  const itemCount = selectedItems.value.length;
  
  // Store the items that are being deleted
  const itemsToDelete = bookmarks.value.filter(
    bookmark => selectedItems.value.includes(bookmark.id)
  );
  
  // Remove from UI immediately
  bookmarks.value = bookmarks.value.filter(
    bookmark => !selectedItems.value.includes(bookmark.id)
  );
  
  // Store in undo state
  undoState.value.deletedItems = itemsToDelete;
  undoState.value.show = true;
  
  // Clear selections and focus
  selectedItems.value = [];
  focusedRowIndex.value = -1;
  
  // Set timeout to actually delete from database
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId);
  }
  
  undoState.value.timeoutId = setTimeout(() => {
    commitDelete();
  }, 10000); // 10 seconds to undo
}

function undoDelete() {
  // Clear the timeout
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId);
    undoState.value.timeoutId = null;
  }
  
  // Restore items to the bookmarks array
  bookmarks.value = [...bookmarks.value, ...undoState.value.deletedItems];
  
  // Sort by created_at descending to maintain original order
  bookmarks.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Clear undo state
  undoState.value.show = false;
  undoState.value.deletedItems = [];
  
  showNotification('success', 'Items restored successfully.');
}

async function commitDelete() {
  const itemsToDelete = undoState.value.deletedItems;
  const itemCount = itemsToDelete.length;
  
  if (itemCount === 0) return;
  
  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .in('id', itemsToDelete.map(item => item.id));
    
    if (error) {
      console.error('Error deleting bookmarks:', error);
      // If database delete fails, restore the items
      bookmarks.value = [...bookmarks.value, ...itemsToDelete];
      bookmarks.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      showNotification(
        'error',
        `Failed to delete ${itemCount} item${itemCount === 1 ? '' : 's'}. Items have been restored.`
      );
    }
  } catch (error) {
    console.error('Error deleting bookmarks:', error);
    // If database delete fails, restore the items
    bookmarks.value = [...bookmarks.value, ...itemsToDelete];
    bookmarks.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    showNotification(
      'error',
      `Failed to delete ${itemCount} item${itemCount === 1 ? '' : 's'}. Items have been restored.`
    );
  } finally {
    // Clear undo state
    undoState.value.show = false;
    undoState.value.deletedItems = [];
    undoState.value.timeoutId = null;
  }
}

function dismissUndo() {
  // User explicitly dismisses the undo option
  commitDelete();
}

async function onBookmarkAdded() {
  try {
    await fetchBookmarks();
    addBookmarkDialog.value = false;
  } catch (error) {
    console.error('Failed to refresh bookmarks:', error);
    showNotification('error', 'Failed to refresh bookmarks');
  }
}

async function fetchBookmarks() {
  loading.value = true;
  let { data, error } = await supabase
    .from('bookmarks')
    .select('id, url, title, favicon, created_at')
    .order('created_at', { ascending: false });
  if (!error) bookmarks.value = data;
  loading.value = false;
}

function getRowClasses(item, index) {
  return [
    'cursor-pointer transition-colors duration-200',
    focusedRowIndex.value === index && selectedItems.value.includes(item.id)
      ? 'bg-blue-200 ring-2 ring-blue-400 ring-inset'
      : '',
    focusedRowIndex.value === index && !selectedItems.value.includes(item.id)
      ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset'
      : '',
    selectedItems.value.includes(item.id) && focusedRowIndex.value !== index
      ? 'bg-blue-100'
      : '',
  ].filter(Boolean).join(' ');
}


onMounted(() => {
  fetchBookmarks();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  // Clean up timeout if component unmounts
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId);
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
];
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4 d-flex align-items-center">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Search bookmarks"
          prepend-inner-icon="mdi-magnify"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-dialog v-model="addBookmarkDialog" max-width="500">
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn
              v-bind="activatorProps"
              color="surface-variant"
              text="Add Bookmark (Alt+A)"
              variant="flat"
            ></v-btn>
            <v-btn v-if="selectedItems.length > 0"
              color="error"
              variant="elevated"
              :loading="deleting"
              @click="deleteSelectedItems"
              class="mx-4"
            >
              Delete {{ selectedItems.length }} item{{ selectedItems.length === 1 ? '' : 's' }} (alt+i)
            </v-btn>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card title="Add a new bookmark">
              <v-card-text>
                <AddBookmark @bookmark-added="onBookmarkAdded" />
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                  text="Close this"
                  @click="addBookmarkDialog = false"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="filteredBookmarks"
      :items-per-page="itemsPerPage === -1 ? filteredBookmarks.length : itemsPerPage"
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
        >
          <td class="pa-2">
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
              class="text-blue-600 hover:text-blue-800"
            >{{ item.url }}</a>
          </td>
          <td class="pa-2">
            {{
              (() => {
                const d = new Date(item.created_at);
                const pad = n => String(n).padStart(2, '0');
                return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
              })()
            }}
          </td>
        </tr>

      </template>

      <!-- Select all checkbox in header -->
      <template #header.select="{ column }">
        <v-checkbox
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          @update:model-value="toggleSelectAll"
          hide-details
          density="compact"
        />
      </template>

      <!-- Individual checkboxes (not strictly needed due to item slot override) -->
      <template #item.select="{ item, index }">
        <v-checkbox
          :model-value="selectedItems.includes(item.id)"
          @update:model-value="(value) => toggleItemSelection(item.id)"
          hide-details
          density="compact"
        />
      </template>

      <template #item.favicon="{ item }">
        <v-avatar rounded="0" size="24">
          <img
            :src="item.favicon"
            alt="favicon"
            width="24"
            height="24"
            @error="e => e.target.src = '/favicon.png'"
          />
        </v-avatar>
      </template>

      <template #item.url="{ item }">
        <a :href="item.url" target="_blank" class="text-blue-600 hover:text-blue-800">{{ item.url }}</a>
      </template>

      <template #item.created_at="{ item }">
        {{
          (() => {
            const d = new Date(item.created_at);
            const pad = n => String(n).padStart(2, '0');
            return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
          })()
        }}
      </template>

      <template #no-data>
        <v-alert type="info">No bookmarks found.</v-alert>
      </template>
    </v-data-table>


    <!-- Undo Delete Snackbar -->
    <v-snackbar
      v-model="undoState.show"
      :timeout="-1"
      color="info"
      location="bottom"
      class="mb-4"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-information</v-icon>
        <span>
          {{ undoState.deletedItems.length }} item{{ undoState.deletedItems.length === 1 ? '' : 's' }} deleted
        </span>
      </div>
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="undoDelete"
          color="white"
        >
          Undo (Alt+U)
        </v-btn>
        <v-btn
          variant="text"
          @click="dismissUndo"
          color="white"
        >
          Dismiss
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Notification Component -->
    <NotificationComponent
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      position="bottom-right"
      @close="closeNotification"
    />
  </v-container>
</template>