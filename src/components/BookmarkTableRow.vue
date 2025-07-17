<template>
  <tr
    class="cursor-pointer bookmark-table-row"
    :class="rowClasses"
    style="background-image: none; transition: background-image 200ms ease"
    :style="rowStyles"
    tabindex="0"
    @dblclick="handleDoubleClick"
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

  const emit = defineEmits(['toggle-selection', 'search-tag', 'view-details', 'edit'])

  const actionsMenu = ref(false)
  const isHovered = ref(false)

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

  const rowStyles = computed(() => {
    const styles = {}

    // Add hover gradient if hovering and we have average color data
    if (isHovered.value && props.item.metadata?.vibrant_color) {
      const [r, g, b] = props.item.metadata.vibrant_color
      const startColor = `rgba(${r}, ${g}, ${b}, 0.15)`
      const startColorMinimal = `rgba(${r}, ${g}, ${b}, 0.05)`
      const endColor = 'transparent'

      styles.backgroundImage = `linear-gradient(to right, ${startColor} 0%, ${startColor} 5%, ${startColorMinimal} 15%, ${endColor} 20%, ${endColor} 70%, ${startColorMinimal} 85%, ${startColor} 100%)`
      styles.transition = 'background 0.2s ease-in-out'
    }

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
    emit('view-details', props.item)
  }

  function handleEdit () {
    actionsMenu.value = false
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
.bookmark-table-row:hover td {
  border-color: red;
}
</style>
