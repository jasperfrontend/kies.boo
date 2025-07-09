<template>
  <v-dialog 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
  >
    <v-card v-if="bookmark">
      <v-card-title class="d-flex align-center pa-4">
        <v-avatar rounded="0" size="32" class="me-3">
          <img
            :src="bookmark.favicon"
            alt="favicon"
            width="32"
            height="32"
            @error="e => e.target.src = '/favicon.png'"
          />
        </v-avatar>
        Bookmark Details
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <div class="d-flex flex-column ga-4">
          <div>
            <div class="text-caption text-grey-darken-1 mb-1">Title</div>
            <div class="text-h6 text-white" style="line-height: 1.4;">
              {{ bookmark.title }}
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-darken-1 mb-1">URL</div>
            <div class="text-white">
              <a 
                :href="bookmark.url" 
                target="_blank" 
                class="text-primary-lighten-3 text-decoration-none"
              >
                {{ bookmark.url }}
                <v-icon icon="mdi-open-in-new" size="14" class="ml-1" />
              </a>
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-darken-1 mb-1">Tags</div>
            <div>
              <div v-if="bookmark.tags && bookmark.tags.length > 0">
                <v-chip
                  v-for="tag in bookmark.tags"
                  :key="tag"
                  size="small"
                  variant="tonal"
                  color="primary-lighten-3"
                  class="mr-1 mb-1"
                >
                  {{ tag }}
                </v-chip>
              </div>
              <span v-else class="text-grey-darken-1">No tags</span>
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-darken-1 mb-1">Created</div>
            <div class="text-white">
              {{ formatDate(bookmark.created_at) }}
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn
          color="primary"
          variant="flat"
          :href="bookmark.url"
          @click="$emit('update:modelValue', false)"
          target="_blank"
          prepend-icon="mdi-open-in-new"
        >
          Open Link
        </v-btn>
        
        <v-spacer />
        
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          Close this dialog
          <v-badge
            color="grey-darken-3"
            content="Esc"
            inline
          />
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  bookmark: Object
})

defineEmits(['update:modelValue'])

function formatDate(dateString) {
  const d = new Date(dateString)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear().toString().substring(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>