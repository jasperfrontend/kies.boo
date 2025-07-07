<template>
  <v-card class="pa-6" max-width="500" outlined>
    <v-card-title>Add Bookmark</v-card-title>

    <v-form @submit.prevent="onSubmit">
      <v-text-field
        v-model="form.title"
        label="Title"
        prepend-icon="mdi-bookmark"
        autofocus
      ></v-text-field>
      <v-text-field
        v-model="form.url"
        label="URL"
        prepend-icon="mdi-link"
        @focus="tryReadClipboard"
      />

      <v-alert
        v-if="clipboardNotice"
        type="info"
        density="compact"
        class="mt-2"
        border="start"
        variant="tonal"
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

// Helpers
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

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${normalizedUrl}&sz=128`
  const tagsArray = form.value.tags 
    ? form.value.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    : []

  try {
    const { error: insertError } = await supabase
      .from('bookmarks')
      .insert([{
        title: form.value.title,
        url: normalizedUrl,
        tags: tagsArray,
        favicon: faviconUrl,
        user_id: user.value.id
      }])
      .select()
      .single()

    if (insertError) throw insertError

    success.value = true
    form.value = { title: '', url: '', tags: '' }
    clipboardNotice.value = false
    emit('bookmarkAdded')

  } catch (e) {
    error.value = e.code === '23505'
      ? 'This URL is already bookmarked.'
      : e.message || 'Failed to add bookmark.'
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