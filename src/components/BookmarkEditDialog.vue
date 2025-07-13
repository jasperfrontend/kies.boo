<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
    persistent
  >
    <v-form @submit.prevent="handleSave" ref="formRef">
      <v-card title="Edit Bookmark">
        <v-card-text>
          <v-text-field
            v-model="form.title"
            label="Title"
            prepend-icon="mdi-bookmark"
            :disabled="loading"
            autofocus
          />
          <v-text-field
            v-model="form.url"
            label="URL"
            prepend-icon="mdi-link"
            :disabled="loading"
          />
          <v-text-field
            v-model="form.tags"
            label="Tags (comma separated)"
            prepend-icon="mdi-tag"
            :disabled="loading"
            hint="Enter tags separated by commas, e.g., programming, vue, tutorial"
            persistent-hint
          />
          
          <v-alert v-if="error" type="error" class="mt-4">
            {{ error }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="loading"
            :disabled="loading"
            text="Save Changes"
            color="primary"
            type="submit"
          >
            Save Changes
            <v-badge
              color="grey-darken-3"
              content="Ctrl+S"
              inline
            />
          </v-btn>
          <v-btn
            text="Cancel"
            @click="handleCancel"
            :disabled="loading"
          />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import supabase from '@/lib/supabaseClient'

const props = defineProps({
  modelValue: Boolean,
  bookmark: Object
})

const emit = defineEmits(['update:modelValue', 'bookmark-updated'])

const form = ref({
  id: null,
  title: '',
  url: '',
  tags: ''
})

const loading = ref(false)
const error = ref('')
const formRef = ref(null)

// Handle save action hotkey event
function handleSaveAction(event) {
  // Only trigger if this dialog is open and form is not loading
  if (props.modelValue && formRef.value && !loading.value) {
    event.preventDefault()
    handleSave()
  }
}

// Watch for bookmark changes to populate form
watch(() => props.bookmark, (newBookmark) => {
  if (newBookmark) {
    form.value = {
      id: newBookmark.id,
      title: newBookmark.title,
      url: newBookmark.url,
      tags: formatTags(newBookmark.tags)
    }
    error.value = ''
  }
}, { immediate: true })

function formatTags(tags) {
  if (!tags) return ''
  if (Array.isArray(tags)) {
    return tags.join(', ')
  }
  if (typeof tags === 'string') {
    return tags
  }
  return ''
}

function normalizeUrl(url) {
  if (!url) return url
  url = url.trim()
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const urlPattern = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/
  if (urlPattern.test(url)) return `https://${url}`
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

async function handleSave() {
  error.value = ''
  
  // Validation
  if (!form.value.title.trim()) {
    error.value = 'Please enter a title for the bookmark.'
    return
  }

  if (!form.value.url.trim()) {
    error.value = 'Please enter a URL for the bookmark.'
    return
  }

  if (!form.value.tags.trim()) {
    error.value = 'Please enter 1 or more tags for the bookmark.'
    return
  }

  const normalizedUrl = normalizeUrl(form.value.url)
  if (!isValidUrl(normalizedUrl)) {
    error.value = 'Please enter a valid URL (e.g., example.com or https://example.com).'
    return
  }

  loading.value = true

  try {
    // Parse tags from comma-separated string
    const tagsArray = form.value.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
    
    // Step 1: Update the bookmark itself
    const { error: bookmarkUpdateError } = await supabase
      .from('bookmarks')
      .update({ 
        title: form.value.title.trim(), 
        url: normalizedUrl
      })
      .eq('id', form.value.id)

    if (bookmarkUpdateError) throw bookmarkUpdateError

    // Step 2: Handle tags - check existing and create new ones
    let tagIds = []
    
    if (tagsArray.length > 0) {
      // First, check which tags already exist
      const { data: existingTags, error: fetchError } = await supabase
        .from('tags')
        .select('id, title')
        .in('title', tagsArray)

      if (fetchError) {
        console.error('Error fetching existing tags:', fetchError)
        throw fetchError
      }

      // Get the titles of existing tags
      const existingTagTitles = existingTags.map(tag => tag.title)
      tagIds = existingTags.map(tag => tag.id)

      // Find tags that don't exist yet
      const newTagTitles = tagsArray.filter(tag => !existingTagTitles.includes(tag))

      // Insert only the new tags
      if (newTagTitles.length > 0) {
        const newTagInserts = newTagTitles.map(tag => ({ title: tag }))
        
        const { data: insertedTags, error: insertError } = await supabase
          .from('tags')
          .insert(newTagInserts)
          .select('id, title')

        if (insertError) {
          console.error('Error inserting new tags:', insertError)
          throw insertError
        }

        // Add the new tag IDs to our list
        tagIds = [...tagIds, ...insertedTags.map(tag => tag.id)]
      }
    }

    // Step 3: Remove existing bookmark-tag relationships for this bookmark
    const { error: deleteRelationshipsError } = await supabase
      .from('bookmark_tags')
      .delete()
      .eq('bookmark_id', form.value.id)

    if (deleteRelationshipsError) throw deleteRelationshipsError

    // Step 4: Create new bookmark-tag relationships (only if there are tags)
    if (tagIds.length > 0) {
      const bookmarkTagLinks = tagIds.map(tagId => ({
        bookmark_id: form.value.id,
        tag_id: tagId
      }))

      const { error: linkInsertError } = await supabase
        .from('bookmark_tags')
        .insert(bookmarkTagLinks)

      if (linkInsertError) throw linkInsertError
    }

    emit('bookmark-updated')
    emit('update:modelValue', false)

  } catch (error) {
    console.error('Error updating bookmark:', error)
    
    if (error.code === '23505') {
      error.value = 'This URL is already bookmarked.'
    } else {
      error.value = error.message || 'Failed to update bookmark.'
    }
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('update:modelValue', false)
  error.value = ''
}

onMounted(() => {
  // Listen for save action hotkey event
  document.addEventListener('save-current-action', handleSaveAction)
})

onUnmounted(() => {
  document.removeEventListener('save-current-action', handleSaveAction)
})
</script>