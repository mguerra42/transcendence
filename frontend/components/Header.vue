<script setup lang="ts">
const auth = useAuth()
import { onClickOutside } from '@vueuse/core'; 
    const showUserMenu = ref(false)
    const toggleUserMenu = () => {
        showUserMenu.value = !showUserMenu.value
    }
    const menu = ref(null)

onClickOutside(menu, () => {
    showUserMenu.value = false
})
const socket = useSocket()
onMounted(async () => {
    await socket.connect()
})

import '/frontend/public/styles/home.css';

</script>
<template>
    <div class=" min-h-61px home-font flex items-center justify-between px-5 relative" style="letter-spacing : 1px;">
        <nuxt-link class="text-2rem" to="/">PONG GAME</nuxt-link>
            <div class="i-mdi:trophy text-2rem"></div>
            <img class="home-font h-34px " src = "arcade-game-pong-gaming-svgrepo-com.svg" alt="te"/>
            <div class="i-material-symbols:chat-bubble-sharp text-2rem"></div>
            <div class="i-material-symbols:account-box-sharp text-2rem"></div>




        <div>
            <div @click="toggleUserMenu" class="rounded bg-gray p-.5">
                <img :src="auth.session?.avatar" alt="" class="h-10 w-10">
            </div>
        </div>
        <UserMenu ref="menu" v-if="showUserMenu"/>
    </div>
</template>