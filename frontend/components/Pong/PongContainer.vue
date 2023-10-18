

<template>
  <PongMatchmaking :state-props="stateProps" />
  <Pong v-if="auth.logged" :state-props="stateProps" :game-props="gameProps" />
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
