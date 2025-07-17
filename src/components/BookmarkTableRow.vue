<template>
  <tr
    class="cursor-pointer bookmark-table-row"
    :class="rowClasses"
    :data-bookmark-row-index="index"
    style="background-image: none; transition: background-image 200ms ease"
    :style="rowStyles"
    tabindex="0"
    @dblclick="handleDoubleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <td>
      <v-checkbox
        density="compact"
        hide-details
        :model-value="isSelected"
        @update:model-value="$emit('toggle-selection', item.id)"
      />
    </td>
    <td>
      <v-avatar rounded="0" size="24">
        <img
          alt="favicon"
          height="24"
          :src="item.favicon"
          width="24"
          @error="e => e.target.src = '/favicon.png'"
        >
      </v-avatar>
    </td>
    <td>{{ item.title }}</td>
    <td>
      <v-list-item
        class="text-primary-lighten-3"
        :href="item.url"
        target="_blank"
        :text="displayUrl(item.url)"
      />
    </td>
    <td>
      <div v-if="item.tags && item.tags.length > 0">
        <v-chip
          v-for="tag in item.tags"
          :key="tag"
          class="cursor-pointer mr-1"
          color="primary-lighten-3"
          size="small"
          :title="`Click to search for ${tag}`"
          variant="tonal"
          @click="$emit('search-tag', tag)"
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
        <template #activator="{ props }">
          <v-btn
            size="small"
            v-bind="props"
            :title="`Actions for ${item.title}`"
            variant="flat"
            @click="actionsMenu = true"
          >
            <v-icon icon="mdi-dots-vertical" />
          </v-btn>
        </template>

        <v-list density="compact" min-width="160">
          <v-list-item
            prepend-icon="mdi-eye"
            title="View Details"
            @click="handleViewDetails"
          />
          <v-list-item
            prepend-icon="mdi-note-edit"
            title="Edit Bookmark"
            @click="handleEdit"
          />
        </v-list>
      </v-menu>
    </td>
  </tr>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useUserPreferences } from '@/composables/useUserPreferences'

  const props = defineProps({
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isSelected: {
      type: Boolean,
      required: true,
    },
    isFocused: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['toggle-selection', 'search-tag', 'view-details', 'edit', 'focus-changed'])

  const actionsMenu = ref(false)
  const isHovered = ref(false)
  const isFocusedByKeyboard = ref(false)

  // Get user preferences for double-click behavior
  const { doubleClickBehavior } = useUserPreferences()

  const rowClasses = computed(() => {
    const classes = []
    
    // Use isFocusedByKeyboard instead of props.isFocused for better control
    if (isFocusedByKeyboard.value && props.isSelected) {
      classes.push('bg-red-darken-3')
    } else if (isFocusedByKeyboard.value && !props.isSelected) {
      classes.push('bg-blue-grey-darken-3')
    } else if (props.isSelected && !isFocusedByKeyboard.value) {
      classes.push('bg-red-darken-3')
    }

    return classes.join(' ')
  })

  const rowStyles = computed(() => {
    const styles = {}

    // Always set a background image for smooth transitions
    if (props.item.metadata?.vibrant_color) {
      const [r, g, b] = props.item.metadata.vibrant_color
      
      if (isHovered.value) {
        // Hover state - visible gradient
        const startColor = `rgba(${r}, ${g}, ${b}, 0.15)`
        const startColorMinimal = `rgba(${r}, ${g}, ${b}, 0.05)`
        const endColor = 'transparent'

        styles.backgroundImage = `linear-gradient(to right, ${startColor} 0%, ${startColor} 5%, ${startColorMinimal} 15%, ${endColor} 20%, ${endColor} 70%, ${startColorMinimal} 85%, ${startColor} 100%)`
      } else {
        // Default state - transparent gradient (same structure, but invisible)
        const transparentColor = `rgba(${r}, ${g}, ${b}, 0)`
        
        styles.backgroundImage = `linear-gradient(to right, ${transparentColor} 0%, ${transparentColor} 5%, ${transparentColor} 15%, ${transparentColor} 20%, ${transparentColor} 70%, ${transparentColor} 85%, ${transparentColor} 100%)`
      }
    } else {
      // No vibrant color available - set transparent gradient for consistency
      const transparentColor = `rgba(128, 128, 128, 0)`
      styles.backgroundImage = `linear-gradient(to right, ${transparentColor} 0%, ${transparentColor} 100%)`
    }

    // Always set transition since we always have a background image now
    styles.transition = 'background-image 200ms ease-in-out'

    return styles
  })

  function displayUrl (url) {
    const cleanedUrl = url
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '')

    return cleanedUrl.length > 50
      ? cleanedUrl.slice(0, 47) + '...'
      : cleanedUrl
  }

  function formatDate (dateString) {
    const d = new Date(dateString)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear().toString().slice(2)} - ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function handleFocus() {
    isFocusedByKeyboard.value = true
    emit('focus-changed', props.index, true)
  }

  function handleBlur() {
    isFocusedByKeyboard.value = false
    emit('focus-changed', props.index, false)
  }

  function handleDoubleClick () {
    if (doubleClickBehavior.value === 'open') {
      // Open bookmark in new tab
      window.open(props.item.url, '_blank')
    } else {
      // Default behavior: select/deselect the row
      emit('toggle-selection', props.item.id)
    }
  }

  function handleViewDetails () {
    actionsMenu.value = false
    // Ensure this row remembers it was focused before opening dialog
    if (isFocusedByKeyboard.value) {
      emit('focus-changed', props.index, true)
    }
    emit('view-details', props.item)
  }

  function handleEdit () {
    actionsMenu.value = false
    // Ensure this row remembers it was focused before opening dialog
    if (isFocusedByKeyboard.value) {
      emit('focus-changed', props.index, true)
    }
    emit('edit', props.item)
  }
</script>

<style scoped>
.bookmark-table-row {
  position: relative;
}

.bookmark-table-row:hover {
  z-index: 1;
}

.bookmark-table-row:focus {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
}

.bookmark-table-row:hover td {
  border-color: red;
}
</style>