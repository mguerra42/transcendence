<script setup lang="ts">
const chat = useChat();
</script>

<template>
  <div
    class="relative w-full min-w-300px flex flex-col max-w-800px bg-zinc-700 rounded-r-lg"
    v-if="
      chat.compactMode == false ||
      (chat.compactMode == true && chat.currentMode == 'chat')
    "
    :class="[
      chat.compactMode == true && chat.currentMode == 'chat'
        ? 'w-full min-w-300px max-w-800px rounded-l-lg b-r-0'
        : '',
    ]"
  >
    <div
      @click="chat.currentMode = 'channels'"
      class="b-blue b-1 md:hidden h-50px w-10px absolute top-[calc(50%-25px)] px-6px cursor-pointer hover:bg-blue hover:text-white left-0 rounded-r flex flex-col justify-center items-center"
    >
      <div class="i-mdi:chevron-right"></div>
    </div>
    <!--<ChatConversation v-if="chat.current == 'dm'"/>
            <ChatConversation v-if="chat.current == 'search'"/>-->
    <ChatChannelView v-if="chat.view == 'channel'" />
    <ChatChannelCreate v-if="chat.view == 'create_channel'" />
    <ChatChannelSearch v-if="chat.view == 'search_channel'" />
    <ChatDMSearch v-if="chat.view == 'search_friends'" />

    <div
      @click="chat.setVisible(false)"
      class="absolute right-1 text-red top-1 hover:scale-110 cursor-pointer"
    >
      <div class="i-mdi:close-box text-3xl"></div>
    </div>
  </div>
</template>
