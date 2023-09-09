<script setup lang="ts">
const client = useClient()
const auth = useAuth()
const socket = useSocket()
onMounted(async () => {
    await auth.refreshSession()
    // await socket.connect()

    // socket.on('fromserver', (data) => {
    //     console.log('fromserver', {data})
    // })
})
</script>

<template>
    <div class="h-62px b-b-1">
        <div class="container mx-auto justify-between h-full flex items-center px-5">
            <div>Ft_transcendence</div>
                <div>
                    <!-- <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="socket.emit('test', {test: '123'})">Test WS</div> -->
                </div>
            <div v-if="auth.logged === true" class="flex gap-5 items-center">
                <div class="text-orange-400">
                    {{ auth.session.email }}
                </div>
                <div>
                    <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.logout">Logout</div>
                </div>
            </div>
            <div v-if="auth.logged === false">
                <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.showForm = true">Login</div>
            </div>
        </div>
    </div>
</template>