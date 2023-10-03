<script setup lang="ts">
const client = useClient();
const auth = useAuth();
client.chat.showUserProfile = false;

const displayUserProfile = () => {
    client.chat.showUserProfile = !client.chat.showUserProfile;
    //console.log('showUserProfile', client.chat.showUserProfile)
}
</script>

<template>

    <!-- la div ci-dessous sur laquelle t'appuie pour ouvrir le profil d'un user-->
    <div @click="displayUserProfile" v-if="client.chat.chatState.select === 'DM'" class="p-2 h-[1/5] w-full bg-zinc-600 hover:bg-zinc-500 rounded-lg flex mr-auto mb-2 cursor-pointer">
        <div class="flex flex-col justify-center">
          <img :src="client.chat.chatState.receiver.avatarPath" class="w-12 h-12 rounded-full" />
        </div>
        <div class="flex flex-col justify-center">
          <p class="ml-3 text-md text-zinc-200" >{{ client.chat.chatState.receiver.username }}</p>
          <p class="ml-3 text-xs text-zinc-400" >W/L : {{ client.chat.chatState.receiver.victories }}-{{ client.chat.chatState.receiver.defeats }}</p>
          <p class="ml-3 text-xs text-zinc-400" >Elo : {{ client.chat.chatState.receiver.ladderPoint }}</p>
        </div>
    </div>

    <div id="chatMessages" ref="chatMessages" class="overflow-y-auto max-w-full scrollbar-w-2 h-[3/5] px-1 rounded-lg">
      <div class="flex flex-col">
        <div v-if="client.chat.chatState.select === 'DM'" v-for="message in client.chat.messages" class="mb-2">
          <div :class="{ 'text-left': message.sender === auth.session.username, 'text-right': message.sender !== auth.session.username }">
            <p class="text-sm text-zinc-300 w-full break-all rounded-lg hover:bg-zinc-600 inline-block p-2">
              {{ message.text }}
            </p>
          </div>
        </div>
      </div>
    </div>
</template>