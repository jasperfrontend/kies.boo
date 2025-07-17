<template>
  <div>
    <v-card class="pa-6 mx-auto bg-transparent" outlined>
      <v-card-title class="text-h4 mb-4">
        <v-icon class="mr-3" icon="mdi-key" />
        Generate Bookmarklet API Key
      </v-card-title>

      <v-card-text class="mb-6">
        <p class="mb-4">
          Create a secure API key to use with your bookmarklet. This allows you to save bookmarks
          from any website directly to your kies.boo collection.
        </p>

        <v-alert class="mb-4" type="info" variant="tonal">
          API keys expire after 30 days for security. You can regenerate them anytime.
        </v-alert>
      </v-card-text>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular color="primary" indeterminate size="64" />
        <div class="mt-4">Generating secure API key...</div>
      </div>

      <!-- Error State -->
      <v-alert
        v-if="error"
        class="mb-4"
        closable
        type="error"
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>

      <!-- Success State - Show API Key -->
      <div v-if="apiKey && !loading">
        <v-card class="mb-6" color="success" variant="outlined">
          <v-card-text>
            <div class="text-center">
              <v-icon class="mb-3" color="success" icon="mdi-check-circle" size="48" />
              <div class="text-h5 mb-2">API Key Generated Successfully!</div>
              <div class="text-caption mb-4">Copy this key - you'll need it for the bookmarklet</div>

              <!-- API Key Display -->
              <v-card class="pa-4 mb-4" color="surface" variant="flat">
                <div class="d-flex align-center justify-center">
                  <code class="text-h6 font-weight-bold mr-3">{{ apiKey }}</code>
                  <v-btn
                    color="primary"
                    icon="mdi-content-copy"
                    :title="copyStatus.copied ? 'Copied!' : 'Copy API key'"
                    variant="text"
                    @click="copyApiKey"
                  >
                    <v-icon :icon="copyStatus.copied ? 'mdi-check' : 'mdi-content-copy'" />
                  </v-btn>
                </div>
              </v-card>

              <div class="text-caption text-warning mb-4">
                <v-icon class="mr-1" icon="mdi-alert" size="16" />
                Keep this key secure. Anyone with this key can add bookmarks to your account.
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Next Steps -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title>
            <v-icon class="mr-2" icon="mdi-arrow-right-circle" />
            Next Steps
          </v-card-title>
          <v-card-text>
            <div class="steps-list">
              <div class="step-item mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2" color="primary" icon="mdi-numeric-1-circle" />
                  <span class="text-h6">Generate Bookmarklet</span>
                  <v-chip class="ml-2" color="success" size="small">Current Step</v-chip>
                </div>
                <div class="text-body-2 mb-3 ml-8">
                  Go to the bookmarklet generator with your API key
                </div>
                <div class="ml-8">
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-bookmark-plus"
                    :to="`/generate-bookmarklet?key=${apiKey}`"
                    variant="flat"
                  >
                    Generate Bookmarklet
                  </v-btn>
                </div>
              </div>

              <div class="step-item mb-4">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2" color="grey" icon="mdi-numeric-2-circle" />
                  <span class="text-h6">Save to Browser</span>
                </div>
                <div class="text-body-2 ml-8">
                  Drag the bookmarklet to your browser's bookmark bar
                </div>
              </div>

              <div class="step-item">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2" color="grey" icon="mdi-numeric-3-circle" />
                  <span class="text-h6">Start Bookmarking</span>
                </div>
                <div class="text-body-2 ml-8">
                  Click the bookmarklet on any webpage to save it instantly
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Initial State - Generate Button -->
      <div v-if="!apiKey && !loading">
        <v-card-text class="text-center">
          <v-btn
            color="primary"
            :loading="loading"
            prepend-icon="mdi-key-plus"
            size="large"
            variant="flat"
            @click="generateApiKey"
          >
            Generate New API Key
          </v-btn>
        </v-card-text>
      </div>

      <!-- Existing Keys Section -->
      <div v-if="existingKeys.length > 0" class="mt-6">
        <v-divider class="mb-4" />
        <v-card-title>
          <v-icon class="mr-2" icon="mdi-key-variant" />
          Existing API Keys
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="key in existingKeys"
              :key="key.id"
              class="pa-3"
            >
              <template #prepend>
                <v-icon
                  :color="isKeyExpired(key.expires_at) ? 'error' : 'success'"
                  :icon="isKeyExpired(key.expires_at) ? 'mdi-key-off' : 'mdi-key'"
                />
              </template>

              <v-list-item-title>
                API Key ending in ...{{ key.key_preview }}
              </v-list-item-title>

              <v-list-item-subtitle>
                Created: {{ formatDate(key.created_at) }} •
                <span :class="isKeyExpired(key.expires_at) ? 'text-error' : 'text-success'">
                  {{ isKeyExpired(key.expires_at) ? 'Expired' : 'Active' }}
                </span>
                {{ !isKeyExpired(key.expires_at) ? `(expires ${formatDate(key.expires_at)})` : '' }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  :loading="revokingKey === key.id"
                  size="small"
                  title="Revoke this API key"
                  variant="text"
                  @click="revokeApiKey(key.id)"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </div>
    </v-card>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import supabase from '@/lib/supabaseClient'

  const loading = ref(false)
  const error = ref('')
  const apiKey = ref('')
  const existingKeys = ref([])
  const revokingKey = ref(null)
  const copyStatus = ref({ copied: false, timeout: null })

  async function generateApiKey () {
    loading.value = true
    error.value = ''

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        error.value = 'You must be logged in to generate an API key'
        return
      }

      // Call our PHP endpoint to generate the API key
      const response = await fetch(`${import.meta.env.VITE_HARVEST_API_URL}/harvest/generate-api-key.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: session.user.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to generate API key`)
      }

      if (result.success) {
        apiKey.value = result.api_key
        await loadExistingKeys() // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to generate API key')
      }
    } catch (error_) {
      console.error('Error generating API key:', error_)
      error.value = error_.message || 'Failed to generate API key'
    } finally {
      loading.value = false
    }
  }

  async function loadExistingKeys () {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error: fetchError } = await supabase
        .from('user_api_keys')
        .select('id, key_preview, created_at, expires_at, is_active')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error loading existing keys:', fetchError)
        return
      }

      existingKeys.value = data || []
    } catch (error_) {
      console.error('Error loading existing keys:', error_)
    }
  }

  async function revokeApiKey (keyId) {
    revokingKey.value = keyId

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        error.value = 'You must be logged in to revoke API keys'
        return
      }

      const { error: updateError } = await supabase
        .from('user_api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('user_id', session.user.id)

      if (updateError) {
        throw updateError
      }

      // Remove from local list
      existingKeys.value = existingKeys.value.filter(key => key.id !== keyId)
    } catch (error_) {
      console.error('Error revoking API key:', error_)
      error.value = 'Failed to revoke API key'
    } finally {
      revokingKey.value = null
    }
  }

  async function copyApiKey () {
    try {
      await navigator.clipboard.writeText(apiKey.value)
      copyStatus.value.copied = true

      if (copyStatus.value.timeout) {
        clearTimeout(copyStatus.value.timeout)
      }

      copyStatus.value.timeout = setTimeout(() => {
        copyStatus.value.copied = false
      }, 2000)
    } catch (error_) {
      console.error('Failed to copy:', error_)
    }
  }

  function isKeyExpired (expiresAt) {
    return new Date(expiresAt) < new Date()
  }

  function formatDate (dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  onMounted(() => {
    loadExistingKeys()
  })
</script>

<style scoped>
code {
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

/* Custom step styling */
.steps-list .step-item {
  border-left: 2px solid rgba(var(--v-theme-primary), 0.2);
  padding-left: 1rem;
  position: relative;
}

.steps-list .step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: -1px;
  bottom: -1rem;
  height: 1rem;
  border-left: 2px solid rgba(var(--v-theme-primary), 0.2);
}
</style>

<route lang="yaml">
meta:
  layout: contentpage
</route>
