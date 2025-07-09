<template>
  <AppTopBar />
    <v-app id="inspire" class="mt-16">
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>

</script>

<style>
table, tr, td {
  background-color: rgba(15,15,15,.5);
}
#inspire {
  background: url(https://images.unsplash.com/photo-1536147116438-62679a5e01f2?q=80&w=1920) center center no-repeat;
  background-size: cover;
  background-attachment: fixed;
}
</style>