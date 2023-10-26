<script setup lang="ts">
const auth = useAuth()
const route = useRoute()
const check2FA = route.query.require2FA !== undefined
const show2FA = ref(false)
if(check2FA === true) {
    if (route.query.require2FA === 'true') {
        show2FA.value = true
    } else {
        await auth.refreshSession()
    }
}
</script>

<template>
    <div class="h-full rounded-lg flex">
        <div
            class="min-h-screen w-0/5 lg:w-3/5 md:w-1/2 sm:w-0/5 xs:w-0/5 bg-zinc-300 flex flex-col items-center justify-center">
            <div>
                <p class="text-5xl lg:text-7xl text-center font-bold text-zinc-600 m-4">Transcendence</p>
            </div>
        </div>
        <div class="min-h-screen w-5/5 lg:w-2/5 md:w-1/2 sm:w-5/5 xs:w-5/5 bg-zinc-800 flex flex-col items-center justify-center">
            <Auth2FAForm v-if="show2FA" />
            <AuthLoginForm v-else-if="auth.mode === 'login'" />
            <AuthSignUpForm v-else-if="auth.mode === 'signup'" />
        </div>
    </div>
</template>
