<template>
  <tr
    :class="rowClasses"
    tabindex="0"
    @dblclick="handleDoubleClick"
    class="cursor-pointer"
  >
    <td>
      <v-checkbox
        :model-value="isSelected"
        @update:model-value="$emit('toggle-selection', item.id)"
        hide-details
        density="compact"
      />
    </td>
    <td>
      <v-avatar rounded="0" size="24">
        <img
          :src="item.favicon"
          alt="favicon"
          width="24"
          height="24"
          @error="e => e.target.src = '/favicon.png'"
        />
      </v-avatar>
    </td>
    <td>{{ item.title }}</td>
    <td>
      <v-list-item
        :href="item.url"
        target="_blank"
        class="text-primary-lighten-3"
        :text="displayUrl(item.url)"
      />
    </td>
    <td>
      <div v-if="item.tags && item.tags.length > 0">
        <v-chip
          v-for="tag in item.tags"
          :key="tag"
          size="small"
          variant="tonal"
          color="primary-lighten-3"
          class="cursor-pointer mr-1"
          @click="$emit('search-tag', tag)"
          :title="`Click to search for ${tag}`"
        >
          {{ tag }}
        </v-chip>
      </div>
      <span v-else class="text-grey-darken-1">No tags</span>
    </td>
    <td>
      {{ formatDate(item.created_at) }}
    </td>
    <td>
      <v-menu
        v-model="actionsMenu"
        :close-on-content-click="true"
        location="bottom end"
        offset="8"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            variant="flat"
            size="small"
            v-bind="props"
            @click="actionsMenu = true"
            :title="`Actions for ${item.title}`"
          >
            <v-icon icon="mdi-dots-vertical"></v-icon>
          </v-btn>
        </template>
        
        <v-list density="compact" min-width="160">
          <v-list-item
            @click="handleViewDetails"
            prepend-icon="mdi-eye"
            title="View Details"
          />
          <v-list-item
            @click="handleEdit"
            prepend-icon="mdi-note-edit"
            title="Edit Bookmark"
          />
        </v-list>
      </v-menu>
    </td>
  </tr>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserPreferences } from '@/composables/useUserPreferences'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  isSelected: {
    type: Boolean,
    required: true
  },
  isFocused: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-selection', 'search-tag', 'view-details', 'edit'])

const actionsMenu = ref(false)

// Get user preferences for double-click behavior
const { doubleClickBehavior } = useUserPreferences()

const rowClasses = computed(() => {
  const classes = []
  
  if (props.isFocused && props.isSelected) {
    classes.push('bg-red-darken-3')
  } else if (props.isFocused && !props.isSelected) {
    classes.push('bg-blue-grey-darken-3')
  } else if (props.isSelected && !props.isFocused) {
    classes.push('bg-red-darken-3')
  }
  
  return classes.join(' ')
})

function displayUrl(url) {
  const cleanedUrl = url
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '')
  
  return cleanedUrl.length > 50 
    ? cleanedUrl.substring(0, 47) + '...' 
    : cleanedUrl
}

function formatDate(dateString) {
  const d = new Date(dateString)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear().toString().substring(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function handleDoubleClick() {
  if (doubleClickBehavior.value === 'open') {
    // Open bookmark in new tab
    window.open(props.item.url, '_blank')
  } else {
    // Default behavior: select/deselect the row
    emit('toggle-selection', props.item.id)
  }
}

function handleViewDetails() {
  actionsMenu.value = false
  emit('view-details', props.item)
}

function handleEdit() {
  actionsMenu.value = false
  emit('edit', props.item)
}
</script>