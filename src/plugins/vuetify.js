/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

const supabaseDarkTheme = {
  dark: true,
  colors: {
    'background': '#121212',
    'surface': '#1E1E1E',
    'surface-bright': '#2C2C2C',
    'surface-light': '#2F2F2F',
    'surface-variant': '#333333',
    'on-surface-variant': '#A1A1A1',
    'error': '#CF6679',
    'info': '#2196F3',
    'success': '#4CAF50',
    'warning': '#FB8C00',
  },
  variables: {
    'border-color': '#333333',
    'border-opacity': 0.24,
    'high-emphasis-opacity': 0.9,
    'medium-emphasis-opacity': 0.6,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.06,
    'hover-opacity': 0.08,
    'focus-opacity': 0.12,
    'selected-opacity': 0.14,
    'activated-opacity': 0.14,
    'pressed-opacity': 0.16,
    'dragged-opacity': 0.1,

    'theme-kbd': '#2E2E2E',
    'theme-on-kbd': '#FFFFFF',
    'theme-code': '#1B1B1B',
    'theme-on-code': '#C5FDD9', // minty green for code text
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'supabaseDarkTheme',
    themes: {
      supabaseDarkTheme,
    },
  },
})
