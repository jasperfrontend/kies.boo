<template>
  <v-card outlined>
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
      ></v-text-field>
      <v-text-field
        v-model="form.tags"
        label="Tags (comma separated)"
        prepend-icon="mdi-tag"
        hint="Enter tags separated by commas, e.g., programming, vue, tutorial"
        persistent-hint
      ></v-text-field>
      
      <v-btn
        :loading="loading"
        :disabled="loading"
        color="primary"
        type="submit"
        class="mt-4"
        block
      >
        Add Bookmark 
        <v-badge
          color="white"
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

const form = ref({
  title: '',
  url: '',
  favicon: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

function normalizeUrl(url) {
  if (!url) return url
  
  // Remove any leading/trailing whitespace
  url = url.trim()
  
  // If it already starts with http:// or https://, don't modify it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Check if it looks like a URL (basic pattern: word.word)
  // This regex matches: letters/numbers/hyphens, followed by dot, followed by letters/numbers/hyphens
  const urlPattern = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/
  
  if (urlPattern.test(url)) {
    return `https://${url}`
  }
  
  // If it doesn't match the pattern, return as-is (let the user handle it)
  return url
}

function isValidUrl(url) {
  if (!url) return false
  
  // Basic pattern check: should contain at least word.word after normalization
  const normalizedUrl = normalizeUrl(url)
  
  // After normalization, check if it's a valid-looking URL
  try {
    // Try to create a URL object to validate structure
    new URL(normalizedUrl)
    return true
  } catch {
    // If URL constructor fails, fall back to basic pattern check
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

  // Normalize the URL
  const normalizedUrl = normalizeUrl(form.value.url)
  
  // Validate the normalized URL
  if (!isValidUrl(normalizedUrl)) {
    error.value = 'Please enter a valid URL (e.g., example.com or https://example.com).'
    return
  }

  loading.value = true

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${normalizedUrl}&sz=128`
  
  try {
    const { error: insertError } = await supabase
      .from('bookmarks')
      .insert([
        {
          title: form.value.title,
          url: normalizedUrl,
          tags: [form.value.tags],
          favicon: faviconUrl,
          user_id: user.value.id
        }
      ])
      .select()
      .single()
    if (insertError) throw insertError
    success.value = true
    form.value.title = ''
    form.value.url = ''
    form.value.tags = ''

    emit('bookmarkAdded')
  } catch (e) {
    if (e.code === '23505') {
      error.value = 'This URL is already bookmarked.'
    } else {
      error.value = e.message || 'Failed to add bookmark.'
    }
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