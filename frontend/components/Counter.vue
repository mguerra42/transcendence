<script setup lang='ts'>
const { count, inc, dec } = useCount()
</script>

<template>
  <div >
    <button class="rounded-full p-2 btn" @click="dec()">
      <div class="i-carbon-subtract" />
    </button>
    <div>
      {{ count }}
    </div>
    <button class="rounded-full p-2 btn"  @click="inc()">
      <div class="i-carbon-add" />
    </button>
  </div>
</template>
