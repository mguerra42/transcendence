<script setup lang="ts">
const auth = useAuth()


</script>
<template>
    <div  class="absolute top-100% right-0 term-box text-dark min-w-160px  rounded-lb overflow-hidden z-500" >
        <ul>
            <li class="b-t-1 select-none hover:bg-gray-200 hover:text-gray-800 px-3 py-2 cursor-pointer">
                <div class="font-bold">{{ auth.session.email }}</div>
                <div >@{{ auth.session.username }}</div>
            </li>
            <li class="">
                <nuxt-link to="/settings" class="flex items-center gap-2 b-t-1 select-none hover:bg-gray-300 hover:text-gray-800 px-3 py-2 cursor-pointer">
                    <div class="i-mdi:cogs"></div>
                    <div>Settings</div>
                </nuxt-link>
            </li>
            <li @click="auth.logout" class="flex items-center gap-2 b-t-1 select-none hover:bg-gray-200 hover:text-gray-800 px-3 py-2 cursor-pointer">
                <div class="i-mdi:logout"></div>
                <div>Logout</div>
            </li>
        </ul>
    </div>
</template>