<script setup>

</script>

<template>
  <v-btn
    class="mr-2"
    color="primary"
    to="/"
    variant="tonal"
  >
    <v-icon class="mr-2" size="16">mdi-bookmark</v-icon>
    <span>
      Bookmarks
    </span>
  </v-btn>

  <v-btn
    class="mr-2"
    color="primary"
    to="/profile"
    variant="tonal"
  >
    <v-icon class="mr-2" size="16">mdi-account</v-icon>
    <span>
      Profile
    </span>
  </v-btn>

  <v-btn
    class="mr-2"
    color="primary"
    to="/import"
    variant="tonal"
  >
    <v-icon class="mr-2" size="16">mdi-cloud-upload</v-icon>
    <span>
      Import
    </span>
  </v-btn>

  <v-btn
    class="mr-2"
    color="primary"
    to="/tags"
    variant="tonal"
  >
    <v-icon class="mr-2" size="16">mdi-tag</v-icon>
    <span>
      Tags
    </span>
  </v-btn>

  <v-btn
    class="mr-2"
    color="primary"
    to="/paths"
    variant="tonal"
  >
    <v-icon class="mr-2" size="16">mdi-magnify-plus</v-icon>
    <span>
      Paths
    </span>
  </v-btn>
</template>
