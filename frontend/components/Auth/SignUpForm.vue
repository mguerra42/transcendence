<script setup lang="ts">
const auth = useAuth()
//const username = ref('')
const email = ref('')
const password = ref('')
const isValid = computed(() => {
    return email.value !== '' && password.value !== ''
})
</script>
<template>
    <div class="w-80  bg-white p-6 rounded-lg relative">
        <h1 class="text-black text-2xl">First time ? 😄</h1>
        <h1 class="text-gray text-2xl mb-6">Create your account !</h1>
        <form @submit.prevent="auth.signup({ email, password })" class="flex flex-col space-y-4 " autocomplete="off" autocorrect="off">
            <!--<input type="text" v-model="username" name="username" placeholder="Username"
                class="rounded-lg px-3 py-2 text-black b-1" />-->
            <input type="text" v-model="email" name="email" placeholder="Email" class="rounded-lg px-3 py-2 text-black b-1" />
            <input type="password" v-model="password" name="password" placeholder="Password"
                class="rounded-lg px-3 py-2 text-black b-1" />
           
            <button type="submit" :disabled="!isValid" class=" text-white cursor-pointer hover:scale-105 transition rounded-lg px-4 py-2" :class="{
                'bg-blue-500 hover:bg-blue-600 transition duration-300': isValid,
                'bg-blue-500/50': !isValid,
            }">
                Sign Up
            </button>
            <h1 class="text-gray text-2s flex justify-center">or</h1>
            <a href="#" class="text-blue-500 hover:text-blue-600 flex justify-center" @click="auth.activeForm = 'login'">
                Log In
            </a>
        </form>
    </div>
</template>