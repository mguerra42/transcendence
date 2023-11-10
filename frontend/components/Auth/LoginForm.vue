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
    <div class="p-6 relative w-full">
        <!-- <div @click="auth.showForm = false"
            class="text-2xl p-1 hover:bg-blue-500 cursor-pointer hover:text-white rounded m-1 text-black absolute right-0 top-0">
            <div class="i-mdi:close"></div>
        </div> -->
        <!-- <h1 class="home-font text-2xl">
            Welcome back ! 😊 
        </h1> -->
        <h1 class="home-font text-4xl mb-6">Log in to your account</h1>
        <form @submit.prevent="client.auth.authenticateUser({
                email: email,
                password: password
            })" class="grid grid-rows-2 gap-2 w-full" autocomplete="off">

            <!-- Email Input -->
            <div class="flex flex-cols-2 w-full">
                <span class="home-font text-2xl">Email:</span>
                <input type="email" v-model="email" name="email"
                    class="px-3 text-2xl text-white outline-0 w-80" style="background-color: transparent; border:none; caret-color:rgb(0, 255, 191);"/>
            </div>

             <!-- Password Input -->
            <div class="flex flex-cols-2 w-full">
                <span class="home-font text-2xl">Password:</span>
                <input type="password" v-model="password" name="password"
                    class="px-3 text-2xl text-white outline-0" style="background-color: transparent; caret-color:rgb(0, 255, 191);"/>
            </div>
            
            <div class="text-red">
                {{ auth.error }}
            </div>

            <!-- Default Login-->
            <button class="home-button layers hero glitch text-2xl relative" :class="{
                'transition duration-300': isValid,
            }">
                LOG IN
            </button>   

            <!-- <h1 class="home-font text-4xl text-center p-6">or</h1> -->
            <!-- Google Login-->
            <button type="button" @click="loginGoogle" class="text-2xl home-font text-left cursor-pointer hover:color-white py-10">Sign in with Google
            <!-- <img src="../../public/google_signin_logo.png" alt="Google Logo" class="h-6" /> Sign in with Google -->
            </button>

            <!-- 42 Login-->
            <!-- <button type="button" @click="login42" class="bg-white-500 border-2 border-gray-300 text-gray-600 font-semibold rounded-lg cursor-pointer hover:scale-105 transition px-4 py-2 flex justify-center items-center">
            <img src="../../public/42_Logo.png" alt="42 Logo" class="w-6 h-6 mr-2" />   Sign in with Intra
            </button> -->
            
            <!-- <h1 class="home-font text-4xl text-center p-6">or</h1> -->
            <a href="#" class="home-font text-2xl cursor-pointer hover:color-white" @click="auth.mode = 'signup'">
                Sign up
            </a>
        </form>
    </div>
</template> 