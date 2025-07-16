<template>
  <div>
    <v-card class="pa-6 mx-auto bg-transparent" max-width="800" outlined>
      <v-card-title class="text-h4 mb-4">
        <v-icon icon="mdi-bookmark-plus" class="mr-3" />
        Generate Your Bookmarklet
      </v-card-title>
      
      <v-card-text class="mb-6">
        <p class="mb-4">
          Enter your API key to generate a secure bookmarklet that you can save in your browser.
        </p>
      </v-card-text>

      <!-- API Key Input -->
      <div v-if="!bookmarkletGenerated">
        <v-form @submit.prevent="generateBookmarklet">
          <v-text-field
            v-model="inputApiKey"
            label="Enter your API key"
            prepend-icon="mdi-key"
            :type="showApiKey ? 'text' : 'password'"
            :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showApiKey = !showApiKey"
            variant="outlined"
            :rules="[v => !!v || 'API key is required']"
            :loading="validating"
            :error-messages="validationError"
            class="mb-4"
            autofocus
          />

          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            size="large"
            prepend-icon="mdi-creation"
            :loading="validating"
            :disabled="!inputApiKey.trim()"
            block
          >
            Generate Bookmarklet
          </v-btn>
        </v-form>
      </div>

      <!-- Generated Bookmarklet -->
      <div v-if="bookmarkletGenerated && bookmarkletCode">
        <v-alert type="success" variant="tonal" class="mb-6">
          Your bookmarklet has been generated successfully!
        </v-alert>

        <!-- Custom Steps Implementation -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title>
            <v-icon icon="mdi-information" class="mr-2" />
            Installation Steps
          </v-card-title>
          <v-card-text>
            <!-- Step 1 -->
            <div class="custom-step mb-6">
              <div class="step-header mb-3">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h3 class="text-h6 mb-2">Show Bookmarks Bar</h3>
                  <v-chip color="success" size="small" variant="flat">
                    <v-icon icon="mdi-check" size="16" class="mr-1" />
                    Ready
                  </v-chip>
                </div>
              </div>
              <div class="step-body ml-12">
                <p class="text-body-2 mb-3">
                  Make sure your browser's bookmarks bar is visible:
                </p>
                <div class="browser-shortcuts">
                  <div class="shortcut-item mb-2">
                    <strong>Chrome/Edge:</strong> 
                    <v-chip size="x-small" variant="outlined" class="ml-2">Ctrl+Shift+B</v-chip>
                    <span class="text-caption ml-2">(Cmd+Shift+B on Mac)</span>
                  </div>
                  <div class="shortcut-item mb-2">
                    <strong>Firefox:</strong> 
                    <v-chip size="x-small" variant="outlined" class="ml-2">Ctrl+Shift+B</v-chip>
                    <span class="text-caption ml-2">(Cmd+Shift+B on Mac)</span>
                  </div>
                  <div class="shortcut-item">
                    <strong>Safari:</strong> 
                    <span class="text-caption ml-2">View → Show Favorites Bar</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="custom-step mb-6">
              <div class="step-header mb-3">
                <div class="step-number active">2</div>
                <div class="step-content">
                  <h3 class="text-h6 mb-2">Drag the Bookmarklet</h3>
                  <v-chip color="primary" size="small" variant="flat">
                    <v-icon icon="mdi-arrow-right" size="16" class="mr-1" />
                    Current Step
                  </v-chip>
                </div>
              </div>
              <div class="step-body ml-12">
                <p class="text-body-2 mb-4">
                  Drag the blue button below to your bookmarks bar:
                </p>
                
                <!-- The Draggable Bookmarklet -->
                <div class="text-center mb-4">
                  <a 
                    :href="bookmarkletCode"
                    class="bookmarklet-link"
                    draggable="true"
                    @dragstart="onDragStart"
                    title="Drag this to your bookmarks bar"
                  >
                    <v-btn
                      color="primary"
                      variant="flat"
                      size="large"
                      prepend-icon="mdi-bookmark-plus"
                      class="bookmarklet-button"
                    >
                      📌 Add to Kies.boo
                    </v-btn>
                  </a>
                </div>
                
                <v-alert type="info" variant="tonal" density="compact">
                  <div class="text-body-2">
                    <strong>Tip:</strong> If dragging doesn't work, you can right-click the button 
                    and select "Add to bookmarks" or "Bookmark this link"
                  </div>
                </v-alert>
              </div>
            </div>
            
            <!-- Step 3 -->
            <div class="custom-step">
              <div class="step-header mb-3">
                <div class="step-number pending">3</div>
                <div class="step-content">
                  <h3 class="text-h6 mb-2">Start Using It</h3>
                  <v-chip color="grey" size="small" variant="outlined">
                    <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />
                    Pending
                  </v-chip>
                </div>
              </div>
              <div class="step-body ml-12">
                <p class="text-body-2">
                  Visit any webpage and click your new bookmark to save it to kies.boo!
                  The bookmarklet will automatically extract the page title, URL, and suggest tags.
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Advanced Options -->
        <v-expansion-panels variant="accordion" class="mb-6">
          <v-expansion-panel title="Advanced Options">
            <v-expansion-panel-text>
              <!-- Manual Installation -->
              <div class="mb-4">
                <h4 class="text-h6 mb-2">Manual Installation</h4>
                <p class="text-body-2 mb-3">
                  If dragging doesn't work, you can manually create a bookmark:
                </p>
                <div class="manual-steps mb-3">
                  <div class="manual-step mb-2">
                    <v-icon icon="mdi-numeric-1-circle" size="16" class="mr-2" color="primary" />
                    <span class="text-body-2">Create a new bookmark in your browser</span>
                  </div>
                  <div class="manual-step mb-2">
                    <v-icon icon="mdi-numeric-2-circle" size="16" class="mr-2" color="primary" />
                    <span class="text-body-2">Set the name to "Add to Kies.boo"</span>
                  </div>
                  <div class="manual-step mb-2">
                    <v-icon icon="mdi-numeric-3-circle" size="16" class="mr-2" color="primary" />
                    <span class="text-body-2">Copy and paste the code below as the URL</span>
                  </div>
                </div>
                
                <v-textarea
                  :model-value="bookmarkletCode"
                  label="Bookmarklet Code"
                  readonly
                  variant="outlined"
                  rows="6"
                  class="mb-3"
                >
                  <template v-slot:append-inner>
                    <v-btn
                      @click="copyBookmarkletCode"
                      icon
                      variant="text"
                      color="primary"
                      size="small"
                      :title="copyStatus.copied ? 'Copied!' : 'Copy bookmarklet code'"
                    >
                      <v-icon :icon="copyStatus.copied ? 'mdi-check' : 'mdi-content-copy'" />
                    </v-btn>
                  </template>
                </v-textarea>
              </div>

              <!-- Security Information -->
              <div class="mb-4">
                <h4 class="text-h6 mb-2">Security Information</h4>
                <v-alert type="warning" variant="tonal" density="compact" class="mb-3">
                  <div class="text-body-2">
                    Your API key is embedded in this bookmarklet. Keep it secure and don't share this bookmarklet with others.
                    If you suspect your key is compromised, generate a new one immediately.
                  </div>
                </v-alert>
                
                <div class="text-body-2">
                  <strong>Key Details:</strong>
                  <ul class="mt-2">
                    <li>This API key expires in 30 days</li>
                    <li>You can revoke it anytime from the API key generator</li>
                    <li>It only works with your kies.boo account</li>
                  </ul>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Actions -->
        <div class="text-center">
          <v-btn
            @click="generateNew"
            variant="outlined"
            prepend-icon="mdi-refresh"
            class="mr-3"
          >
            Generate New Key
          </v-btn>
          
          <v-btn
            to="/"
            color="primary"
            variant="text"
            prepend-icon="mdi-arrow-left"
          >
            Back to Bookmarks
          </v-btn>
        </div>
      </div>

      <!-- Error Display -->
      <v-alert
        v-if="error"
        type="error"
        class="mt-4"
        closable
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import supabase from '@/lib/supabaseClient'

const route = useRoute()

const inputApiKey = ref('')
const showApiKey = ref(false)
const validating = ref(false)
const validationError = ref('')
const bookmarkletGenerated = ref(false)
const bookmarkletCode = ref('')
const error = ref('')
const copyStatus = ref({ copied: false, timeout: null })

async function generateBookmarklet() {
  validating.value = true
  validationError.value = ''
  error.value = ''

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      error.value = 'You must be logged in to generate a bookmarklet'
      return
    }

    // Validate the API key with our backend
    const response = await fetch(`${import.meta.env.VITE_HARVEST_API_URL}/harvest/validate-api-key.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        api_key: inputApiKey.value.trim(),
        user_id: session.user.id
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}: Failed to validate API key`)
    }

    if (result.success) {
      // Generate the bookmarklet code
      bookmarkletCode.value = generateBookmarkletCode(inputApiKey.value.trim())
      bookmarkletGenerated.value = true
    } else {
      validationError.value = result.error || 'Invalid API key'
    }

  } catch (err) {
    console.error('Error validating API key:', err)
    error.value = err.message || 'Failed to validate API key'
  } finally {
    validating.value = false
  }
}

function generateBookmarkletCode(apiKey) {
  // Create the bookmarklet JavaScript code
  const bookmarkletScript = `
    (function(){
      var title = document.title.trim();
      var url = window.location.href;
      var description = document.querySelector('meta[name="description"]') ? 
        document.querySelector('meta[name="description"]').content : '';
      var keywords = [];
      var metaKeywords = document.querySelector('meta[name="keywords"]');
      
      if (metaKeywords) {
        keywords.push(...metaKeywords.content.split(',').map(k => k.trim()).slice(0, 3));
      }
      
      var apiUrl = '${import.meta.env.VITE_HARVEST_API_URL}/harvest/addbookmark-secure.php';
      var data = {
        title: title || null,
        url: url,
        tags: ['bookmarklet'],
        description: description || null,
        api_key: '${apiKey}'
      };
      
      var suggestedTags = '';
      if (keywords.length > 0) {
        suggestedTags = prompt(
          'Suggested tags from page (comma-separated):\\nYou can edit these or leave empty to skip:', 
          keywords.join(', ')
        );
        
        if (suggestedTags !== null && suggestedTags.trim()) {
          var suggested = suggestedTags.split(',').map(t => t.trim()).filter(Boolean);
          data.tags.push(...suggested);
        }
      }
      
      var customTags = prompt(
        'Add your own custom tags (comma-separated):\\n\\nCurrent tags: ' + data.tags.join(', '), 
        ''
      );
      
      if (customTags !== null) {
        if (customTags.trim()) {
          var custom = customTags.split(',').map(t => t.trim()).filter(Boolean);
          data.tags.push(...custom);
        }
        
        data.tags = [...new Set(data.tags)];
        
        fetch(apiUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            alert('✓ Bookmark saved successfully!\\n\\nTitle: ' + 
              (result.harvested ? result.harvested.title : (result.data ? result.data.title : title)) + 
              '\\nTags: ' + data.tags.join(', ') + 
              (result.harvested && result.harvested.description ? 
                '\\nDescription: ' + result.harvested.description.substring(0, 80) + '...' : '')
            );
          } else {
            alert('✗ Error: ' + (result.error || 'Failed to add bookmark'));
          }
        })
        .catch(error => {
          alert('✗ Error adding bookmark: ' + error.message);
        });
      }
    })();
  `

  // Minify and encode the bookmarklet
  const minified = bookmarkletScript
    .replace(/\s+/g, ' ')
    .replace(/\/\*.*?\*\//g, '')
    .trim()

  return 'javascript:' + encodeURIComponent(minified)
}

function onDragStart(event) {
  // Set drag data for better browser compatibility
  event.dataTransfer.setData('text/uri-list', bookmarkletCode.value)
  event.dataTransfer.setData('text/plain', bookmarkletCode.value)
}

async function copyBookmarkletCode() {
  try {
    await navigator.clipboard.writeText(bookmarkletCode.value)
    copyStatus.value.copied = true
    
    if (copyStatus.value.timeout) {
      clearTimeout(copyStatus.value.timeout)
    }
    
    copyStatus.value.timeout = setTimeout(() => {
      copyStatus.value.copied = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

function generateNew() {
  bookmarkletGenerated.value = false
  inputApiKey.value = ''
  bookmarkletCode.value = ''
  validationError.value = ''
  error.value = ''
}

onMounted(() => {
  // Check if API key was passed via URL parameter
  if (route.query.key) {
    inputApiKey.value = route.query.key
    // Auto-generate if key is provided
    generateBookmarklet()
  }
})
</script>

<style scoped>
/* Custom step styling */
.custom-step {
  position: relative;
  padding-bottom: 2rem;
}

.custom-step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 20px;
  top: 50px;
  bottom: -1rem;
  width: 2px;
  background: rgba(var(--v-theme-primary), 0.2);
}

.step-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--v-theme-surface), 1);
  border: 2px solid rgba(var(--v-theme-primary), 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: rgba(var(--v-theme-on-surface), 0.6);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.step-number.active {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-color: rgb(var(--v-theme-primary));
}

.step-number.pending {
  background: rgba(var(--v-theme-surface), 1);
  border-color: rgba(var(--v-theme-on-surface), 0.2);
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.step-content {
  flex: 1;
}

.step-body {
  margin-top: 1rem;
}

.browser-shortcuts {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.manual-steps .manual-step {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.bookmarklet-link {
  text-decoration: none;
  display: inline-block;
  position: relative;
}

.bookmarklet-button {
  cursor: grab;
  transition: transform 0.2s ease;
}

.bookmarklet-button:hover {
  transform: scale(1.05);
}

.bookmarklet-button:active {
  cursor: grabbing;
  transform: scale(0.98);
}

/* Custom styles for drag indication */
.bookmarklet-link::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px dashed transparent;
  border-radius: 8px;
  transition: border-color 0.2s ease;
  pointer-events: none;
}

.bookmarklet-link:hover::after {
  border-color: rgb(var(--v-theme-primary));
  opacity: 0.5;
}
</style>

<route lang="yaml">
meta:
  layout: contentpage
</route>