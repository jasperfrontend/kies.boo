<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h4 mb-4">
            Your saved tags
          </v-card-title>
          <v-card-text class="mb-6">
            <div v-if="tagsData.length === 0" class="text-center text-grey-darken-1">
              <v-icon icon="mdi-tag-outline" size="48" class="mb-2" />
              <p>No tags yet</p>
              <p class="text-caption">Tags will appear here as you create bookmarks with tags</p>
            </div>

            <v-chip
              v-for="(tag, index) in tagsData"
              :key="tag.id || index"
              variant="tonal"
              color="primary-lighten-3"
              class="cursor-pointer mr-2 mb-2"
              @click="handleSearchTag(tag.title)"
              :title="`Click to search for ${tag.title}`"
              closable
              @click:close="handleDeleteTag(tag)"
            >
              {{ tag.title }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h4 mb-4">
            Tags do not auto-delete
          </v-card-title>
          <v-card-text class="mb-6">
            <p class="mb-6">Due to their shared nature, tags do not get removed when you delete a bookmark. Should you want to clean up unused tags,
            you can do so by clicking the button below.</p>
            <v-btn @click="dialog = true" color="primary">
              Clean unused tags
            </v-btn>
          </v-card-text>
        </v-card>

        <div class="text-center pa-4">
          <v-dialog
            v-model="dialog"
            max-width="400"
            persistent
          >
            <v-card
              prepend-icon="mdi-alert"
              title="Confirm removal of unused tags"
              text="Are you sure you want to clean unused tags?"
            >
              <template v-slot:actions>
                <v-spacer></v-spacer>

                <v-btn 
                  @click="dialog = false"
                  variant="flat"
                  color="black"
                >
                  No, keep 'em
                </v-btn>

                <v-btn 
                  @click="deleteUnusedTags(); dialog = false" 
                  color="primary"
                  variant="flat"
                >
                  Yes, remove
                </v-btn>
              </template>
            </v-card>
          </v-dialog>
        </div>
      </v-col>
    </v-row>

    <!-- Notification Component -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type"
      :timeout="3000"
      location="bottom right"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="notification.type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'" 
          class="me-2" 
        />
        {{ notification.message }}
      </div>
    </v-snackbar>

    <!-- Confirmation Dialog for individual tag deletion -->
    <v-dialog v-model="confirmDialog.show" max-width="400" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-delete" class="mr-2" color="error" />
          Confirm Deletion
        </v-card-title>
        
        <v-card-text>
          Are you sure you want to delete this tag?
          <v-code class="d-block mt-2 pa-2">{{ confirmDialog.tagTitle }}</v-code>
          <v-alert type="warning" variant="tonal" class="mt-3">
            This will remove the tag from all your bookmarks that use it.
          </v-alert>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="confirmDialog.show = false"
            :disabled="deleting"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            variant="flat"
            @click="confirmDeleteTag"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import supabase from '@/lib/supabaseClient';

const tagsData = ref([])
const tagsPerPage = ref('all')
const dialog = ref(false)
const deleting = ref(false)

// Notification state (same as saved searches)
const notification = ref({
  show: false,
  type: 'success',
  message: ''
});

// Confirmation dialog state (same as saved searches)
const confirmDialog = ref({
  show: false,
  tag: null,
  tagTitle: ''
})

const router = useRouter()

function handleSearchTag(tag) {
  router.push(`/tag/${encodeURIComponent(tag)}`)
}

function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  };
}

function handleDeleteTag(tag) {
  // Show confirmation dialog (same pattern as saved searches)
  confirmDialog.value = {
    show: true,
    tag: tag,
    tagTitle: tag.title
  }
}

async function confirmDeleteTag() {
  if (!confirmDialog.value.tag) return
  
  deleting.value = true
  
  try {
    // Get current user to ensure we only delete their tags
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      showNotification('error', 'You must be logged in to delete tags')
      return
    }
    
    const userId = session.user.id
    const tagToDelete = confirmDialog.value.tag
    
    // First, get all bookmark IDs for the current user
    const { data: userBookmarks, error: bookmarkFetchError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
    
    if (bookmarkFetchError) {
      console.error('Error fetching user bookmarks:', bookmarkFetchError)
      showNotification('error', 'Failed to fetch user bookmarks')
      return
    }
    
    // Extract bookmark IDs
    const bookmarkIds = userBookmarks.map(bookmark => bookmark.id)
    
    // Delete bookmark_tags relationships for this tag and user's bookmarks
    if (bookmarkIds.length > 0) {
      const { error: relationshipError } = await supabase
        .from('bookmark_tags')
        .delete()
        .eq('tag_id', tagToDelete.id)
        .in('bookmark_id', bookmarkIds)
      
      if (relationshipError) {
        console.error('Error deleting tag relationships:', relationshipError)
        showNotification('error', 'Failed to delete tag relationships')
        return
      }
    }
    
    // Then delete the tag itself (only if it belongs to the current user)
    const { error: tagError } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagToDelete.id)
      .eq('user_id', userId) // Ensure we only delete current user's tags
    
    if (tagError) {
      console.error('Error deleting tag:', tagError)
      showNotification('error', 'Failed to delete tag')
      return
    }
    
    // Remove from local state (update UI)
    tagsData.value = tagsData.value.filter(tag => tag.id !== tagToDelete.id)
    
    showNotification('success', `Deleted tag: ${tagToDelete.title}`)
    
  } catch (error) {
    console.error('Error deleting tag:', error)
    showNotification('error', 'Failed to delete tag')
  } finally {
    deleting.value = false
    confirmDialog.value.show = false
    confirmDialog.value.tag = null
    confirmDialog.value.tagTitle = ''
  }
}

async function getTags(pagination) {
  // Get current user to only fetch their tags
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    showNotification('error', 'You must be logged in to view tags')
    return
  }
  
  const userId = session.user.id
  
  const query = supabase
    .from('tags')
    .select('id, title')
    .eq('user_id', userId) // Only get current user's tags
    .order('title', {ascending: true});
    
  if (pagination !== 'all') {
    query.limit(pagination);
  }

  const { data, error } = await query;

  if (error) {
    console.log("Error retrieving tags: ", error);
    showNotification('error', 'Error retrieving tags!');
    return;
  }

  tagsData.value = data || [];
}

async function deleteUnusedTags() {
  const { data, error } = await supabase.rpc('delete_unused_tags');
  let number = data ?? 0;

  if (error) {
    console.error('Could not clean orphaned tags:', error.message);
    showNotification('error', 'Error deleting unused tags.');
  } else {
    showNotification('success', `${number} unused tag${number !== 1 ? 's' : ''} removed.`);

    setTimeout(() => {
      dialog.value = false; 
      getTags(tagsPerPage.value)
    }, 5000);
  }
}

// Initial fetch
onMounted(() => {
  getTags(tagsPerPage.value)
})
</script>