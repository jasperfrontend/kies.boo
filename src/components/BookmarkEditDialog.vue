<template>
  <v-dialog
    max-width="500"
    :model-value="modelValue"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-form ref="formRef" @submit.prevent="handleSave">
      <v-card title="Edit Bookmark">
        <v-card-text>
          <v-text-field
            v-model="form.title"
            autofocus
            :disabled="loading"
            label="Title"
            prepend-icon="mdi-bookmark"
          />
          <v-text-field
            v-model="form.url"
            :disabled="loading"
            label="URL"
            prepend-icon="mdi-link"
          />
          <v-text-field
            v-model="form.tags"
            :disabled="loading"
            hint="Enter tags separated by commas, e.g., programming, vue, tutorial"
            label="Tags (comma separated)"
            persistent-hint
            prepend-icon="mdi-tag"
          />

          <!-- Color Selector Component -->
          <BookmarkColorPicker
            v-model="selectedColor"
            :auto-detected-color="autoDetectedColor"
          />

          <v-alert v-if="error" class="mt-4" type="error">
            {{ error }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            :disabled="loading"
            :loading="loading"
            text="Save Changes"
            type="submit"
          >
            Save Changes
            <v-tooltip activator="parent" location="bottom">Ctrl+s</v-tooltip>
          </v-btn>
          <v-btn
            :disabled="loading"
            text="Cancel"
            @click="handleCancel"
          >
            <v-tooltip activator="parent" location="bottom">Escape</v-tooltip>
            Cancel
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useHotkey } from 'vuetify'
  import BookmarkColorPicker from '@/components/BookmarkColorPicker.vue'
  import supabase from '@/lib/supabaseClient'

  const props = defineProps({
    modelValue: Boolean,
    bookmark: Object,
  })

  const emit = defineEmits(['update:modelValue', 'bookmark-updated'])

  const form = ref({
    id: null,
    title: '',
    url: '',
    tags: '',
  })

  const loading = ref(false)
  const error = ref('')
  const formRef = ref(null)
  const selectedColor = ref(null)

  // Get auto-detected color from bookmark metadata
  const autoDetectedColor = computed(() => {
    return props.bookmark?.metadata?.vibrant_color_hex || null
  })

  useHotkey('esc', () => {
    handleCancel()
  }, {
    inputs: true,
  })

  // Handle save action hotkey event
  function handleSaveAction (event) {
    // Only trigger if this dialog is open and form is not loading
    if (props.modelValue && formRef.value && !loading.value) {
      event.preventDefault()
      handleSave()
    }
  }

  // Watch for bookmark changes to populate form
  watch(() => props.bookmark, newBookmark => {
    if (newBookmark) {
      form.value = {
        id: newBookmark.id,
        title: newBookmark.title,
        url: newBookmark.url,
        tags: formatTags(newBookmark.tags),
      }

      // Set the selected color from metadata
      selectedColor.value = newBookmark.metadata?.selected_color || null
      error.value = ''
    }
  }, { immediate: true })

  function formatTags (tags) {
    if (!tags) return ''
    if (Array.isArray(tags)) {
      return tags.join(', ')
    }
    if (typeof tags === 'string') {
      return tags
    }
    return ''
  }

  function normalizeUrl (url) {
    if (!url) return url
    url = url.trim()
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const urlPattern = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/
    if (urlPattern.test(url)) return `https://${url}`
    return url
  }

  function isValidUrl (url) {
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

  function getSelectedColorSource () {
    if (!selectedColor.value) return null

    if (selectedColor.value === autoDetectedColor.value) {
      return 'auto-detected'
    }

    // Check if it's a preset color (from the component's preset list)
    const presetColors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
      '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
      '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B',
    ]

    if (presetColors.includes(selectedColor.value)) {
      return 'preset'
    }

    return 'custom'
  }

  function hexToRgb (hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
      : null
  }

  async function handleSave () {
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

      // Step 1: Update the bookmark itself (including metadata with selected color)
      const existingMetadata = props.bookmark.metadata || {}
      const updatedMetadata = {
        ...existingMetadata,
        selected_color: selectedColor.value || null,
        selected_color_source: getSelectedColorSource(),
      }

      // If user selected a color, override avg_color and vibrant_color with selected color RGB
      if (selectedColor.value) {
        const selectedColorRgb = hexToRgb(selectedColor.value)
        if (selectedColorRgb) {
          updatedMetadata.avg_color = [selectedColorRgb.r, selectedColorRgb.g, selectedColorRgb.b]
          updatedMetadata.vibrant_color = [selectedColorRgb.r, selectedColorRgb.g, selectedColorRgb.b]
        }
      }

      const { error: bookmarkUpdateError } = await supabase
        .from('bookmarks')
        .update({
          title: form.value.title.trim(),
          url: normalizedUrl,
          metadata: updatedMetadata,
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
        const existingTagTitles = new Set(existingTags.map(tag => tag.title))
        tagIds = existingTags.map(tag => tag.id)

        // Find tags that don't exist yet
        const newTagTitles = tagsArray.filter(tag => !existingTagTitles.has(tag))

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
          tag_id: tagId,
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

      error.value = error.code === '23505' ? 'This URL is already bookmarked.' : error.message || 'Failed to update bookmark.'
    } finally {
      loading.value = false
    }
  }

  function handleCancel () {
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
