<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-5">
          <v-card-title 
            class="mb-8"
          >
            <div class="d-inline-flex">
              <v-img src="/favicon.png" width="24" height="24" class="mt-1 mr-2"></v-img> Sign in to kies.boo to manage your bookmarks
            </div>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col
                  class="align-center text-center"
                >
                  <v-btn 
                    color="primary" 
                    @click="signInWithDiscord" 
                  >
                    Discord <mdi-discord class="mx-1" :width="20" :height="20" />
                  </v-btn>
                </v-col>
                <v-col
                  class="align-center text-center"
                >
                  <v-btn 
                    color="primary" 
                    @click="signInWithGithub" 
                  >
                    Github <v-icon icon="mdi-github" class="mx-1" width="20" height="20"></v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>            
            <div class="mt-4 text-subtitle-2 text-center" style="color: #888;">
                We use the providers above soley for authentication. We cannot post anything on your behalf,
                or change anything on your profiles at all. We just read your email address, username
                and profile picture so we can authenticate you.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import supabase from '@/lib/supabaseClient';
import MdiDiscord from './icons/MdiDiscord.vue';

function signInWithDiscord() {
  supabase.auth.signInWithOAuth({ provider: 'discord' })
}

function signInWithGithub() {
  supabase.auth.signInWithOAuth({ provider: 'github' })
}
</script>
