<script setup>
import appTips from '@/lib/appTips'
const randomTip = appTips[Math.floor(Math.random() * appTips.length)]
</script>

<template>
<v-card
  class="mt-1 user-tips"
  color="white"
  :text="randomTip"
  variant="tonal"
/>
</template>

<style>
.user-tips {
  margin-bottom: 10rem;
}
</style>