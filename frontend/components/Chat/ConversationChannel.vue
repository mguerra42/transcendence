<script setup lang="ts">
const client = useClient();
const auth = useAuth();
</script>

<template>
    <div v-if="client.chat.chatState.select === 'CHANNEL'" class="p-2 h-[1/5] w-full bg-zinc-600 hover:bg-zinc-500 rounded-lg flex mr-auto mb-2 cursor-pointer">
          <div class="flex flex-col justify-center">
            <!-- <img :src="client.chat.chatState.receiver.avatarPath" class="w-10 h-10 rounded-full" /> -->
          </div>
          <div class="flex flex-col justify-center">
            <p class="ml-3 text-lg text-zinc-200 font-bold" >#{{ client.chat.chatState.receiver.name }}</p>
            <p class="ml-3 text-xs text-zinc-400" >Subscribed : {{ client.chat.chatState.receiver.userCount }} users</p>
            <p class="ml-3 text-xs text-zinc-400" >Online : {{ client.chat.chatState.receiver.onlineUsers }} users</p>
          </div>
        </div>
        <div id="chatMessages" ref="chatMessages" class="overflow-y-auto max-w-full scrollbar-w-2 h-[3/5] px-1 rounded-lg">
          <div class="flex flex-col">
            <div v-if="client.chat.chatState.select === 'CHANNEL'" v-for="message in client.chat.messages" class="mb-1">
              <div class="text-left">
                <div class="flex flex-col justify-center w-full hover:bg-zinc-600 rounded inline-block p-1">
                  <div class="flex">
                    <div class="flex flex-col justify-center cursor-pointer">
                       <p class="text-xs text-zinc-400"> {{ message.sender }} </p>
                    </div>
                    <div class="flex flex-col justify-center" >
                       <p class="text-xs ml-1 text-zinc-400"> - {{ message.time }} </p>
                    </div>
                  </div>
                  <p class="text-sm text-zinc-300 break-all">
                    {{ message.text }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
</template>

