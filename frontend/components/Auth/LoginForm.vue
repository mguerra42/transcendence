<script setup lang="ts">
const client = useClient()
const auth = useAuth()
const email = ref('')
const password = ref('')
 const isValid = computed(() => {  
    return email.value !== '' && password.value !== ''
 })
</script>
<template>
    <div class="w-80  bg-white p-6 rounded-lg relative">
        <div @click="auth.showForm = false"
            class="text-2xl p-1 hover:bg-blue-500 cursor-pointer hover:text-white rounded m-1 text-black absolute right-0 top-0">
            <div class="i-mdi:close"></div>
        </div>
        <h1 class="text-black text-2xl">
            Welcome Back ! 😊
        </h1>
        <h1 class="text-gray text-2xl mb-6">Log In to Your Account</h1>
        <form @submit.prevent="client.auth.login({
                email: email,
                password: password
            })" class="flex flex-col space-y-4" autocomplete="off">
            <input type="email" v-model="email" name="email" placeholder="Email" class="rounded-lg px-3 py-2 text-black b-1 " />
            <input type="password" v-model="password" name="password" placeholder="Password"
                class="rounded-lg px-3 py-2 text-black  b-1" />
            <div class="text-red">
                {{ auth.error }}
            </div>
            <button type="submit" :disabled="!isValid" class="bg-blue-500 text-white rounded-lg  cursor-pointer hover:scale-105 transition px-4 py-2" :class="{
                'hover:bg-blue-600 transition duration-300': isValid,
            }">
                Log In
            </button>
            <h1 class="text-gray text-2s flex justify-center">or</h1>
            <a href="#" class="text-blue-500 hover:text-blue-600 flex justify-center" @click="auth.mode = 'signup'">
                Sign Up
            </a>
            <!-- Add login button and other login form fields here -->
        </form>
    </div>
</template> 