<template>
  <v-card class="pa-0 pa-lg-6" max-width="500" outlined>
    <v-card-title>Add Bookmark</v-card-title>

    <v-form ref="formRef" @submit.prevent="onSubmit">

      <v-alert
        v-if="clipboardNotice"
        border="start"
        class="mb-1"
        density="compact"
        type="info"
        variant="tonal"
      >
        Link detected on your clipboard, we went ahead and pasted that for you.
        <v-btn
          class="ml-2 text-decoration-underline"
          size="x-small"
          variant="text"
          @click="undoClipboardPaste"
        >
          Undo
        </v-btn>
      </v-alert>

      <v-text-field
        v-model="form.url"
        autofocus
        label="URL"
        :loading="harvestLoading"
        persistent-hint
        prepend-icon="mdi-link"
        @blur="handleUrlBlur"
        @focus="tryReadClipboard"
      />

      <v-text-field
        v-model="form.title"
        label="Title"
        prepend-icon="mdi-bookmark"
      />

      <v-text-field
        v-model="form.tags"
        hint="Enter tags separated by commas, e.g., programming, vue, tutorial"
        label="Tags (comma separated)"
        persistent-hint
        prepend-icon="mdi-tag"
      />

      <!-- Color Selector Component -->
      <BookmarkColorPicker
        v-model="selectedColor"
        :auto-detected-color="harvestedVibrantColor"
      />

      <v-alert v-if="error" class="mt-4" type="error">
        {{ error }}
      </v-alert>

      <v-btn
        block
        class="mt-4"
        color="primary"
        :disabled="loading"
        :loading="loading"
        type="submit"
        variant="outlined"
      >
        Add Bookmark
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          Ctrl+s
        </v-tooltip>
      </v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue'
  import BookmarkColorPicker from '@/components/BookmarkColorPicker.vue'
  import supabase from '@/lib/supabaseClient'

  const clipboardNotice = ref(false)
  const previousUrl = ref('')
  const formRef = ref(null)

  // Color selector state
  const selectedColor = ref(null)
  const harvestedVibrantColor = ref(null)

  // Watch for harvested color changes
  watch(harvestedVibrantColor, (newColor) => {
    if (newColor && !selectedColor.value) {
      selectedColor.value = newColor
    }
  })

  // Handle save action hotkey event
  function handleSaveAction (event) {
    // Only trigger if this form is visible/active
    if (formRef.value && !loading.value) {
      event.preventDefault()
      onSubmit()
    }
  }

  async function tryReadClipboard () {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      console.log('Clipboard API not supported. To enable the Clipboard API in Firefox, navigate to about:config in the address bar, accept the risk, and then search for and set dom.events.asyncClipboard.clipboardItem and dom.events.asyncClipboard.readText to true.')
      return
    }

    try {
      const clipboardText = await navigator.clipboard.readText()

      if (clipboardText && isValidUrl(normalizeUrl(clipboardText)) && (!form.value.url || form.value.url !== normalizeUrl(clipboardText))) {
        previousUrl.value = form.value.url
        form.value.url = normalizeUrl(clipboardText)
        clipboardNotice.value = true

        await harvestMetadata(normalizeUrl(clipboardText))

        setTimeout(() => {
          clipboardNotice.value = false
        }, 5000)
      }
    } catch (error_) {
      console.log('Could not read clipboard:', error_.message)
    }
  }

  function undoClipboardPaste () {
    form.value.url = previousUrl.value
    clipboardNotice.value = false
    harvestedData.value = null
    harvestedVibrantColor.value = null
    selectedColor.value = null
  }

  async function handleUrlBlur () {
    const url = form.value.url.trim()
    if (url && isValidUrl(normalizeUrl(url))) {
      await harvestMetadata(normalizeUrl(url))
    }
  }

  // Auth
  const emit = defineEmits(['bookmarkAdded'])
  const isAuthenticated = ref(false)
  const user = ref(null)

  onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    isAuthenticated.value = !!session
    user.value = session?.user || null
    supabase.auth.onAuthStateChange((_event, session) => {
      isAuthenticated.value = !!session
      user.value = session?.user || null
    })

    // Listen for save action hotkey event
    document.addEventListener('save-current-action', handleSaveAction)
  })

  onUnmounted(() => {
    document.removeEventListener('save-current-action', handleSaveAction)
  })

  // Form
  const form = ref({
    title: '',
    url: '',
    tags: '',
  })
  const loading = ref(false)
  const error = ref('')
  const success = ref(false)
  const harvestLoading = ref(false)
  const harvestedData = ref(null)

  // Metadata harvesting
  async function harvestMetadata (url) {
    if (!url || !isValidUrl(url)) return

    harvestLoading.value = true

    try {
      const response = await fetch(`${import.meta.env.VITE_HARVEST_API_URL}/harvest/harvest.php?url=${encodeURIComponent(url)}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      harvestedData.value = data

      if (!form.value.title && data.title) {
        form.value.title = data.title
      }

      if (!form.value.tags && data.meta?.keywords) {
        const keywords = data.meta.keywords
          .split(',')
          .map(keyword => keyword.trim())
          .filter(keyword => keyword.length > 0)
          .slice(0, 5)

        if (keywords.length > 0) {
          form.value.tags = keywords.join(', ')
        }
      }

      // Set harvested vibrant color
      if (data.vibrant_color_hex) {
        harvestedVibrantColor.value = data.vibrant_color_hex
        // Auto-select the harvested color if no color is currently selected
        if (!selectedColor.value) {
          selectedColor.value = data.vibrant_color_hex
        }
      }
    } catch (error_) {
      console.error('Failed to harvest metadata:', error_)
    } finally {
      harvestLoading.value = false
    }
  }

  function getBestFavicon () {
    if (!harvestedData.value) {
      return `https://www.google.com/s2/favicons?domain=${normalizeUrl(form.value.url)}&sz=128`
    }

    return harvestedData.value.favicon || `https://www.google.com/s2/favicons?domain=${normalizeUrl(form.value.url)}&sz=128`
  }

  function getMetadata () {
    const baseMetadata = {
      selected_color: selectedColor.value || null,
      selected_color_source: getSelectedColorSource(),
    }

    if (!harvestedData.value) {
      // If user selected a color but no harvested data, use selected color for avg and vibrant
      if (selectedColor.value) {
        const selectedColorRgb = hexToRgb(selectedColor.value)
        if (selectedColorRgb) {
          baseMetadata.avg_color = [selectedColorRgb.r, selectedColorRgb.g, selectedColorRgb.b]
          baseMetadata.vibrant_color = [selectedColorRgb.r, selectedColorRgb.g, selectedColorRgb.b]
        }
      }
      return baseMetadata
    }

    // Create metadata object with harvested data
    const metadata = {
      title: harvestedData.value.title || null,
      description: harvestedData.value.description || null,
      favicon: harvestedData.value.favicon || null,
      og_image: harvestedData.value.og_image || null,
      avg_color: harvestedData.value.avg_color || null,
      avg_color_hex: harvestedData.value.avg_color_hex || null,
      vibrant_color: harvestedData.value.vibrant_color || null,
      vibrant_color_hex: harvestedData.value.vibrant_color_hex || null,
      ...baseMetadata,
    }

    // If user selected a color, override avg_color and vibrant_color with selected color RGB
    if (selectedColor.value) {
      const selectedColorRgb = hexToRgb(selectedColor.value)
      if (selectedColorRgb) {
        metadata.avg_color = [selectedColorRgb.r, selectedColorRgb.g, selectedColorRgb.b]
        metadata.vibrant_color = [selectedColorRgb.r, selectedColorRgb.g, selectedColorRgb.b]
      }
    }

    // Include any other metadata that might be useful
    if (harvestedData.value.meta) {
      metadata.meta = harvestedData.value.meta
    }

    return metadata
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  function getSelectedColorSource() {
    if (!selectedColor.value) return null
    
    if (selectedColor.value === harvestedVibrantColor.value) {
      return 'auto-detected'
    }
    
    // Check if it's a preset color (from the component's preset list)
    const presetColors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
      '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
      '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'
    ]
    
    if (presetColors.includes(selectedColor.value)) {
      return 'preset'
    }
    
    return 'custom'
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

  async function onSubmit () {
    error.value = ''
    success.value = false

    if (!user.value) {
      error.value = 'You must be logged in to add a bookmark.'
      return
    }

    if (!form.value.title.trim()) {
      error.value = 'Please enter a title for the bookmark.'
      return
    }

    if (!form.value.url.trim()) {
      error.value = 'Please enter a URL for the bookmark.'
      return
    }

    const normalizedUrl = normalizeUrl(form.value.url)

    if (!isValidUrl(normalizedUrl)) {
      error.value = 'Please enter a valid URL.'
      return
    }

    loading.value = true

    const faviconUrl = getBestFavicon()
    const metadata = getMetadata()
    const tagsArray = form.value.tags
      ? form.value.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean)
      : []

    try {
      // Step 1: Handle tags - check existing and create new ones
      let tagIds = []

      if (tagsArray.length > 0) {
        const { data: existingTags, error: fetchError } = await supabase
          .from('tags')
          .select('id, title')
          .in('title', tagsArray)

        if (fetchError) {
          console.error('Error fetching existing tags:', fetchError)
          throw fetchError
        }

        const existingTagTitles = new Set(existingTags.map(tag => tag.title))
        tagIds = existingTags.map(tag => tag.id)

        const newTagTitles = tagsArray.filter(tag => !existingTagTitles.has(tag))

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

          tagIds = [...tagIds, ...insertedTags.map(tag => tag.id)]
        }
      }

      // Step 2: Insert the bookmark with metadata (including selected color)
      const { data: insertData, error: insertError } = await supabase
        .from('bookmarks')
        .insert([{
          title: form.value.title,
          url: normalizedUrl,
          favicon: faviconUrl,
          metadata: metadata, // Add the metadata including selected color
          user_id: user.value.id,
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting bookmark:', insertError)
        throw insertError
      }

      // Step 3: Associate bookmark with tags (only if there are tags)
      if (tagIds.length > 0) {
        const bookmarkTagLinks = tagIds.map(tagId => ({
          bookmark_id: insertData.id,
          tag_id: tagId,
        }))

        const { error: linkError } = await supabase
          .from('bookmark_tags')
          .insert(bookmarkTagLinks)

        if (linkError) {
          console.error('Error linking bookmark with tags:', linkError)
          throw linkError
        }
      }

      success.value = true
      form.value = { title: '', url: '', tags: '' }
      clipboardNotice.value = false
      harvestedData.value = null
      harvestedVibrantColor.value = null
      selectedColor.value = null
      emit('bookmark-added')
    } catch (error_) {
      console.error('Error in onSubmit:', error_)
      error.value = error_.message || 'Failed to add bookmark.'
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.v-card {
  margin: auto;
}
</style>