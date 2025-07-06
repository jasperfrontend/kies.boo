<script setup>
import appTips from '@/lib/appTips'
const randomTip = appTips[Math.floor(Math.random() * appTips.length)]
</script>

<template>
<v-card
  class="my-1 pt-1"
  color="teal-darken-4"
  :text="randomTip"
/>
</template>