<script setup lang="ts">
const chat = useChat();
</script>
<template>
  <div
    class="  w-full h-full overflow-hidden flex items-center justify-center flex-col gap-2"
  >
    <div class="text-4xl font-bold">No conversations found</div>
    <div class="text-xl">
        <nuxt-link class="text-blue-500" :to="{
            name: 'chat-create-channel',
        }">Create</nuxt-link>
        or <nuxt-link class="text-blue-500" :to="{
            name: 'chat-search-channel',
        }">Search</nuxt-link> a channel</div>
        <div>or</div>
    <div class="text-xl"><nuxt-link class="text-blue-500" :to="{
            name: 'chat-search-friend',
        }">Search</nuxt-link> a friend to chat with him</div>
  </div>
</template>
