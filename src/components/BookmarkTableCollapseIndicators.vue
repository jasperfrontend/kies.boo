<template>
  <div class="d-flex">
    <!-- Single collapsed domain: show direct card -->
    <template v-if="collapsedDomains.length === 1">
      <div
        v-for="domain in collapsedDomains"
        :key="domain.name"
        class="collapse-indicator"
        :title="`Expand ${domain.count} collapsed links from ${domain.name}`"
      >
        <v-card
          class="ma-2 pa-1 collapsed-domain-card"
          color="surface-variant"
          variant="outlined"
        >
          <div
            class="d-flex align-center justify-space-between cursor-pointer"
            :class="{ 'loading': expandingDomain === domain.name }"
            @click="$emit('expand-domain', domain.name)"
          >
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary" icon="mdi-arrow-expand-vertical" />
              <div>
                <div class="text-subtitle-2 font-weight-medium collapsed-domain-text">
                  {{ domain.count }} &times; {{ domain.name }}
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </template>

    <!-- Multiple collapsed domains: aggregated menu -->
    <template v-else>
      <v-menu offset="8" v-if="totalCollapsedCount && totalCollapsedCount > 0">
        <template #activator="{ props: menuProps }">
          <div
            class="collapse-indicator"
            :title="`${totalCollapsedCount} collapsed links`"
          >
            <v-card
              class="ma-2 pa-1 collapsed-domain-card cursor-pointer"
              color="surface-variant"
              variant="outlined"
              v-bind="menuProps"
            >
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary" icon="mdi-arrow-expand-vertical" />
                <div class="text-subtitle-2 font-weight-medium collapsed-domain-text">
                  {{ totalCollapsedCount }} collapsed links
                </div>
              </div>
            </v-card>
          </div>
        </template>

        <v-list density="compact">
          <v-list-item
            v-for="domain in collapsedDomains"
            :key="domain.name"
            :class="{ 'loading': expandingDomain === domain.name }"
            @click="$emit('expand-domain', domain.name)"
          >
            <v-list-item-title>
              {{ domain.count }} &times; {{ domain.name }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  const props = defineProps({
    collapsedDomains: {
      type: Array,
      default: () => [],
    },
    expandingDomain: {
      type: String,
      default: null,
    },
  })

  defineEmits(['expand-domain'])

  const totalCollapsedCount = computed(() =>
    props.collapsedDomains.reduce((sum, d) => sum + d.count, 0),
  )
</script>

<style scoped>
.collapse-indicator {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.collapsed-domain-card {
  border: 2px solid rgba(var(--v-theme-primary), 0.3) !important;
  background: rgb(var(--v-theme-surface));
  transition: all 0.3s ease-in-out;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.collapsed-domain-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  background: rgba(var(--v-theme-surface), 0.7);
  transform: translateY(-2px);
  box-shadow:
    0 4px 12px rgba(var(--v-theme-primary), 0.2),
    0 2px 6px rgba(0, 0, 0, 0.1);
}

.collapsed-domain-card:hover::before {
  left: 100%;
}

.collapsed-domain-text {
  color: rgba(var(--v-theme-primary), 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Add a subtle pulse animation */
@keyframes gentle-pulse {
  0%, 100% {
    border-color: rgba(var(--v-theme-primary), 0.3);
  }
  50% {
    border-color: rgba(var(--v-theme-secondary), 0.5);
  }
}

.collapsed-domain-card {
  animation: gentle-pulse 3s ease-in-out infinite;
}

.collapsed-domain-card:hover {
  animation: none;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
