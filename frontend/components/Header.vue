<script setup lang="ts">
const auth = useAuth()
const friend = useFriend()
const socket = useSocket()
const client = useClient()
const twoFaStatus = ref(0)
const buttonClass = ref('b-1 rounded bg-zinc-500 px-2 py-1 b-zinc-700 cursor-pointer hover:bg-zinc-600');
const QrCode = ref('')


onMounted(async () => {
    await auth.refreshSession()
})
const toggletwoFastatus = async () => {
    twoFaStatus.value = await client.auth.onOff2FA()
    console.log('2fastatus',twoFaStatus.value )
    await updateButtonClass()
}

const updateButtonClass = () => {
    console.log('2fastatus',twoFaStatus.value )

    if (twoFaStatus.value == 1) {
        buttonClass.value = 'b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600';
    } else {
        buttonClass.value = 'b-1 rounded bg-zinc-500 px-2 py-1 b-zinc-700 cursor-pointer hover:bg-zinc-600';
    }
    console.log('button=',buttonClass.value)
};
const getQrCode = async () => {
    auth.showQRCode = true
    client.auth.get2FAQr()
}
</script>

<template>
    <div class="h-62px b-b-1">
        <div class="container mx-auto justify-between h-full flex items-center px-5">
            <div>Ft_transcendence</div>
            <div v-if="auth.logged === true" class="flex gap-5 items-center">
                <div class="text-orange-400">
                   Welcome <i> {{ auth.session.username }}  </i>
                </div>
                <button  class="bg-zinc-700 px-3 py-1 m-1 text-zinc-200 rounded-lg">
                    Play 
                </button>
                <div>
                    <div :class="buttonClass" @click="toggletwoFastatus">2FA</div>
                    <div :class="buttonClass" @click="getQrCode">2FAGetQR</div>
                </div>
                <!-- <button @click="startGame()" v-if="stateProps.showPlayButton.value" class="bg-zinc-700 px-3 py-1 m-1 text-zinc-200 rounded-lg">
                    {{ stateProps.showPong.value ? 'Quit' : 'Play' }} 
                </button> -->
                <div>
                    <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.logout">Logout</div>
                </div>
                <div>
                    <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.showUserForm = true">Profile</div>
                </div>
            </div>
            <div v-if="auth.logged === false">
                <div  class="b-1 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="auth.showForm = true">Login</div>
            </div>
        </div>
    </div>
</template>