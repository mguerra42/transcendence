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
</script>
<template>
    <div class="min-h-61px  flex items-center justify-between px-5 relative">
        <div>FT_transcendence</div>
        <div>
            <div @click="toggleUserMenu" class="rounded bg-gray p-.5">
                <img :src="auth.session?.avatar" alt="" class="h-10 w-10">
            </div>
        </div>
        <UserMenu ref="menu" v-if="showUserMenu"/>
    </div>
</template>