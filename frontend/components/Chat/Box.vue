<script setup lang="ts">
    
</script>
<template>
    <div class="flex h-full">
        <div class=" flex flex-col h-full w-200px b-r b-r-gray/50">
            <ChatChannels/>
            <ChatDMs/>
        </div>
        <div class="w-full min-w-300px flex-1">
            <ChatConversation/>
        </div>
    </div>
</template>