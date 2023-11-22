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
       
        <div class="home-font px-4 py-10 text-5xl mb-6 text-center">Log in to your account</div>
        <form @submit.prevent="client.auth.authenticateUser({
                email: email,
                password: password
            })" class="grid grid-row gap-2 w-full" autocomplete="off">

            <!-- Email Input -->
            <div class="flex flex-cols-2 w-full">
                <span class="home-font text-2xl">Email:</span>
                <input type="email" v-model="email" name="email"
                    class="px-3 text-2xl text-white outline-0" style="background-color: transparent; border:none; caret-color:rgb(0, 255, 191);"/>
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
            <div class="text-center">
            <button class="home-font big-title layers hero glitch text-5xl " :class="{
                'transition duration-300': isValid,
            }"  data-text="LOG IN">
                LOG IN
            </button>
            </div>

            <!-- Google Login-->
            <button type="button" @click="loginGoogle" class="text-2xl home-font big-title layers hero glitch text-left cursor-pointer hover:color-white py-10"
                data-text="Sign in with Google">Sign in with Google
            <!-- <img src="../../public/google_signin_logo.png" alt="Google Logo" class="h-6" /> Sign in with Google -->
            </button>
            
            <a href="#" class="home-font big-title layers hero glitch text-2xl cursor-pointer hover:color-white" data-text="Sign up" @click="auth.mode = 'signup'">
                Sign up
            </a>
        </form>
    </div>
</template> 