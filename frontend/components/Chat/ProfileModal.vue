<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
const auth = useAuth();
const chat = useChat();
const target = ref(null);

onClickOutside(target, () => {
  chat.currentProfile = null
});
const isAuthUser = computed(() => {
  return chat.currentProfile?.id == auth.session.id;
});
</script>
<template>
  <div
    v-if="chat.currentProfile?.id !== undefined"
    class="relative h-full w-full backdrop-blur-2"
  >
    <div
      class="absolute top-50% left-50% z-10000 -translate-x-1/2 -translate-y-1/2 z-500 overflow-hidden"
    >
    <div 
        ref="target">

      <div
        @keypress.escape="chat.currentProfile = null"
        class="rounded-lg  bg-zinc-700 overflow-hidden"
      >
        <div
          class="hover:bg-white/10 cursor-pointer gap-2 flex flex-col"
          :class="[
            isAuthUser ? 'h-full' : '',
          ]"
        >
          <ChatProfileCard :stats="true" :more="false" :user="chat.currentProfile" />
        </div>
      </div>
      <div
        class="grid grid-cols-2 mt-5 rounded-lg b-1 bg-zinc-700 overflow-hidden flex-row sm:flex-col md:flex-row items-center justify-center w-full"
        v-if="!isAuthUser"
      >
        <nuxt-link
        :to="{
            name: '@user',
            params: {
                user: chat.currentProfile?.username,
            },
        }"
          class="flex-1 hover:bg-white w-full b-b-1 hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 "
        >
        <i class="i-mdi:eye"></i>
        See Profile
        </nuxt-link>
        <div
          @click="chat.addFriend(chat.currentProfile?.id)"
          class="flex-1 hover:bg-white w-full b-l-1 b-b-1 hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1"
        >
          <div class="i-mdi:user"></div>
          {{ chat.friends.find(u => u.id == chat.currentProfile?.id) ? 'Remove Friend' : 'Add Friend' }}
        </div>
        <div
          @click="chat.challenge(chat.currentProfile?.id)"
          class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1"
        >
          <div class="i-mdi:trophy"></div>
          Play Pong
        </div>
        <div
          @click="chat.blockUser(chat.currentProfile?.id, !chat.blockedUsers.includes(chat.currentProfile?.id))"
          class="flex-1 hover:bg-white w-full  b-l-1 hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 "
        >
          <div class="i-tdesign:user-blocked"></div>
          {{ chat.blockedUsers.includes(chat.currentProfile?.id) ? 'Unblock' : 'Block' }} User
        </div>
      </div>
      <div v-if="chat.activeConversation">
        <div

class="grid grid-cols-3 mt-5 rounded-lg b-1 bg-zinc-700 overflow-hidden flex-row sm:flex-col md:flex-row items-center justify-center w-full"
v-if="chat.activeConversation.isAdmin && !chat.activeConversation.isRole(chat.currentProfile.id, 'OWNER')
  && chat.currentProfile.id != auth.session.id
"
>
<div
  @click="
    chat.kick(chat.currentProfile.id, chat.activeConversation.id)
  "
  class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-r-1 md:b-r-1 sm:b-r-0"
>
  <div class="i-game-icons:high-kick"></div>
  Kick
</div>
<div
  @click="
    chat.mute(chat.currentProfile.id, chat.activeConversation.id)
  "
  class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1"
>
  <div class="i-carbon:volume-mute"></div>
  Mute
</div>
<div
  @click="
    chat.ban(chat.currentProfile.id, chat.activeConversation.id)
  "
  class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-l-1 md:b-l-1 sm:b-l-0"
>
  <div class="i-tabler:ban"></div>
  Ban
</div>
</div>
      </div>
      
      <div
        class="mt-5 rounded-lg b-1 bg-zinc-700 overflow-hidden flex-row sm:flex-col md:flex-row items-center justify-center w-full"
        v-if="chat.activeConversation && chat.activeConversation?.type != 'DM' && chat.activeConversation.role == 'OWNER'"
      >
        <div
          v-if="chat.currentProfile.role == 'ADMIN'"
          @click="
            chat.setAdmin(
              chat.currentProfile.id,
              chat.activeConversation.id,
              false
            )
          "
          class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1"
        >
          <div class="i-eos-icons:admin"></div>
          Remove Admin
        </div>
        <div
          v-if="chat.currentProfile.role != 'ADMIN'"
          @click="
            chat.setAdmin(
              chat.currentProfile.id,
              chat.activeConversation.id,
              true
            )
          "
          class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1"
        >
          <div class="i-eos-icons:admin"></div>
          Set Admin
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
