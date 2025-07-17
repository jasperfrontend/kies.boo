<template>
  <div class="d-flex">
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
  </div>
</template>

<script setup>
  defineProps({
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
