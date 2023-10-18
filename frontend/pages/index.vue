<template>
    <div class="bg-gray flex items-center h-full justify-center flex-col">
      <PongContainer v-if="auth.logged" :gameProps="gameProps" :stateProps="stateProps"/>
    </div>
</template>

<script setup lang="ts">

  const auth = useAuth()
  const { stateProps, gameProps } = defineProps<{
    stateProps: any,
    gameProps: any
  }>();

  onMounted(() => {
  })
</script>

