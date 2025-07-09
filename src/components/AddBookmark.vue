<template>
  <v-card class="pa-6" max-width="500" outlined>
    <v-card-title>Add Bookmark</v-card-title>

    <v-form @submit.prevent="onSubmit">

      <v-alert
        v-if="clipboardNotice"
        type="info"
        density="compact"
        border="start"
        variant="tonal"
        class="mb-1"
      >
        Link detected on your clipboard, we went ahead and pasted that for you.
        <v-btn
          size="x-small"
          variant="text"
          class="ml-2 text-decoration-underline"
          @click="undoClipboardPaste"
        >
          Undo
        </v-btn>
      </v-alert>

      <v-text-field
        v-model="form.url"
        label="URL"
        prepend-icon="mdi-link"
        :loading="harvestLoading"
        @focus="tryReadClipboard"
        @blur="handleUrlBlur"
        persistent-hint
        autofocus
      />


      <v-text-field
        v-model="form.title"
        label="Title"
        prepend-icon="mdi-bookmark"
        
      ></v-text-field>


      <v-text-field
        v-model="form.tags"
        label="Tags (comma separated)"
        prepend-icon="mdi-tag"
        hint="Enter tags separated by commas, e.g., programming, vue, tutorial"
        persistent-hint
      ></v-text-field>
      
      <v-alert v-if="error" type="error" class="mt-4">
        {{ error }}
      </v-alert>
      
      <v-btn
        :loading="loading"
        :disabled="loading"
        color="primary"
        variant="outlined"
        type="submit"
        class="mt-4"
        block
      >
        Add Bookmark 
        <v-badge
          color="grey-darken-3"
          content="Enter"
          inline
        ></v-badge>
      </v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import supabase from '@/lib/supabaseClient'

const clipboardNotice = ref(false)
const previousUrl = ref('')

const tagData = ref([])
const bookmarkData = ref(null)
const junctionData = ref(null)

async function tryReadClipboard() {
  // Check if clipboard API is supported
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    console.log('Clipboard API not supported')
    return
  }

  try {
    // Read text from clipboard
    const clipboardText = await navigator.clipboard.readText()
    
    if (clipboardText && isValidUrl(normalizeUrl(clipboardText))) {
      // Only paste if the URL field is empty or if it's different from current value
      if (!form.value.url || form.value.url !== normalizeUrl(clipboardText)) {
        previousUrl.value = form.value.url
        form.value.url = normalizeUrl(clipboardText)
        clipboardNotice.value = true
        
        // Auto-harvest metadata when URL is pasted from clipboard
        await harvestMetadata(normalizeUrl(clipboardText))
        
        // Auto-hide the notice after 5 seconds
        setTimeout(() => {
          clipboardNotice.value = false
        }, 5000)
      }
    }
  } catch (err) {
    // Handle permission denied or other errors silently
    console.log('Could not read clipboard:', err.message)
  }
}

function undoClipboardPaste() {
  form.value.url = previousUrl.value
  clipboardNotice.value = false
  harvestedData.value = null // Clear harvested data when undoing
}

// Handle URL field blur to harvest metadata
async function handleUrlBlur() {
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
})

// Form
const form = ref({
  title: '',
  url: '',
  tags: ''
})
const loading = ref(false)
const error = ref('')
const success = ref(false)
const harvestLoading = ref(false)
const harvestedData = ref(null)

// Metadata harvesting
async function harvestMetadata(url) {
  if (!url || !isValidUrl(url)) return
  
  harvestLoading.value = true
  
  try {
    const response = await fetch(`https://jasper.monster/harvest/harvest.php?url=${encodeURIComponent(url)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    harvestedData.value = data
    
    // Auto-fill title if it's empty and we got a title
    if (!form.value.title && data.title) {
      form.value.title = data.title
    }
    
    // Auto-fill tags from keywords if tags are empty
    if (!form.value.tags && data.meta?.keywords) {
      // Split keywords by comma and clean them up
      const keywords = data.meta.keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0)
        .slice(0, 5) // Limit to first 5 keywords to avoid overwhelming
      
      if (keywords.length > 0) {
        form.value.tags = keywords.join(', ')
      }
    }
    
  } catch (err) {
    console.error('Failed to harvest metadata:', err)
    // Don't show error to user as this is optional functionality
  } finally {
    harvestLoading.value = false
  }
}

// Helper to get the best favicon URL
function getBestFavicon() {
  if (!harvestedData.value) {
    // Fallback to Google favicon service
    return `https://www.google.com/s2/favicons?domain=${normalizeUrl(form.value.url)}&sz=128`
  }
  
  return harvestedData.value.favicon || `https://www.google.com/s2/favicons?domain=${normalizeUrl(form.value.url)}&sz=128`
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

async function onSubmit() {
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
  const tagsArray = form.value.tags 
    ? form.value.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    : []

  const tagInserts = tagsArray.map(tag => ({ title: tag.toLowerCase() }))

  // step 1: insert tags into public.tags
  try {
    const { data: insertTagData, error: insertTagError } = await supabase
      .from('tags')
      .upsert(tagInserts, {ignoreDuplicates: true})
      .select()

    if (insertTagError) throw insertTagError
    tagData.value = insertTagData;

    console.log("tagData.value: ", tagData.value);
  
  } catch (e) {
    error.value = e.message || 'Failed to add tag.'
  } finally {
    loading.value = false
  }

  // step 2: insert bookmark into public.bookmarks
  try {

    const { data: insertData, error: insertError } = await supabase
      .from('bookmarks')
      .insert([{
        title: form.value.title,
        url: normalizedUrl,
        favicon: faviconUrl,
        user_id: user.value.id
      }])
      .select()
      .single()

    if (insertError) throw insertError
    bookmarkData.value = insertData;
    console.log("bookmarkData.value:", bookmarkData.value);
    

    success.value = true
    form.value = { title: '', url: '', tags: '' }
    clipboardNotice.value = false
    harvestedData.value = null // Clear harvested data
    emit('bookmarkAdded')

  } catch (e) {
    error.value = e.message || 'Failed to add bookmark.'
  } finally {
    loading.value = false
  }

  // step 3: associate bookmark with tags
  try {
    const bookmarkId = bookmarkData.value.id
    const bookmarkTagLinks = tagData.value.map(tag => ({
      bookmark_id: bookmarkId,
      tag_id: tag.id
    }))
    console.log("bookmarkTagLinks: ", bookmarkTagLinks);
    
    const { data: insertLinkData, error: insertLinkError } = await supabase
      .from('bookmark_tags')
      .insert(bookmarkTagLinks)
      .select()

    if (insertLinkError) throw insertLinkError
    junctionData.value = insertLinkData;
    console.log("insertLinkData: ", junctionData.value);
    
  } catch (e) {
    error.value = e.message || 'Failed to associate bookmark with tag(s).'
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