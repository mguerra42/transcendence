<script setup lang="ts">
const client = useClient()
const auth = useAuth()
const email = ref('')
const password = ref('')


const isValid = computed(() => {
    return email.value !== '' && password.value !== ''
})

//TODO : find a way to persist authMethod information
const loginGoogle = async () => {
    await client.auth.loginWithGoogle()
    client.auth.authMethod = 'google'
}

const login42 = async () => {
    await client.auth.login42()
    client.auth.authMethod = 'intra'
}

import '/frontend/public/styles/home.css';

</script>
<template>
    <div class="p-6 relative">
        <!-- <div @click="auth.showForm = false"
            class="text-2xl p-1 hover:bg-blue-500 cursor-pointer hover:text-white rounded m-1 text-black absolute right-0 top-0">
            <div class="i-mdi:close"></div>
        </div> -->
        <h1 class="home-font text-2xl">
            Welcome back ! 😊 
        </h1>
        <h1 class="home-font text-2xl mb-6">Log in to your account</h1>
        <form @submit.prevent="client.auth.authenticateUser({
                email: email,
                password: password
            })" class="flex flex-col space-y-4" autocomplete="off">
            <div style="display: flex; align-items: baseline;">
                <span class="home-font">Email:</span>
                <input type="email" v-model="email" name="email" placeholder="placeholder" class="px-3 py-2 text-black b-1 w-80" style="background-color: transparent; border:none;"/>
            </div>
            <div style="display: flex; align-items: baseline;">
                <span class="home-font">Password:</span>
                <input type="password" v-model="password" name="password" placeholder="Password placeholder"
                    class="px-3 py-2 text-black  b-1" style="background-color: transparent; border:transparent;"/>
            </div>
            <div class="text-red">
                {{ auth.error }}
            </div>

            <!-- Default Login-->
            <button class="home-font cursor-pointer hover:scale-105 transition" :class="{
                'transition duration-300': isValid,
            }" style="text-align:left">
                Log in
            </button>   

            <!-- Google Login-->
            <button type="button" @click="loginGoogle" class="border-gray-300 text-gray-600 font-semibold rounded-lg cursor-pointer hover:scale-105 transition px-4 py-2 flex">
            <img src="../../public/google_signin_logo.png" alt="Google Logo" class="w-6 h-6 mr-2" /> Sign in with Google
            </button>

            <!-- 42 Login-->
            <!-- <button type="button" @click="login42" class="bg-white-500 border-2 border-gray-300 text-gray-600 font-semibold rounded-lg cursor-pointer hover:scale-105 transition px-4 py-2 flex justify-center items-center">
            <img src="../../public/42_Logo.png" alt="42 Logo" class="w-6 h-6 mr-2" />   Sign in with Intra
            </button> -->
            
            <!-- <h1 class="text-gray text-2s flex justify-center">or</h1> -->
            <a href="#" class="home-font flex" @click="auth.mode = 'signup'">
                Sign up
            </a>
        </form>
    </div>
</template> 