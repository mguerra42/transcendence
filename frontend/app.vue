<script setup lang="ts">
useHead({
  title: 'TRANSCENDENCE',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html, body , #__nuxt{
  height: 100vh;
  margin: 0;
  padding: 0;
}

html.dark {
  background: #000;
  color: white;
}
</style>
