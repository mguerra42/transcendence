<script setup lang="ts">

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
</script>
<template>
    <div class="h-61px flex items-center justify-between px-5 relative">
        <div>FT_transcendence</div>
        <div>
            <div @click="toggleUserMenu" class="rounded-full bg-gray p-2">
                <div class="i-mdi:user text-xl text-white"></div>
            </div>
        </div>
        <UserMenu ref="menu" v-if="showUserMenu"/>
    </div>
</template>