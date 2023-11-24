<script setup lang="ts">
    const chat = useChat()
    const auth = useAuth()
    
const otherUser = computed(() => {
  return chat.activeConversation.users.find((user) => user.id != auth.session.id);
})
</script>
<template>
    <div class="h-[calc(100vh-100px)]">
        <div class="px-2.5 flex gap-5 w-full ">
            <div class=" flex justify-center w-full ">
                <ChatUserAvatar class=" " :userId="otherUser?.userId" :avatar="otherUser?.user.avatar" ></ChatUserAvatar>
            </div>
            <div class="flex flex-col">
                <div>@{{ otherUser?.user.username  }}</div>
                <div>{{ otherUser?.user.email  }}</div>
            </div>
        </div>
    </div>
</template>