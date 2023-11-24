<script setup lang="ts">
import { WrappedConversation } from "~/composables/chat";
const chat = useChat();
const auth = useAuth();
const props = defineProps<{
  conversations: WrappedConversation[];
}>();
const otherUser = (conversation: WrappedConversation) => {
  return conversation.users.find((user) => user.id != auth.session.id);
};
</script>
<template>
  <div class="h-50% text-white flex flex-col b-t-1 b-white/15">
    <div class="font-bold capitalize flex justify-between items-center p-2.5">
      <div>Friends</div>
      <div class="flex items-center gap-2 mr-1.5">
        <div
          @click="chat.setView('search_friends')"
          class="bg-gray p-1 rounded cursor-pointer hover:scale-110 transition-all"
        >
          <div class="i-mdi:search"></div>
        </div>
        <div
          @click="chat.setView('list_friends')"
          class="bg-gray p-1 rounded cursor-pointer hover:scale-110 transition-all"
        >
          <div class="i-material-symbols:format-list-bulleted"></div>
        </div>
      </div>
    </div>
    <div class="overflow-y-scroll flex-1">
      <div
        v-for="conversation in conversations"
        @click="chat.showConversation(conversation)"
        class=" mb-1 px-2.5 py-2 hover:bg-white/10 cursor-pointer flex justify-center flex-col relative"
        :class="[
          chat.isActiveConversation(conversation)
            ? 'bg-white/20'
            : 'bg-zinc-600/60',
        ]"
      >
      <div class="flex gap-2 justify-start">
        <div>
            <ChatUserAvatar 
          :userId="otherUser(conversation)?.user.id"
          :avatar="otherUser(conversation)?.user.avatar"
        />
        </div>
        <div class="flex flex-col gap-1">
            <div>@{{ otherUser(conversation)?.user.username }}</div>

        </div>
      </div>
        
      </div>
    </div>
  </div>
</template>
