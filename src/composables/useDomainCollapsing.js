// src/composables/useDomainCollapsing.js
import { computed, ref, watch } from 'vue'

export function useDomainCollapsing (
  bookmarks,
  domainCollapsing,
  expandedDomains,
  expandDomain,
  loadBookmarks,
  serverOptions,
) {
  const expandingDomain = ref(null)
  const displayBookmarks = ref([])
  const isAutoLoading = ref(false)

  function extractDomain (url) {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  // Count visible bookmarks (excluding collapse rows)
  const visibleBookmarkCount = computed(() => {
    return displayBookmarks.value.length
  })

  // Get collapsed domains with their counts for the bottom display
  const collapsedDomainsWithCounts = computed(() => {
    // If domain collapsing is disabled, return empty array
    if (!domainCollapsing.value) {
      return []
    }

    const counts = {}
    const result = []

    // Count bookmarks per domain
    for (const b of bookmarks.value) {
      const d = extractDomain(b.url)
      counts[d] = (counts[d] || 0) + 1
    }

    // Find domains that are collapsed and have more than 5 items
    for (const [domain, count] of Object.entries(counts)) {
      const isExpanded = expandedDomains.value.has(domain)
      if (!isExpanded && count > 5) {
        result.push({
          name: domain,
          count: count - 5,
        })
      }
    }

    return result
  })

  // Count hidden bookmarks due to collapsing
  const hiddenBookmarkCount = computed(() => {
    // If domain collapsing is disabled, no bookmarks are hidden
    if (!domainCollapsing.value) {
      return 0
    }

    let hidden = 0
    const counts = {}

    // Count bookmarks per domain
    for (const b of bookmarks.value) {
      const d = extractDomain(b.url)
      counts[d] = (counts[d] || 0) + 1
    }

    // Calculate hidden count for collapsed domains
    for (const [domain, count] of Object.entries(counts)) {
      const isExpanded = expandedDomains.value.has(domain)
      if (!isExpanded && count > 5) {
        hidden += count - 5
      }
    }

    return hidden
  })

  function computeDisplayBookmarks () {
    // If domain collapsing is disabled, show all bookmarks
    if (!domainCollapsing.value) {
      displayBookmarks.value = [...bookmarks.value]
      return
    }

    const counts = {}
    for (const b of bookmarks.value) {
      const d = extractDomain(b.url)
      counts[d] = (counts[d] || 0) + 1
    }

    const indexMap = {}
    const result = []

    for (const b of bookmarks.value) {
      const d = extractDomain(b.url)
      indexMap[d] = (indexMap[d] || 0) + 1
      const idx = indexMap[d]
      const collapsed = !expandedDomains.value.has(d)

      // Only show first 5 items from collapsed domains
      if (counts[d] > 5 && collapsed && idx > 5) {
        continue // Skip this item (it will be shown in the bottom indicator)
      }

      result.push(b)
    }

    displayBookmarks.value = result

    // Only check for auto-loading if we're not already auto-loading
    if (!isAutoLoading.value) {
      checkAndLoadMoreIfNeeded()
    }
  }

  function checkAndLoadMoreIfNeeded () {
    const target = serverOptions.value.itemsPerPage
    const visible = visibleBookmarkCount.value
    const hidden = hiddenBookmarkCount.value

    // Only auto-load if we have specific conditions met
    if (
      target !== -1
      && hidden > 0
      && visible < target
      && !isAutoLoading.value
    ) {
      const additionalNeeded = Math.min(hidden, target - visible)

      isAutoLoading.value = true
      loadBookmarks(additionalNeeded).finally(() => {
        isAutoLoading.value = false
      })
    }
  }

  async function handleExpandDomain (domain) {
    expandingDomain.value = domain

    try {
      // Mark domain as expanded - no more collapsing for this domain
      expandDomain(domain)

      // After expanding, we need to retrigger the query to respect items-per-page limit
      await loadBookmarks()
    } finally {
      expandingDomain.value = null
    }
  }

  // Watch bookmarks and recompute display
  watch(bookmarks, computeDisplayBookmarks, { immediate: true })

  // Watch for changes in expanded domains
  watch(expandedDomains, computeDisplayBookmarks, { deep: true })

  // Watch for changes in domain collapsing preference
  watch(domainCollapsing, async (newValue, oldValue) => {
    // Only retrigger if the value actually changed (not initial load)
    if (oldValue !== undefined && newValue !== oldValue) {
      // Clear expanded domains when toggling the setting
      expandedDomains.value.clear()

      // Reset auto-loading guard
      isAutoLoading.value = false

      // When enabling/disabling collapsing, always reload to reset the state properly
      if (newValue) {
        // Enabling collapsing: reload to get fresh data and allow collapsing to work
        await loadBookmarks()
      } else {
        // Disabling collapsing: check if we need to reload due to too many fetched items
        const target = serverOptions.value.itemsPerPage
        const actualFetched = bookmarks.value.length

        if (target !== -1 && actualFetched > target) {
          await loadBookmarks()
        } else {
          // Just recompute display if no reload needed
          computeDisplayBookmarks()
        }
      }
    }
  }, { immediate: false })

  return {
    displayBookmarks,
    collapsedDomainsWithCounts,
    visibleBookmarkCount,
    hiddenBookmarkCount,
    expandingDomain,
    handleExpandDomain,
  }
}
