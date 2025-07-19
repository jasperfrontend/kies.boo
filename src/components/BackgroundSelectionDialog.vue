<template>
  <v-dialog
    max-width="600"
    :model-value="modelValue"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="d-flex align-center pa-4">
        <v-btn
          v-if="currentView !== 'main'"
          class="mr-3"
          icon
          size="small"
          variant="text"
          @click="goBack"
        >
          <v-icon icon="mdi-arrow-left" />
        </v-btn>
        <span>{{ dialogTitle }}</span>
        <v-spacer />
        <v-btn
          icon
          size="small"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- Main Selection View -->
      <v-card-text v-if="currentView === 'main'" class="pa-6">
        <v-row>
          <!-- Photos Option -->
          <v-col cols="6">
            <v-card
              class="background-option-card cursor-pointer"
              hover
              :ripple="true"
              @click="currentView = 'photos'"
            >
              <div class="pa-4 text-center">
                <div class="background-preview-grid mb-3">
                  <div
                    v-for="(photo, index) in previewPhotos.slice(0, 4)"
                    :key="index"
                    class="preview-photo"
                    :style="{ backgroundImage: `url(${photo.urls.thumb})` }"
                  />
                </div>
                <div class="text-h6">Photos</div>
              </div>
            </v-card>
          </v-col>

          <!-- Colors Option -->
          <v-col cols="6">
            <v-card
              class="background-option-card cursor-pointer"
              hover
              :ripple="true"
              @click="currentView = 'colors'"
            >
              <div class="pa-4 text-center">
                <div class="background-preview-grid mb-3">
                  <div
                    v-for="(gradient, index) in gradientOptions.slice(0, 2)"
                    :key="index"
                    class="preview-gradient"
                    :style="{ background: gradient.css }"
                  />
                  <div
                    v-for="(color, index) in solidColorOptions.slice(0, 2)"
                    :key="`solid-${index}`"
                    class="preview-solid"
                    :style="{ background: color.color }"
                  />
                </div>
                <div class="text-h6">Colors</div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Remove Background Option -->
        <v-row class="mt-2">
          <v-col cols="12">
            <v-btn
              block
              color="error"
              prepend-icon="mdi-delete"
              variant="outlined"
              @click="removeBackground"
            >
              Remove Background
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Photos View -->
      <v-card-text v-else-if="currentView === 'photos'" class="pa-4" style="height: 500px;">
        <!-- Search Bar -->
        <v-text-field
          v-model="searchQuery"
          class="mb-4"
          clearable
          density="compact"
          label="Search photos"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          @input="onSearchInput"
          @keydown.enter="searchPhotos"
        />

        <!-- Photos Grid -->
        <div v-if="!loadingPhotos && photos.length > 0" class="photos-grid">
          <div
            v-for="photo in photos"
            :key="photo.id"
            class="photo-item cursor-pointer"
            :style="{ backgroundImage: `url(${photo.urls.small})` }"
            @click="selectPhoto(photo)"
          >
            <div class="photo-overlay">
              <div class="photo-attribution">
                <a class="text-white d-block text-decoration-none attr-link" :href="photo.user.links.html" target="_blank" :title="photo.attributionText">{{ photo.user.name }}</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loadingPhotos" class="text-center py-8">
          <v-progress-circular color="primary" indeterminate />
          <div class="mt-2">Searching photos...</div>
        </div>

        <!-- No Results -->
        <div v-else-if="!loadingPhotos && searchQuery" class="text-center py-8">
          <v-icon class="text-grey-darken-1 mb-2" icon="mdi-image-off" size="48" />
          <div class="text-h6 text-grey-darken-1 mb-2">No photos found</div>
          <div class="text-body-2 text-grey-darken-1">Try searching for something else</div>
        </div>

        <!-- Unsplash Attribution -->
        <div class="text-center mt-4 text-caption text-grey-darken-1">
          By using images from Unsplash, you agree to their
          <a class="text-primary" href="https://unsplash.com/license" target="_blank">license</a>
          and
          <a class="text-primary" href="https://unsplash.com/terms" target="_blank">Terms of Service</a>
        </div>
      </v-card-text>

      <!-- Colors View -->
      <v-card-text v-else-if="currentView === 'colors'" class="pa-4" style="height: 500px; overflow-y: auto;">
        <!-- Gradients Section -->
        <div class="mb-6">
          <h3 class="text-h6 mb-3">Gradients</h3>
          <v-row>
            <v-col
              v-for="gradient in gradientOptions"
              :key="gradient.key"
              cols="6"
              md="3"
              sm="4"
            >
              <div
                class="color-option cursor-pointer"
                :style="{ background: gradient.css }"
                :title="gradient.label"
                @click="selectGradient(gradient)"
              >
                <v-icon
                  v-if="currentBackground?.type === 'gradient' && currentBackground?.value === gradient.key"
                  color="white"
                  icon="mdi-check"
                  size="24"
                />
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- Solid Colors Section -->
        <div>
          <h3 class="text-h6 mb-3">Solid Colors</h3>
          <v-row>
            <v-col
              v-for="color in solidColorOptions"
              :key="color.key"
              cols="6"
              md="3"
              sm="4"
            >
              <div
                class="color-option cursor-pointer"
                :style="{ background: color.color }"
                :title="color.label"
                @click="selectSolidColor(color)"
              >
                <v-icon
                  v-if="currentBackground?.type === 'solid' && currentBackground?.value === color.key"
                  color="white"
                  icon="mdi-check"
                  size="24"
                />
              </div>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading Overlay -->
    <v-overlay
      v-model="saving"
      class="align-center justify-center"
      contained
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
      <div class="mt-2">Saving...</div>
    </v-overlay>
  </v-dialog>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import backgroundPreferencesService from '@/lib/backgroundPreferencesService'
  import unsplashService from '@/lib/unsplashService'

  const props = defineProps({
    modelValue: Boolean,
  })

  const emit = defineEmits(['update:modelValue', 'background-changed'])

  // State
  const currentView = ref('main') // 'main', 'photos', 'colors'
  const searchQuery = ref('')
  const photos = ref([])
  const previewPhotos = ref([])
  const loadingPhotos = ref(false)
  const saving = ref(false)
  const currentBackground = ref(null)
  const searchTimeout = ref(null)
  const downloadFile = ref()

  // Options
  const gradientOptions = computed(() => backgroundPreferencesService.getGradientOptions())
  const solidColorOptions = computed(() => backgroundPreferencesService.getSolidColorOptions())

  // Computed
  const dialogTitle = computed(() => {
    switch (currentView.value) {
      case 'photos': { return 'Photos from Unsplash'
      }
      case 'colors': { return 'Colors'
      }
      default: { return 'Change background'
      }
    }
  })

  // Methods
  function goBack () {
    currentView.value = 'main'
    searchQuery.value = ''
  }

  function onSearchInput () {
    // Debounce search
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }

    searchTimeout.value = setTimeout(() => {
      if (searchQuery.value.trim()) {
        searchPhotos()
      } else {
        loadCuratedPhotos()
      }
    }, 500)
  }

  async function searchPhotos () {
    if (!searchQuery.value.trim()) return

    loadingPhotos.value = true
    try {
      const results = await unsplashService.searchPhotos(searchQuery.value.trim(), 1, 20)
      photos.value = results.results
    } catch (error) {
      console.error('Error searching photos:', error)
      photos.value = []
    } finally {
      loadingPhotos.value = false
    }
  }

  async function loadCuratedPhotos () {
    loadingPhotos.value = true
    try {
      const results = await unsplashService.getCuratedPhotos(1, 20)
      photos.value = results
    } catch (error) {
      console.error('Error loading curated photos:', error)
      photos.value = []
    } finally {
      loadingPhotos.value = false
    }
  }

  async function loadPreviewPhotos () {
    try {
      const results = await unsplashService.getCuratedPhotos(1, 4)
      previewPhotos.value = results
    } catch (error) {
      console.error('Error loading preview photos:', error)
      previewPhotos.value = []
    }
  }

  /**
   * Select and download the photo as background image
   * @param {string} photo - The Unsplash photo object
   */
  async function selectPhoto (photo) {
    downloadFile.value = photo.links.download_location
    saving.value = true
    try {
      // Trigger download for Unsplash analytics
      await unsplashService.triggerDownload(downloadFile.value)

      const backgroundData = {
        type: 'image',
        value: `${photo.urls.raw}&w=2560&q=80`,
        attribution: {
          html: photo.attributionHtml,
          text: photo.attributionText,
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          unsplashUrl: 'https://unsplash.com',
        },
      }

      const success = await backgroundPreferencesService.saveBackgroundPreference(backgroundData)
      if (success) {
        backgroundPreferencesService.applyBackground(backgroundData)
        currentBackground.value = backgroundData
        emit('background-changed', backgroundData)
        emit('update:modelValue', false)
      }
    } catch (error) {
      console.error('Error selecting photo:', error)
    } finally {
      saving.value = false
    }
  }

  async function selectGradient (gradient) {
    saving.value = true
    try {
      const backgroundData = {
        type: 'gradient',
        value: gradient.key,
      }

      const success = await backgroundPreferencesService.saveBackgroundPreference(backgroundData)
      if (success) {
        backgroundPreferencesService.applyBackground(backgroundData)
        currentBackground.value = backgroundData
        emit('background-changed', backgroundData)
        emit('update:modelValue', false)
      }
    } catch (error) {
      console.error('Error selecting gradient:', error)
    } finally {
      saving.value = false
    }
  }

  async function selectSolidColor (color) {
    saving.value = true
    try {
      const backgroundData = {
        type: 'solid',
        value: color.key,
      }

      const success = await backgroundPreferencesService.saveBackgroundPreference(backgroundData)
      if (success) {
        backgroundPreferencesService.applyBackground(backgroundData)
        currentBackground.value = backgroundData
        emit('background-changed', backgroundData)
        emit('update:modelValue', false)
      }
    } catch (error) {
      console.error('Error selecting solid color:', error)
    } finally {
      saving.value = false
    }
  }

  async function removeBackground () {
    saving.value = true
    try {
      const success = await backgroundPreferencesService.saveBackgroundPreference(null)
      if (success) {
        backgroundPreferencesService.clearBackground()
        currentBackground.value = null
        emit('background-changed', null)
        emit('update:modelValue', false)
      }
    } catch (error) {
      console.error('Error removing background:', error)
    } finally {
      saving.value = false
    }
  }

  async function loadCurrentBackground () {
    try {
      const background = await backgroundPreferencesService.getUserPreferences()
      currentBackground.value = background
    } catch (error) {
      console.error('Error loading current background:', error)
    }
  }

  // Watch for dialog open
  watch(() => props.modelValue, isOpen => {
    if (isOpen) {
      currentView.value = 'main'
      searchQuery.value = ''
      loadPreviewPhotos()
      loadCurrentBackground()
    }
  })

  // Watch for photos view
  watch(currentView, newView => {
    if (newView === 'photos') {
      loadCuratedPhotos()
    }
  })

  onMounted(() => {
    loadCurrentBackground()
  })
</script>

<style scoped>
.background-option-card {
  transition: transform 0.2s ease-in-out;
}

.background-option-card:hover {
  transform: translateY(-2px);
}

.background-preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 4px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-photo,
.preview-gradient,
.preview-solid {
  background-size: cover;
  background-position: center;
  border-radius: 4px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  grid-gap: 6px;
  max-height: 400px;
  overflow: hidden;
}

.photo-item {
  aspect-ratio: 16/9;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  position: relative;
  transition: transform 0.2s ease-in-out;
}

.photo-item:hover {
  transform: scale(1.02);
}
.attr-link {
  padding: 5px;
}
.attr-link:hover {
  background: rgba(15,15,15,.5);
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  border-radius: 0 0 8px 8px;
}

.photo-attribution {
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
}

.color-option {
  aspect-ratio: 16/9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  min-height: 60px;
}

.color-option:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
