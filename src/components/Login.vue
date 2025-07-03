<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-5" outlined>
          <v-card-title class="justify-center">Sign in to kies.boo</v-card-title>
          <v-card-text>
            <v-btn color="primary" @click="signInWithDiscord" block>
              Sign in with Discord
            </v-btn>
            <div class="mt-4 text-subtitle-2 text-center" style="color: #888;">
                We use Discord solely for authentication purposes. We do not have access to your messages or direct message history, nor can we post messages on your behalf.
                <br>
                If you don't have Discord, unfortunately you won't be able to sign in.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import supabase from '@/lib/supabaseClient';

function signInWithDiscord() {
  supabase.auth.signInWithOAuth({ provider: 'discord' })
}
</script>
