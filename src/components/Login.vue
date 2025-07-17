<template>
  <div class="bg-fade-stack">
    <div
      class="bg-fade"
      :style="{ backgroundImage: `url('${wallpaperUrl}')`, opacity: 1 }"
    />
    <div
      v-if="isFading"
      class="bg-fade bg-fade--overlay"
      :style="{ backgroundImage: `url('${prevWallpaperUrl}')`, opacity: fadeOpacity }"
    />
  </div>
  <v-container class="fill-height" fluid>
    <div class="position-fixed top-0 right-0 ma-5 d-flex">
      <v-btn color="surface">
        <v-tooltip activator="parent" location="start">Toggle Dark / Light mode</v-tooltip>
        <v-icon icon="mdi-theme-light-dark" />
        <v-menu activator="parent">
          <v-list>
            <v-list-item prepend-icon="mdi-weather-night" @click="theme.change('dark')">Dark</v-list-item>
            <v-list-item prepend-icon="mdi-white-balance-sunny" @click="theme.change('light')">Light</v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
    </div>
    <v-row align="center" justify="center">
      <v-col cols="12" md="4" sm="8">
        <v-card class="pa-8 shiny-login">
          <div class="text-center mb-4">
            <v-avatar class="mb-2" color="transparent" image="/favicon.png" size="56" />
            <h2 class="mb-1 font-weight-bold text-h5">
              Welcome to <span class="text-primary">kies.boo</span>
            </h2>
            <div class="text-medium-emphasis">
              Sign in to manage your bookmarks
            </div>
          </div>
          <v-card-text>
            <v-row dense>
              <v-col class="d-flex justify-center" cols="12" sm="6">
                <v-hover v-slot="{ props }">
                  <v-btn
                    block
                    class="provider-btn mb-2"
                    color="#5865F2"
                    size="large"
                    style="color: white;"
                    variant="elevated"
                    v-bind="props"
                    @click="signInWith('discord')"
                  >
                    <span class="me-2" style="display: flex; align-items: center;">
                      <svg
                        class="mr-2"
                        fill="currentColor"
                        height="22"
                        viewBox="0 0 24 24"
                        width="22"
                      ><path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.078.037c-.211.375-.444.864-.608 1.249a18.488 18.488 0 0 0-5.495 0 12.46 12.46 0 0 0-.617-1.25.077.077 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.045-.32 13.573.099 18.057a.08.08 0 0 0 .031.056 19.993 19.993 0 0 0 5.993 3.041.077.077 0 0 0 .084-.028c.461-.634.875-1.304 1.226-2.012a.076.076 0 0 0-.041-.105 13.176 13.176 0 0 1-1.872-.901.077.077 0 0 1-.008-.129c.126-.094.252-.192.371-.291a.074.074 0 0 1 .077-.01c3.927 1.792 8.18 1.792 12.062 0a.075.075 0 0 1 .078.009c.12.099.246.198.372.291a.077.077 0 0 1-.006.13c-.6.353-1.217.668-1.872.9a.076.076 0 0 0-.04.106c.36.707.775 1.377 1.225 2.011a.077.077 0 0 0 .084.028 19.95 19.95 0 0 0 6.002-3.04.077.077 0 0 0 .031-.057c.5-5.177-.838-9.673-3.548-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.184 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.955 2.419-2.157 2.419zm7.974 0c-1.184 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.175 1.094 2.156 2.418 0 1.334-.946 2.419-2.157 2.419Z" /></svg>
                      Discord
                    </span>
                  </v-btn>
                </v-hover>
              </v-col>
              <v-col class="d-flex justify-center" cols="12" sm="6">
                <v-hover v-slot="{ props }">
                  <v-btn
                    block
                    class="provider-btn mb-2"
                    color="#303640"
                    size="large"
                    style="color: white;"
                    variant="elevated"
                    v-bind="props"
                    @click="signInWith('github')"
                  >
                    <span class="me-2" style="display: flex; align-items: center;">
                      <svg
                        class="mr-2"
                        fill="currentColor"
                        height="22"
                        viewBox="0 0 24 24"
                        width="22"
                      ><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.158-1.11-1.467-1.11-1.467-.908-.622.069-.609.069-.609 1.004.07 1.532 1.033 1.532 1.033.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.089.636-1.34-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.338 1.909-1.296 2.748-1.025 2.748-1.025.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.565 4.944.36.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.746 0 .268.18.579.688.48C19.137 20.197 22 16.444 22 12.02 22 6.484 17.523 2 12 2z" /></svg>
                      Github
                    </span>
                  </v-btn>
                </v-hover>
              </v-col>
            </v-row>
            <div class="mt-6 text-center text-medium-emphasis text-caption">
              <v-icon class="mr-1 mb-1" icon="mdi-lock" size="18" />
              <span>
                We use the providers above soley to help you sign in.
                We can't make any changes to your accounts, nor do we store or are able to view or use your passwords.
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { useTheme } from 'vuetify'
  import supabase from '@/lib/supabaseClient'

  const theme = useTheme()
  const wallpaperUrl = computed(() =>
    theme.current.value.dark
      ? 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?ixid=M3w3NzIzNjh8MHwxfHNlYXJjaHw2fHxncmFkaWVudHxlbnwwfDB8fHwxNzUyNjc2NzAzfDA&ixlib=rb-4.1.0&w=2560&q=80'
      : 'https://images.unsplash.com/photo-1668853853439-923e013afff1?ixid=M3w3NzIzNjh8MHwxfHNlYXJjaHw1fHxibHVycnklMjBpbWFnZSUyMGJsdWUlMjBiYWNrZ3JvdW5kfGVufDB8MHx8fDE3NTI2Nzc1MjZ8MA&ixlib=rb-4.1.0&w=2560&q=80',
  )

  const isFading = ref(false)
  const fadeOpacity = ref(1)
  const prevWallpaperUrl = ref(wallpaperUrl.value)

  // Detect theme/wallpaper change:
  watch(wallpaperUrl, (newUrl, oldUrl) => {
    if (newUrl === oldUrl) return
    prevWallpaperUrl.value = oldUrl
    isFading.value = true
    fadeOpacity.value = 1

    setTimeout(() => {
      fadeOpacity.value = 0
    }, 0)

    setTimeout(() => {
      isFading.value = false
    }, 450)
  })

  async function signInWith (provider) {
    await supabase.auth.signInWithOAuth({ provider: provider })
  }
</script>

<style scoped>
.bg-fade-stack {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-fade {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
  will-change: opacity;
}
.bg-fade--overlay {
  transition: opacity 0.44s cubic-bezier(.55, .12, .39, .98);
  z-index: 1;
}

.bg-image {
  background: center center no-repeat;
  background-attachment: fixed;
  background-size: cover;
  transition: background .4s ease-in-out;
}
.shiny-login {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(9px) saturate(1.5);
  border-radius: 2rem;
  box-shadow: 0 6px 32px 0 rgba(0,0,0,0.23), 0 1.5px 3px rgba(0,0,0,0.12);
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  transition: box-shadow .6s;
}
.shiny-login:hover {
  box-shadow: 0 10px 66px 0 rgba(0,0,0,0.25), 0 2px 5px rgba(0,0,0,0.12);
}

.provider-btn {
  font-weight: 600;
  border-radius: 999px;
  transition: box-shadow 0.2s;
  box-shadow: 0 2px 8px 0 rgba(80,90,120,0.12);
}
.provider-btn:hover {
  box-shadow: 0 0 20px 0 rgba(88,101,242,0.4);
  filter: brightness(1.06);
}

.text-primary {
  color: var(--v-theme-primary);
}
</style>
