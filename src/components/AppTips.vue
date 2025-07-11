<script setup>
import appTips from '@/lib/appTips'
const randomTip = appTips[Math.floor(Math.random() * appTips.length)]
</script>

<template>
<v-card
  class="mt-1 user-tips"
  color="surface"
  title="Kies.boo tips"
  :subtitle="randomTip"
  variant="flat"
  prepend-icon="mdi-lightbulb-on-90"
/>
</template>

<style>
.user-tips {
  margin-bottom: 10rem;
  opacity: .9;
}
</style>