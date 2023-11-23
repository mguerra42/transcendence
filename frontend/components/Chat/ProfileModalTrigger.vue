<script setup lang="ts">
const chat = useChat();
const props = defineProps<{
  userId: number;
}>();

const user = computed(() => {
  return chat.activeConversation?.getUser(props.userId);
});
</script>
<template>
  <div @click="chat.showProfile(user)"><slot :user="user"></slot></div>
</template>
