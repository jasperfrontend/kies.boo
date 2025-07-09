<script setup>
import appTips from '@/lib/appTips'
const randomTip = appTips[Math.floor(Math.random() * appTips.length)]
</script>

<template>
<v-card
  class="mt-1 user-tips"
  color="primary"
  :text="randomTip"
  variant="flat"
/>
</template>

<style>
.user-tips {
  margin-bottom: 10rem;
  opacity: .9;
}
</style>