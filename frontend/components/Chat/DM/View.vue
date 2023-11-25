<script setup lang="ts">
    const chat = useChat()
    const auth = useAuth()
    
const otherUser = computed(() => {
  return chat.manager.active.users.find((user) => user.id != auth.session.id);
})
</script>
<template>
    <div class="flex text-white flex-1 h-[calc(100vh-100px)] w-full " v-if="chat.manager.active">
		<div class="flex flex-col gap-2 w-full flex-1">
            <div class=" flex justify-center ">
                <ChatProfileModalTrigger
              class="hover:text-blue-200 cursor-pointer hover:scale-110 transition-all"
              v-if="otherUser?.userId"
              :userId="otherUser?.userId"
            >
              <template v-slot="{ user }">
                
                <ChatUserAvatar size="h-24 w-24 " :userId="otherUser?.userId" :avatar="otherUser?.user.avatar" ></ChatUserAvatar>
              </template>
            </ChatProfileModalTrigger>
            </div>
            <div class="flex flex-col items-center">
                <ChatProfileModalTrigger
                class="hover:text-blue-200 cursor-pointer hover:scale-110 transition-all"
                v-if="otherUser?.userId"
                :userId="otherUser?.userId"
              >
                <template v-slot="{ user }">@{{ user?.username }}</template>
              </ChatProfileModalTrigger>
                <div>{{ otherUser?.user.email  }}</div>
            </div>
            <div class="flex flex-col items-center b-t-1 p-2.5  h-full w-full">
                <div  class=" justify-between flex flex-1  flex-col overflow-auto h-full   w-full ">
				{{ chat.currentMode }}
                <div class="relative flex-1 ">
                    <div class="absolute px-2 bottom-0 left-0 right-0 top-0 overflow-auto pb-3" >
                       {{ chat.manager.active.recipient }}
                        <ChatMessages />
                   
                    </div>
                </div>
                <div class=" h-100px ">
                    <ChatSendMessage />
                </div>
			</div>
            </div>
        </div>
    </div>
</template>