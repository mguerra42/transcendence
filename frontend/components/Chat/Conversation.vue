<script setup lang="ts">
    const auth = useAuth()
    const conversation = ref({
        users: [
            {
                id: 1,
                username: 'mguerra'
            },
            {
                id: 2,
                username: 'jij'
            },
        ],
        messages: [
            {
                from: 1,
                content: 'Hello',
                timestamp: new Date()
            },
            {
                from: 2,
                content: 'Yoooooo',
                timestamp: new Date()
            },
        ],
        isPrivate: true
    })
    const getUserFromId = (id: number) => conversation.value.users.find(u => u.id == id)
    const dest = computed(() => {
        return conversation.value.users.find(u => u.id != auth.session.id)
    })
</script>
<template>
    <div class="flex text-white flex-1 h-full w-full">
        <div class="p-2.5 flex justify-center w-full" v-if="conversation.isPrivate">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex justify-center">
                    <div class="rounded-full bg-gray p-2">
                        <div class="i-mdi:user text-5xl text-white"></div>
                    </div>
                </div>
                <div class="text-center">
                    @{{ dest.username }}
                </div>
                <div class="flex items-center justify-center w-full">
                    <div class="flex-1 hover:bg-white hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-1 rounded-l">
                        <div class="i-mdi:user"></div>
                        Add Friend</div>
                    <div class="flex-1 hover:bg-white hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-y">
                        <div class="i-mdi:trophy"></div>
                        Challenge</div>
                    <div class="flex-1 hover:bg-white hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-1 rounded-r">
                        <div class="i-mdi:block-helper"></div>
                        Block</div>
                </div>
                <div class="flex flex-col gap-2">
                    <div v-for="message in conversation.messages" class="rounded-lg shadow-md p-2.5 w-80% flex" :class="[message.from == auth.session.id ? 'bg-green/50 ml-auto shadow-green' : 'bg-blue/50 shadow-blue']">
                        <div class="flex gap-2">
                            <div class="">
                                <div class="rounded-full bg-gray p-2">
                                    <div class="i-mdi:user text-lg text-white"></div>
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <div class="flex gap-2 items-center leading-1">
                                    <div>{{ getUserFromId(message.from)?.username }}</div>
                                    <div class="text-xs text-gray-300">{{ message.timestamp.toLocaleString() }}</div>
                                </div>
                                <div>{{ message.content }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>