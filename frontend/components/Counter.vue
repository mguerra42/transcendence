<script setup lang='ts'>
const { count, inc, dec } = useCount()
</script>

<template>
  <div class="flex items-center gap-2">
    <button  class="rounded-full p-2 btn"  @click="dec()">
      <div class="i-carbon-subtract" />
    </button>
    <div class="">
      {{ count }}
    </div>
    <button class="rounded-full p-2 btn" @click="inc()">
      <div class="i-carbon-add" />
    </button>
  </div>
</template>
