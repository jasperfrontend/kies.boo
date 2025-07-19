<template>
  <div class="bookmark-color-picker">
    <div class="text-caption text-medium-emphasis mb-2">Bookmark Color (Optional)</div>
    <div class="d-flex align-center gap-3">
      <!-- Color Preview -->
      <div
        class="color-preview"
        :style="{
          backgroundColor: modelValue,
          border: modelValue ? 'none' : '2px dashed rgba(var(--v-theme-on-surface), 0.3)'
        }"
      >
        <v-icon
          v-if="!modelValue"
          color="grey-darken-1"
          icon="mdi-palette-outline"
          size="20"
        />
      </div>

      <!-- Color Options -->
      <div class="d-flex flex-wrap gap-2 flex-1">
        <!-- Auto-detected color (if available) -->
        <v-tooltip
          v-if="autoDetectedColor"
          location="top"
          text="Auto-detected from page"
        >
          <template #activator="{ colorProps }">
            <div
              v-bind="colorProps"
              class="color-option auto-detected"
              :class="{ active: modelValue === autoDetectedColor }"
              :style="{ backgroundColor: autoDetectedColor }"
              @click="selectColor(autoDetectedColor)"
            >
              <v-icon
                v-if="modelValue === autoDetectedColor"
                color="white"
                icon="mdi-check"
                size="16"
              />
            </div>
          </template>
        </v-tooltip>

        <!-- Preset colors -->
        <v-tooltip
          v-for="color in presetColors"
          :key="color.value"
          location="top"
          :text="color.name"
        >
          <template #activator="{ presetProps }">
            <div
              v-bind="presetProps"
              class="color-option"
              :class="{ active: modelValue === color.value }"
              :style="{ backgroundColor: color.value }"
              @click="selectColor(color.value)"
            >
              <v-icon
                v-if="modelValue === color.value"
                :color="getContrastColor(color.value)"
                icon="mdi-check"
                size="16"
              />
            </div>
          </template>
        </v-tooltip>

        <!-- Custom color picker -->
        <v-menu
          v-model="colorPickerMenu"
          :close-on-content-click="false"
          location="bottom"
          offset="8"
        >
          <template #activator="{ colorpickermenuprops }">
            <div
              v-bind="colorpickermenuprops"
              class="color-option custom-picker"
              :class="{ active: isCustomColor }"
            >
              <v-icon
                color="grey-darken-1"
                icon="mdi-eyedropper"
                size="16"
              />
              <v-tooltip activator="parent" location="bottom">
                Click to paste or type a custom color
              </v-tooltip>
            </div>
          </template>

          <v-card class="pa-4" min-width="320">
            <v-card-title class="pa-0 mb-3">Custom Color</v-card-title>

            <!-- Color Input Field -->
            <v-text-field
              v-model="colorInput"
              class="mb-3"
              clearable
              density="compact"
              :error="colorInputError"
              :error-messages="colorInputError ? 'Invalid color format' : ''"
              hint="Paste hex (#ff0000), rgb (255,0,0), or just ff0000"
              label="Paste or type color"
              persistent-hint
              prepend-inner-icon="mdi-palette"
              variant="outlined"
              @input="handleColorInput"
              @keydown.enter="applyParsedColor"
            >
              <template #append-inner>
                <div
                  v-if="parsedColor"
                  class="color-preview-small"
                  :style="{ backgroundColor: parsedColor }"
                />
              </template>
            </v-text-field>

            <!-- Visual Color Picker -->
            <v-color-picker
              v-model="customColor"
              mode="hex"
              :modes="['hex']"
              show-swatches
              width="280"
            />

            <v-card-actions class="pa-0 pt-3">
              <v-spacer />
              <v-btn
                size="small"
                variant="text"
                @click="closeColorPicker"
              >
                Cancel
              </v-btn>
              <v-btn
                v-if="parsedColor"
                color="secondary"
                size="small"
                variant="outlined"
                @click="applyParsedColor"
              >
                Use Pasted Color
              </v-btn>
              <v-btn
                color="primary"
                size="small"
                variant="flat"
                @click="applyCustomColor"
              >
                Use Picker Color
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <!-- Clear color option -->
        <v-tooltip location="top" text="No color">
          <template #activator="{ clearcolorprops }">
            <div
              v-bind="clearcolorprops"
              class="color-option clear-color"
              :class="{ active: modelValue === null }"
              @click="selectColor(null)"
            >
              <v-icon
                color="grey-darken-1"
                icon="mdi-close"
                size="16"
              />
            </div>
          </template>
        </v-tooltip>
      </div>
    </div>

    <!-- Color description -->
    <div v-if="modelValue" class="text-caption text-medium-emphasis mt-2">
      Selected: {{ getColorDescription() }}
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'

  const props = defineProps({
    modelValue: {
      type: String,
      default: null,
    },
    autoDetectedColor: {
      type: String,
      default: null,
    },
  })

  const emit = defineEmits(['update:modelValue'])

  // Local state
  const customColor = ref('#1976D2')
  const colorPickerMenu = ref(false)
  const colorInput = ref('')
  const parsedColor = ref(null)
  const colorInputError = ref(false)

  // Preset color options
  const presetColors = [
    { name: 'Red', value: '#F44336' },
    { name: 'Pink', value: '#E91E63' },
    { name: 'Purple', value: '#9C27B0' },
    { name: 'Deep Purple', value: '#673AB7' },
    { name: 'Indigo', value: '#3F51B5' },
    { name: 'Blue', value: '#2196F3' },
    { name: 'Light Blue', value: '#03A9F4' },
    { name: 'Cyan', value: '#00BCD4' },
    { name: 'Teal', value: '#009688' },
    { name: 'Green', value: '#4CAF50' },
    { name: 'Light Green', value: '#8BC34A' },
    { name: 'Lime', value: '#CDDC39' },
    { name: 'Yellow', value: '#FFEB3B' },
    { name: 'Amber', value: '#FFC107' },
    { name: 'Orange', value: '#FF9800' },
    { name: 'Deep Orange', value: '#FF5722' },
    { name: 'Brown', value: '#795548' },
    { name: 'Grey', value: '#9E9E9E' },
    { name: 'Blue Grey', value: '#607D8B' },
  ]

  // Computed properties
  const isCustomColor = computed(() => {
    if (!props.modelValue) return false
    return !presetColors.some(color => color.value === props.modelValue)
      && props.modelValue !== props.autoDetectedColor
  })

  // Methods
  function selectColor (color) {
    emit('update:modelValue', color)
  }

  function applyCustomColor () {
    emit('update:modelValue', customColor.value)
    closeColorPicker()
  }

  function applyParsedColor () {
    if (parsedColor.value) {
      emit('update:modelValue', parsedColor.value)
      closeColorPicker()
    }
  }

  function closeColorPicker () {
    colorPickerMenu.value = false
    colorInput.value = ''
    parsedColor.value = null
    colorInputError.value = false
  }

  function handleColorInput () {
    const input = colorInput.value?.trim()
    if (!input) {
      parsedColor.value = null
      colorInputError.value = false
      return
    }

    const parsed = parseColorInput(input)
    if (parsed) {
      parsedColor.value = parsed
      colorInputError.value = false
    } else {
      parsedColor.value = null
      colorInputError.value = true
    }
  }

  function parseColorInput (input) {
    if (!input) return null

    // Remove all whitespace
    const cleaned = input.replace(/\s/g, '')

    // Try different formats
    return parseHexColor(cleaned)
      || parseRgbColor(cleaned)
      || parseHslColor(cleaned)
      || parseNamedColor(cleaned)
  }

  function parseHexColor (input) {
    // Handle various hex formats
    let hex = input.toLowerCase()

    // Remove # if present
    hex = hex.replace('#', '')

    // Handle 3-digit hex (e.g., 'f0a' -> 'ff00aa')
    if (hex.length === 3 && /^[0-9a-f]{3}$/.test(hex)) {
      hex = hex.split('').map(char => char + char).join('')
    }

    // Handle 6-digit hex
    if (hex.length === 6 && /^[0-9a-f]{6}$/.test(hex)) {
      return '#' + hex
    }

    return null
  }

  function parseRgbColor (input) {
    // Handle rgb(255, 0, 0) or 255,0,0 or 255 0 0
    const rgbMatch = input.match(/(?:rgb\()?(\d+)[,\s]+(\d+)[,\s]+(\d+)\)?/i)
    if (rgbMatch) {
      const r = Number.parseInt(rgbMatch[1])
      const g = Number.parseInt(rgbMatch[2])
      const b = Number.parseInt(rgbMatch[3])

      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        return rgbToHex(r, g, b)
      }
    }

    return null
  }

  function parseHslColor (input) {
    // Handle hsl(360, 100%, 50%) or 360,100,50
    const hslMatch = input.match(/(?:hsl\()?(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?\)?/i)
    if (hslMatch) {
      const h = Number.parseInt(hslMatch[1])
      const s = Number.parseInt(hslMatch[2])
      const l = Number.parseInt(hslMatch[3])

      if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
        return hslToHex(h, s, l)
      }
    }

    return null
  }

  function parseNamedColor (input) {
    // Basic named colors
    const namedColors = {
      red: '#FF0000', green: '#008000', blue: '#0000FF', yellow: '#FFFF00',
      orange: '#FFA500', purple: '#800080', pink: '#FFC0CB', brown: '#A52A2A',
      black: '#000000', white: '#FFFFFF', gray: '#808080', grey: '#808080',
      cyan: '#00FFFF', magenta: '#FF00FF', lime: '#00FF00', navy: '#000080',
      teal: '#008080', silver: '#C0C0C0', maroon: '#800000', olive: '#808000',
    }

    return namedColors[input.toLowerCase()] || null
  }

  function rgbToHex (r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  function hslToHex (h, s, l) {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l - c / 2
    let r = 0, g = 0, b = 0

    if (0 <= h && h < 60) {
      r = c
      g = x
      b = 0
    } else if (60 <= h && h < 120) {
      r = x
      g = c
      b = 0
    } else if (120 <= h && h < 180) {
      r = 0
      g = c
      b = x
    } else if (180 <= h && h < 240) {
      r = 0
      g = x
      b = c
    } else if (240 <= h && h < 300) {
      r = x
      g = 0
      b = c
    } else if (300 <= h && h < 360) {
      r = c
      g = 0
      b = x
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return rgbToHex(r, g, b)
  }

  function getContrastColor (hexColor) {
    // Simple contrast calculation - return white for dark colors, black for light colors
    const rgb = hexToRgb(hexColor)
    if (!rgb) return 'white'

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? 'black' : 'white'
  }

  function hexToRgb (hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
      : null
  }

  function getColorDescription () {
    if (!props.modelValue) return 'None'

    if (props.modelValue === props.autoDetectedColor) {
      return `Auto-detected (${props.modelValue})`
    }

    const preset = presetColors.find(color => color.value === props.modelValue)
    if (preset) {
      return `${preset.name} (${props.modelValue})`
    }

    return `Custom (${props.modelValue})`
  }
</script>

<style scoped>
.bookmark-color-picker {
  margin: 16px 0;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-option.active {
  border-color: rgba(var(--v-theme-primary), 0.8);
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.color-option.auto-detected {
  position: relative;
}

.color-option.auto-detected::before {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #4CAF50;
  border-radius: 50%;
  border: 1px solid white;
}

.color-option.custom-picker {
  background: linear-gradient(45deg,
    rgba(var(--v-theme-surface), 1) 25%,
    transparent 25%,
    transparent 75%,
    rgba(var(--v-theme-surface), 1) 75%,
    rgba(var(--v-theme-surface), 1)),
  linear-gradient(45deg,
    rgba(var(--v-theme-surface), 1) 25%,
    transparent 25%,
    transparent 75%,
    rgba(var(--v-theme-surface), 1) 75%,
    rgba(var(--v-theme-surface), 1));
  background-size: 8px 8px;
  background-position: 0 0, 4px 4px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
}

.color-option.clear-color {
  background: linear-gradient(45deg,
    transparent 30%,
    rgba(var(--v-theme-error), 0.3) 30%,
    rgba(var(--v-theme-error), 0.3) 70%,
    transparent 70%);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
}

.color-preview-small {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  flex-shrink: 0;
}

.gap-3 {
  gap: 12px;
}

.gap-2 {
  gap: 8px;
}
</style>
