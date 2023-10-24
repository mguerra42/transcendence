

<template>
  <PongMatchmaking :state-props="stateProps" />
  <Pong v-if="auth.logged" :state-props="stateProps" :game-props="gameProps" />
  <PongEndBoard v-if="stateProps.showEndGame.value === true" :state-props="stateProps" :game-props="gameProps" />
  <!-- <div v-else class="bg-zinc-800 flex justify-center">
    <p class="bg-zinc-200"> finito </p>
  </div> -->
</template>

<script setup lang="ts">
    const auth = useAuth()
    const client = useClient()
    const socket = useSocket()

    const { stateProps, gameProps } = defineProps<{
        stateProps: any,
        gameProps: any
    }>();

    onMounted(async () => {
        await socket.connect()
    })
</script>
