<template>
    <div class="bg-gray flex items-center h-full justify-center flex-col">
      <PongContainer :gameProps="gameProps" :stateProps="stateProps"/>
    </div>
</template>

<script setup lang="ts">

  const { stateProps, gameProps } = defineProps<{
    stateProps: any,
    gameProps: any
  }>();

  onMounted(() => {
  })
</script>

