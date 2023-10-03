<script setup lang="ts">
const client = useClient()
const auth = useAuth()
const username = ref('')
const email = ref('')
const password = ref('')
const avatar = auth.session.avatarPath
const newPassword = ref('')
const newPasswordConfirmation = ref('')
const isValid = computed(() => {
    return email.value !== '' && password.value !== ''
})

</script>

<style>
.miniature {
    max-width: 100px;
    max-height: 100px; 
    /* background-size: auto 100px; */
    /* background-position: center; */
}
</style>


<template>
<div class="w-120  bg-white p-6 rounded-lg relative">
        <div @click="auth.showUserForm = false"
            class="text-2xl p-1 hover:bg-blue-500 cursor-pointer hover:text-white rounded m-1 text-black absolute right-0 top-0">
            <div class="i-mdi:close"></div>
        </div>
        <h1 class="text-black text-2xl" mb-4>
            Profile of <i>{{ auth.session.username }} </i>
        </h1>
        <!-- <h1 class="text-gray text-2xl mb-2">You can update your profile here</h1>  -->
        <form @submit.prevent="client.auth.update({
                username : username,
                email: email,
                password: password,
                newPassword: newPassword,
                newPasswordConfirmation: newPasswordConfirmation,
            })" class="flex flex-col space-y-4" autocomplete="off">
            
            <div class="miniature"> 
                <img :src="avatar" />
            </div>

            <input type="file" accept="image/jpeg" ref="fileInput"  @change="client.auth.onFileSelected"  />
            <h1 class="text-black ">Username : {{ auth.session.username }} </h1>
            <input type="username" v-model="username" name="username" placeholder="New username" class="rounded-lg px-3 py-2 text-black b-1 " />
            <h1 class="text-black">Email : {{ auth.session.email }}</h1>
            <input type="email" v-model="email" name="email" placeholder="New email" class="rounded-lg px-3 py-2 text-black b-1 " />
            <h1 class="text-black">Change password</h1>
            <input type="password" v-model="newPassword" name="newPassword" placeholder="New password" class="rounded-lg px-3 py-2 text-black b-1 " />
            <input type="password" v-model="newPasswordConfirmation" name="newPasswordConfirmation" placeholder="New password confirmation" class="rounded-lg px-3 py-2 text-black b-1 " />

            <h1 class="text-black ">Current password to apply changes : </h1>
            <input type="password" v-model="password" name="password" placeholder="password" class="rounded-lg px-3 py-2 text-black b-1 " />


            <div class="text-red">
                {{ auth.error }}
            </div>
            <button type="submit" class="bg-blue-500 text-white rounded-lg  cursor-pointer hover:scale-105 transition px-4 py-2" :class="{
                'hover:bg-blue-600 transition duration-300': isValid,
            }">
                Update profile
            </button>
            <!-- Add login button and other login form fields here -->
        </form>
    </div>
</template>
