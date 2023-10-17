<template>
    <PongMatchmaking         :stateProps="stateProps"/>
    <Pong v-if="auth.logged" :stateProps="stateProps" :gameProps="gameProps"/>
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