<script setup lang="ts">
const chat = useChat()
    const channels = ref([
        {
            id: 1,
            name: 'general',
            count: 123,
            online: 12
        },
        {
            id: 2,
            name: 'Youhou',
            count: 123,
            online: 12
        },
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
        //{
        //    id: 2,
        //    name: 'Youhou',
        //},
    ])
</script>
<template>
    <div class="h-50% text-white flex flex-col ">
        <div class="font-bold capitalize flex justify-between items-center p-2.5">
            <div>Channels</div>
            <div @click="chat.current = 'new_channel'" class="bg-gray p-1 rounded cursor-pointer hover:scale-110">
                <div class="i-mdi:plus"></div>
            </div>
        </div>
        <div class="overflow-y-scroll flex-1">
            <div v-for="channel in channels" class="px-2.5 py-1 hover:bg-white/10 cursor-pointer flex justify-center flex-col">
                <div>#{{ channel.name }}</div>
                <div class="text-xs text-gray">{{ channel.count }} membres, {{ channel.online }} en ligne</div>
            </div>
        </div>
    </div>
</template>