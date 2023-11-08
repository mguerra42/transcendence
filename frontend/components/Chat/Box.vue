<script setup lang="ts">
    const chat = useChat()
</script>
<template>
    <div class="flex h-full relative">
        <div class=" flex flex-col h-full w-200px b-r b-r-gray/50">
            <ChatChannels/>
            <ChatDMs/>
        </div>
        <div class="w-full min-w-300px flex-1">
            <ChatConversation v-if="chat.current == 'dm'"/>
            <ChatConversation v-if="chat.current == 'search'"/>
            <ChatConversation v-if="chat.current == 'channel'"/>
            <ChatNewChannel v-if="chat.current == 'new_channel'"/>
        </div>
        <div @click="chat.setVisible(false)" class="absolute right-1 text-red top-1 hover:scale-110 cursor-pointer">
            <div class="i-mdi:close-box text-3xl"></div>
        </div>
    </div>
</template>