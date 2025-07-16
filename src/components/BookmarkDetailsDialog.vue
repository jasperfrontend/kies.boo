<template>
  <v-dialog 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="560"
    transition="dialog-bottom-transition"
  >
    <v-card v-if="bookmark" class="rounded-2xl pa-0" elevation="16">
      <v-card-title class="d-flex align-center gap-4 pa-6 pb-1">
        <v-avatar size="52" rounded="0" class="elevation-1 mr-2">
          <img
            :src="bookmark.favicon"
            alt="favicon"
            width="52"
            height="52"
            @error="e => e.target.src = '/favicon.png'"
          />
        </v-avatar>
        <div class="flex-1">
          <div class="bookmark-title">
            {{ bookmark.title }}
          </div>
          <div class="text-xs text-medium-emphasis mt-1">Bookmark Details</div>
        </div>
      </v-card-title>

      <v-card-text class="pt-2 pb-5 px-6">
        <!-- URL -->
        <div class="mb-5">
          <div class="text-caption text-medium-emphasis mb-1">URL</div>
          <v-tooltip text="Open link in new tab" location="top">
            <template #activator="{ props }">
              <a 
                v-bind="props"
                :href="bookmark.url" 
                target="_blank"
                class="bookmark-url d-inline-flex align-center"
                style="word-break:break-all;"
              >
                {{ bookmark.url }}
                <v-icon icon="mdi-open-in-new" size="18" class="ml-1" />
              </a>
            </template>
          </v-tooltip>
        </div>
        <!-- Tags -->
        <div class="mb-5">
          <div class="text-caption text-medium-emphasis mb-1">Tags</div>
          <div v-if="bookmark.tags && bookmark.tags.length > 0">
            <v-chip
              v-for="tag in bookmark.tags"
              :key="tag"
              size="medium"
              color="primary"
              variant="tonal"
              class="mr-2 mb-2 px-4 py-2 font-weight-medium"
              density="comfortable"
              :to="`/tag/${tag}`"
              label
            >
              <v-icon icon="mdi-tag" size="15" class="mr-1" />{{ tag }}
            </v-chip>
          </div>
          <span v-else class="text-grey-lighten-1">No tags</span>
        </div>
        <!-- Created -->
        <div>
          <div class="text-caption text-medium-emphasis mb-1">Created</div>
          <span class="font-mono text-lg">{{ formatDate(bookmark.created_at) }}</span>
        </div>
      </v-card-text>

      <v-divider class="mx-4" />

      <v-card-actions class="px-6 pb-5 pt-5">
        <v-btn
          color="primary"
          variant="flat"
          @click="openLinkAndClose"
          target="_blank"
          prepend-icon="mdi-open-in-new"
          class="rounded-xl px-6"
          size="large"
        >
          Open Link 
          <v-tooltip activator="parent" location="bottom">
            Press L to open this link
          </v-tooltip>
          <v-chip pill="true" ripple="false" size="small" variant="tonal" class="ml-3">
            L
          </v-chip>
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          @click="$emit('update:modelValue', false)"
          class="ml-2 px-4 py-2"
          size="large"
        >
          <v-icon icon="mdi-close" size="22" class="mr-2" /> 
          <span class="">Close</span>
          <v-chip
            pill="true"
            ripple="false"
            size="small"
            variant="tonal"
            class="ml-3"
          >
            ESC
          </v-chip>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { toRefs } from 'vue'
import { useHotkey } from 'vuetify'

const props = defineProps({
  modelValue: Boolean,
  bookmark: Object
})
const emit = defineEmits(['update:modelValue'])
const { bookmark } = toRefs(props)

function openLinkAndClose() {
  if (bookmark.value && bookmark.value.url) {
    window.open(bookmark.value.url, '_blank')
    emit('update:modelValue', false)
  }
}

// Hotkey L for "Open and close"
useHotkey('l', openLinkAndClose, { inputs: false })

function formatDate(dateString) {
  const d = new Date(dateString)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear().toString().substring(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>


<style scoped>
.rounded-2xl { border-radius: 1.4rem !important; }
.font-mono { font-family: "Fira Mono", "Consolas", "Monaco", monospace; }
.text-lg { font-size: 1.19rem; }
.gap-4 { gap: 1.2rem; }
.bookmark-title {
  font-size: 1.55rem;
  font-weight: 600;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: pre-line;
  margin-bottom: 0.2em;
  max-width: 34vw;
}
.bookmark-url {
  font-family: "Fira Mono", "Consolas", "Monaco", monospace;
  font-size: 1.08rem;
  color: #4aa3ff !important;
  text-decoration: none !important;
  transition: color 0.1s;
}
.bookmark-url:hover {
  color: #90caf9 !important;
  text-decoration: underline !important;
}
.bg-grey-darken-4 { background-color: #232323 !important; }
.flex-1 { flex: 1 1 0%; }
</style>
