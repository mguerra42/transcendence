<script setup lang="ts">
const client = useClient()
const auth = useAuth()
const email = ref('')
const password = ref('')


const isValid = computed(() => {
    return email.value !== '' && password.value !== ''
})

const loginGoogle = async () => {
    await client.auth.loginWithGoogle()
}

</script>
<template>
    <div class="w-80 bg-white p-6 rounded-lg relative">
        <h1 class="text-black text-2xl">
            Welcome Back ! 😊 
        </h1>
        <h1 class="text-gray text-2xl mb-6">Log In to Your Account</h1>
        <form @submit.prevent="auth.login('credentials',{
                email: email,
                password: password
            })" class="flex flex-col space-y-4" >
            <input type="text" v-model="email" name="email" placeholder="Email" class="rounded-lg px-3 py-2 text-black b-1 " />
            <input type="password" v-model="password" name="password" placeholder="Password"
                class="rounded-lg px-3 py-2 text-black  b-1" />
            

            <!-- Default Login-->
            <button type="submit" :disabled="!isValid" class=" text-white rounded-lg  cursor-pointer hover:scale-105 transition px-4 py-2" :class="{
                'bg-blue-500/50': !isValid,
                'bg-blue-500 hover:bg-blue-600 transition duration-300': isValid,
            }">
                Log In
            </button>   

            <!-- Google Login-->
            <!--<button type="button" @click="auth.login('google')" class="bg-white-500 border-2 border-gray-300 text-gray-600 font-semibold rounded-lg cursor-pointer hover:scale-105 transition px-4 py-2 flex justify-center items-center">
            <img src="/google_signin_logo.png" alt="Google Logo" class="w-6 h-6 mr-2" /> Sign in with Google
            </button>-->

            <!-- 42 Login-->
            <button type="button" @click="auth.login('42')" class="bg-white-500 border-2 border-gray-300 text-gray-600 font-semibold rounded-lg cursor-pointer hover:scale-105 transition px-4 py-2 flex justify-center items-center">
            <img src="/42_Logo.png" alt="42 Logo" class="w-6 h-6 mr-2" /> Sign in with Intra
            </button>
            
            <h1 class="text-gray text-2s flex justify-center">or</h1>
            <a href="#" class="text-blue-500 hover:text-blue-600 flex justify-center" @click="auth.activeForm = 'signup'">
                Sign Up
            </a>
        </form>
    </div>
</template> 