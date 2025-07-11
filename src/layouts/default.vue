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
/* table, tr, td {
  background-color: rgba(15,15,15,.5);
} */
#inspire {
  background: url(https://images.unsplash.com/photo-1488415032361-b7e238421f1b?q=80&w=1920) center center no-repeat;
  background-size: cover;
  background-attachment: fixed;
}
</style>