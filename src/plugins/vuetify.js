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
    'surface': '#00040A',
    'surface-bright': '#030D1D',
    'surface-light': '#0B182B',
    'surface-variant': '#0B182B',
    'on-surface-variant': '#7A8391',
    'error': '#CF667F',
    'info': '#6682CF',
    'success': '#4BB56C',
    'warning': '#D37F2A',
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
