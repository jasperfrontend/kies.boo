<script setup>

</script>

<template>
<v-btn 
  to="/"
  variant="tonal"
  color="primary"
  class="mr-2"
>
  <v-icon class="mr-2" size="16">mdi-bookmark</v-icon>
  <span>
    Bookmarks 
  </span>
</v-btn>

<v-btn 
  to="/profile"
  variant="tonal"
  color="primary"
  class="mr-2"
>
  <v-icon class="mr-2" size="16">mdi-account</v-icon>
  <span>
    Profile 
  </span>
</v-btn>

<v-btn 
  to="/import"
  variant="tonal"
  color="primary"
  class="mr-2"
>
  <v-icon class="mr-2" size="16">mdi-cloud-upload</v-icon>
  <span>
    Import 
  </span>
</v-btn>

<v-btn 
  to="/hellotags"
  variant="tonal"
  color="primary"
  class="mr-2"
>
  <v-icon class="mr-2" size="16">mdi-tag</v-icon>
  <span>
    Tags 
  </span>
</v-btn>

<v-btn 
  to="/saved-searches"
  variant="tonal"
  color="primary"
  class="mr-2"
>
  <v-icon class="mr-2" size="16">mdi-magnify-plus</v-icon>
  <span>
    Paths 
  </span>
</v-btn>
</template>