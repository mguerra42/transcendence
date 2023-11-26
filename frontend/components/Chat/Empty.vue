<script setup lang="ts">
const chat = useChat();
</script>
<template>
  <div
    class="  w-full h-full term-box overflow-hidden flex items-center justify-center flex-col gap-2"
  >
    <div class="text-4xl font-bold home-font" style="letter-spacing : 1px;">No conversations found</div>
    <div class="text-xl home-font">
        <nuxt-link class="home-font home-button layers hero glitch" data-text="Create" :to="{
            name: 'chat-create-channel',
        }">Create</nuxt-link>
        or <nuxt-link class="home-font home-button layers hero glitch" data-text="Search" :to="{
            name: 'chat-search-channel',
        }">Search</nuxt-link> a channel</div>
        <div>or</div>
    <div class="text-xl home-font"><nuxt-link class="home-font home-button layers hero glitch" data-text="Search" :to="{
            name: 'chat-search-friend',
        }">Search</nuxt-link> a friend to chat with him</div>
  </div>
</template>
