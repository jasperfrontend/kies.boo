<template>
  <v-container>
    <v-row justify="center">
      <v-col>
        <v-card class="pa-6">
          <v-card-title>API Bookmark Manager</v-card-title>
          <v-card-subtitle>Test the external bookmark API endpoint</v-card-subtitle>
          
          <!-- API Status -->
          <v-alert 
            :type="apiStatus === 'connected' ? 'success' : apiStatus === 'error' ? 'error' : 'info'"
            class="mb-4"
          >
            <div class="d-flex align-center">
              <v-icon class="mr-2">
                {{ apiStatus === 'connected' ? 'mdi-check-circle' : 
                   apiStatus === 'error' ? 'mdi-alert-circle' : 'mdi-information' }}
              </v-icon>
              <span>
                API Status: {{ 
                  apiStatus === 'connected' ? 'Connected' : 
                  apiStatus === 'error' ? 'Connection failed' : 'Testing...' 
                }}
              </span>
              <v-spacer />
              <v-btn 
                size="small" 
                variant="text" 
                @click="testApiConnection"
                :loading="testingConnection"
              >
                Test Connection
              </v-btn>
            </div>
          </v-alert>

          <!-- Add Bookmark Form -->
          <v-form @submit.prevent="addBookmarkViaApi">
            <v-text-field
              v-model="form.title"
              label="Title"
              prepend-icon="mdi-bookmark"
              :disabled="loading"
              hint="Leave empty to auto-harvest from URL"
              persistent-hint
            />
            
            <v-text-field
              v-model="form.url"
              label="URL"
              prepend-icon="mdi-link"
              :disabled="loading"
              :rules="[rules.required, rules.url]"
            />
            
            <v-text-field
              v-model="form.tags"
              label="Tags (comma separated)"
              prepend-icon="mdi-tag"
              hint="e.g., programming, vue, tutorial"
              persistent-hint
              :disabled="loading"
            />
            
            <v-textarea
              v-model="form.description"
              label="Description (optional)"
              prepend-icon="mdi-text"
              rows="3"
              :disabled="loading"
              hint="Leave empty to auto-harvest from URL"
              persistent-hint
            />

            <v-alert v-if="error" type="error" class="mt-4">
              {{ error }}
            </v-alert>

            <v-alert v-if="success" type="success" class="mt-4">
              {{ success }}
            </v-alert>

            <!-- Show harvested data -->
            <v-card v-if="harvestedData" variant="outlined" class="mt-4">
              <v-card-title class="text-subtitle-1">
                <v-icon class="mr-2">mdi-web</v-icon>
                Harvested Metadata
              </v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item v-if="harvestedData.title">
                    <v-list-item-title>Title</v-list-item-title>
                    <v-list-item-subtitle>{{ harvestedData.title }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="harvestedData.description">
                    <v-list-item-title>Description</v-list-item-title>
                    <v-list-item-subtitle>{{ harvestedData.description }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="harvestedData.favicon">
                    <v-list-item-title>Favicon</v-list-item-title>
                    <v-list-item-subtitle class="d-flex align-center">
                      <img :src="harvestedData.favicon" width="16" height="16" class="mr-2" />
                      {{ harvestedData.favicon }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="harvestedData.og_image">
                    <v-list-item-title>Social Image</v-list-item-title>
                    <v-list-item-subtitle>{{ harvestedData.og_image }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="harvestedData.keywords && harvestedData.keywords.length > 0">
                    <v-list-item-title>Suggested Tags</v-list-item-title>
                    <v-list-item-subtitle>
                      <div class="d-flex flex-wrap gap-1 mt-1">
                        <v-chip
                          v-for="keyword in harvestedData.keywords.slice(0, 5)"
                          :key="keyword"
                          size="x-small"
                          variant="tonal"
                          color="primary"
                        >
                          {{ keyword }}
                        </v-chip>
                      </div>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-btn
              type="submit"
              color="primary"
              class="mt-4"
              :loading="loading"
              :disabled="loading || !form.url"
              block
            >
              Add Bookmark via API
            </v-btn>
          </v-form>

          <v-divider class="my-6" />

          <!-- Bookmarklet Section -->
          <v-card variant="outlined">
            <v-card-title>Browser Extension / Bookmarklet</v-card-title>
            <v-card-text>
              <p class="mb-4">
                You can use this API endpoint for browser extensions or bookmarklets. 
                Here's a basic bookmarklet example:
              </p>
              
              <v-textarea
                :model-value="bookmarkletCode"
                label="Bookmarklet Code"
                readonly
                rows="8"
                variant="outlined"
              />
              
              <v-btn
                @click="copyBookmarklet"
                color="secondary"
                variant="outlined"
                class="mt-2"
              >
                <v-icon class="mr-2">mdi-content-copy</v-icon>
                Copy Bookmarklet
              </v-btn>
              
              <p class="text-caption mt-2">
                Note: For a real browser extension, you'd need to handle authentication properly
                and get the user_id from your app's authentication system.
              </p>
            </v-card-text>
          </v-card>

          <!-- API Documentation -->
          <v-card variant="outlined" class="mt-4">
            <v-card-title>API Documentation</v-card-title>
            <v-card-text>
              <v-code class="d-block mb-4">
POST https://jasper.monster/harvest/addbookmark.php
Content-Type: application/json

{
  "title": "Page Title (optional - will be harvested if empty)",
  "url": "https://example.com",
  "tags": ["tag1", "tag2"] or "tag1,tag2",
  "description": "Optional description (will be harvested if empty)",
  "user_id": "user_uuid_from_supabase"
}
              </v-code>
              
              <p><strong>Required fields:</strong> url, user_id</p>
              <p><strong>Optional fields:</strong> title, tags, description</p>
              <p><strong>Tags format:</strong> Array of strings or comma-separated string</p>
              <p><strong>Response:</strong> JSON with success/error status and harvested metadata</p>
              <p><strong>Database:</strong> Uses normalized schema with separate tags and bookmark_tags tables</p>
            </v-card-text>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiBookmarkService from '@/lib/apiBookmarkService'

const form = ref({
  title: '',
  url: '',
  tags: '',
  description: ''
})

const loading = ref(false)
const testingConnection = ref(false)
const error = ref('')
const success = ref('')
const apiStatus = ref('testing')
const harvestedData = ref(null)

// Form validation rules
const rules = {
  required: value => !!value || 'Required.',
  url: value => {
    if (!value) return true // Allow empty for optional fields
    const pattern = /^https?:\/\/.+/
    return pattern.test(value) || 'Must be a valid URL starting with http:// or https://'
  }
}

// Computed bookmarklet code
const bookmarkletCode = computed(() => {
  return apiBookmarkService.generateBookmarkletUrl()
})

async function testApiConnection() {
  testingConnection.value = true
  try {
    const isConnected = await apiBookmarkService.testConnection()
    apiStatus.value = isConnected ? 'connected' : 'error'
  } catch (err) {
    apiStatus.value = 'error'
  } finally {
    testingConnection.value = false
  }
}

async function addBookmarkViaApi() {
  loading.value = true
  error.value = ''
  success.value = ''
  harvestedData.value = null

  try {
    const result = await apiBookmarkService.addBookmark({
      title: form.value.title.trim() || null, // Send null if empty to trigger harvesting
      url: form.value.url.trim(),
      tags: form.value.tags.trim() ? form.value.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      description: form.value.description.trim() || null // Send null if empty to trigger harvesting
    })

    success.value = result.message || 'Bookmark added successfully!'
    
    // Show harvested data if available
    if (result.harvested) {
      harvestedData.value = result.harvested
    }
    
    // Clear form
    form.value = {
      title: '',
      url: '',
      tags: '',
      description: ''
    }
    
    // Emit event to refresh bookmarks in parent components
    // You might want to emit this to trigger a refresh
    
  } catch (err) {
    error.value = err.message || 'Failed to add bookmark'
  } finally {
    loading.value = false
  }
}

async function copyBookmarklet() {
  try {
    await navigator.clipboard.writeText(bookmarkletCode.value)
    success.value = 'Bookmarklet copied to clipboard!'
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = 'Failed to copy to clipboard'
  }
}

onMounted(() => {
  testApiConnection()
})
</script>