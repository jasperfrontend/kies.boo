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
      </v-btn>
      <v-alert
        v-if="error"
        type="error"
        class="mt-4"
        dense
        border="left"
      >
        {{ error }}
      </v-alert>
      <v-alert
        v-if="success"
        type="success"
        class="mt-4"
        dense
        border="left"
      >
        Bookmark added!
      </v-alert>
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

async function onSubmit() {
  error.value = ''
  success.value = false
  if (!user.value) {
    error.value = 'You must be logged in to add a bookmark.'
    return
  }

  loading.value = true

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${form.value.url}&sz=128`
  
  try {
    const { error: insertError } = await supabase
      .from('bookmarks')
      .insert([
        {
          title: form.value.title,
          url: form.value.url,
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
    form.value.favicon = ''

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
