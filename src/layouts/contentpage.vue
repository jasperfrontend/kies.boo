<script setup>

</script>

<template>
  <v-container fluid class="pa-4 content-page-layout">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="8" class="bg-surface mt-3">
        <slot></slot>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>

</script>
<style>
.content-page-layout {
  margin-bottom: 10em;
}
</style>