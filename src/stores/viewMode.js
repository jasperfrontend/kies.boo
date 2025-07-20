import { defineStore } from 'pinia'

export const useViewModeStore = defineStore('viewMode', {
  state: () => ({
    mode: 'table',
  }),
  actions: {
    initialize () {
      const saved = localStorage.getItem('bookmark-view-mode')
      if (saved && ['table', 'card'].includes(saved)) {
        this.mode = saved
      }
    },
    setMode (newMode) {
      if (['table', 'card'].includes(newMode)) {
        this.mode = newMode
        localStorage.setItem('bookmark-view-mode', newMode)
      }
    },
  },
})
