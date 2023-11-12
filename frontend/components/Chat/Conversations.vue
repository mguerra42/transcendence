<script setup lang="ts">
import { WrappedConversation } from '~/composables/chat'
    const chat = useChat()
    const conversationsArray = computed(() => [...chat.conversations].map(data => data[1]))
    const channels = computed(() => conversationsArray.value.filter((conversation: WrappedConversation) => conversation.channel.type != 'DM').sort((a: WrappedConversation, b: WrappedConversation) => b.channel.id - a.channel.id))
    //const dms = computed(() => conversationsArray.value.filter((conversation: WrappedConversation) => conversation.channel.type == 'DM'))
    watchEffect(() => {
        console.log(conversationsArray.value)
        console.log(channels.value?.[0]?.users)
    })
    onMounted(() =>
     {
        window.DD  = {
            chat,
            conversationsArray,
            channels,
            //dms
        }
     })
</script>
<template>
    <!--<div  
    class=" md:flex flex-col h-full w-250px b-r b-r-gray/20  bg-zinc-700 rounded-l-lg relative" :class="[
        chat.compactMode == true  && chat.currentMode == 'channels' ? 'w-full min-w-300px max-w-600px rounded-r-lg b-r-0' : ''
    ]">
        <div @click="chat.currentMode = 'chat'" class="b-blue b-1 md:hidden  h-50px w-10px absolute top-[calc(50%-25px)] px-6px cursor-pointer hover:bg-blue hover:text-white right-0 rounded-l flex flex-col justify-center items-center z-999 bg-zinc-700">
            <div class="i-mdi:chevron-left"></div>
        </div>
    </div>-->
    <div class="min-w-200px b-r b-r-gray/20 w-full sm:w-auto" v-if="chat.compactMode == false || chat.compactMode == true  && chat.currentMode == 'channels'">
        <div @click="chat.currentMode = 'chat'" class="b-blue b-1 md:hidden  h-50px w-10px absolute top-[calc(50%-25px)] px-6px cursor-pointer hover:bg-blue hover:text-white right-0 rounded-l flex flex-col justify-center items-center z-999 bg-zinc-700">
            <div class="i-mdi:chevron-left"></div>
        </div>
        <ChatChannelList :conversations="channels"/>
        <!--<ChatDMs :conversations="channels"/>-->
    </div>
</template>