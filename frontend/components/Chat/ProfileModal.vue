<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
const auth = useAuth();
const chat = useChat();
const target = ref(null);

onClickOutside(target, () => {
  chat.currentProfile = {
    user: {
      id: undefined,
    },
  };
});
</script>
<template>
  <div
    v-if="chat.currentProfile?.user.id !== undefined"
    class="relative h-full w-full backdrop-blur-2"
  >
    <div
      class="absolute top-50% left-50% z-10000 -translate-x-1/2 -translate-y-1/2 z-500 overflow-hidden"
    >
      <div
        @keypress.escape="chat.currentProfile = { user: { id: undefined } }"
        @click.away="chat.currentProfile = { user: { id: undefined } }"
        ref="target"
        class="rounded-lg b-1 bg-zinc-700 overflow-hidden"
      >
        <div
          class="hover:bg-white/10 cursor-pointer gap-2 flex flex-col"
          :class="[
            chat.currentProfile.user.id == auth.session.id ? 'h-full' : '',
          ]"
        >
          <div class="w-full flex pt-3">
            <div class="rounded-full bg-gray p-2 relative mx-auto">
              <div class="i-mdi:user text-3xl text-white"></div>
              <div
                v-if="chat.currentProfile.online"
                class="i-mdi-circle text-green absolute -bottom-2px -right-2px text-16px"
              ></div>
              <div
                v-if="!chat.currentProfile.online"
                class="i-mdi-circle text-red absolute -bottom-2px -right-2px text-16px"
              ></div>
            </div>
          </div>
          <div class="flex flex-col items-center w-280px">
            <div>
              @{{ chat.currentProfile.user.username }}
              <span v-if="chat.currentProfile.user.id == auth.session.id"
                >(You)</span
              >
            </div>
            <div class="pb-2">ELO: 123</div>
            <div class="flex flex-wrap justify-center gap-5 b-t-1 w-full">
              <div class="flex items-center justify-center flex-col">
                <div class="font-bold text-2xl">111</div>
                <div>Victories</div>
              </div>
              <div class="flex items-center justify-center flex-col">
                <div class="font-bold text-2xl">123</div>
                <div>Defeats</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="grid grid-cols-3 mt-5 rounded-lg b-1 bg-zinc-700 overflow-hidden flex-row sm:flex-col md:flex-row items-center justify-center w-full"
        v-if="chat.currentProfile.user.id != auth.session.id"
      >
        <div
          @click="chat.addFriend(chat.currentProfile.user.id)"
          class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-r-1 md:b-r-1 sm:b-r-0"
        >
          <div class="i-mdi:user"></div>
          Add
        </div>
        <div
          @click="chat.challenge(chat.currentProfile.user.id)"
          class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1"
        >
          <div class="i-mdi:trophy"></div>
          Play
        </div>
        <div
          @click="chat.blockUser(chat.currentProfile.user.id)"
          class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-l-1 md:b-l-1 sm:b-l-0"
        >
          <div class="i-tdesign:user-blocked"></div>
          Block
        </div>
      </div>

      <div
        class="grid grid-cols-3 mt-5 rounded-lg b-1 bg-zinc-700 overflow-hidden flex-row sm:flex-col md:flex-row items-center justify-center w-full"
        v-if="
          ['OWNER', 'ADMIN'].includes(chat.activeConversation.role) &&
          chat.currentProfile.role != 'OWNER' &&
          chat.currentProfile.user.id != auth.session.id
        "
      >
        <div
          @click="
            chat.kick(chat.currentProfile.user.id, chat.activeConversation.id)
          "
          class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-r-1 md:b-r-1 sm:b-r-0"
        >
          <div class="i-game-icons:high-kick"></div>
          Kick
        </div>
        <div
          @click="
            chat.mute(chat.currentProfile.user.id, chat.activeConversation.id)
          "
          class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1"
        >
          <div class="i-carbon:volume-mute"></div>
          Mute
        </div>
        <div
          @click="
            chat.ban(chat.currentProfile.user.id, chat.activeConversation.id)
          "
          class="flex-1 hover:bg-white w-full hover:text-gray-700 cursor-pointer flex items-center px-2 gap-2 justify-center py-1 b-l-1 md:b-l-1 sm:b-l-0"
        >
          <div class="i-tabler:ban"></div>
          Ban
        </div>
      </div>
      <div
        class="mt-5 rounded-lg b-1 bg-zinc-700 overflow-hidden flex-row sm:flex-col md:flex-row items-center justify-center w-full"
        v-if="chat.activeConversation.role == 'OWNER'"
      >
        <div
          v-if="chat.currentProfile.role == 'ADMIN'"
          @click="
            chat.setAdmin(
              chat.currentProfile.user.id,
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
              chat.currentProfile.user.id,
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
</template>
