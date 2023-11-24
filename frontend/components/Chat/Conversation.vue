<script setup lang="ts">
const chat = useChat();
const route = useRoute();

onMounted(() => {
    let conversation = chat.conversations.get(Number(route.params.conversation))
    console.log({conversation})
    if (conversation) {
        chat.activeConversation = conversation
    }
});
</script>
<template>
  <div>
    <ChatChannelView
      v-if="chat.activeConversation?.isChannel"
    />
  </div>
</template>
