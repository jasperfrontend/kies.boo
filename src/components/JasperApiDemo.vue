<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
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
                </v-list>
              </v-card-text>
            </v-card>

            <v-btn
              type="submit"
              color="primary"
              class="mt-4"
              :loading="loading"
              :disabled="loading || !form.title || !form.url"
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
                rows="6"
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
  "title": "Page Title",
  "url": "https://example.com",
  "tags": ["tag1", "tag2"],
  "description": "Optional description",
  "user_id": "user_uuid_from_supabase"
}
              </v-code>
              
              <p><strong>Required fields:</strong> title, url, user_id</p>
              <p><strong>Optional fields:</strong> tags, description</p>
              <p><strong>Response:</strong> JSON with success/error status</p>
            </v-card-text>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
const bookmarkletCode = ref('')
const harvestedData = ref(null)

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
      title: form.value.title,
      url: form.value.url,
      tags: form.value.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      description: form.value.description
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
  bookmarkletCode.value = apiBookmarkService.generateBookmarkletUrl()
})
</script>