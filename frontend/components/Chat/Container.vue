<script setup lang="ts">
    const chat = useChat()
</script>
<template>
    <div class="absolute bottom-0 left-0">
        <div class="relative">
            <ChatToggle @click="chat.setVisible(true)"/>
        </div>
        <div v-if="chat.visible" class="fixed bottom-3 left-3 bg-zinc-700 h-85vh  right-3  max-w-800px rounded-lg ">
            <ChatBox/>
        </div>
    </div>
</template>