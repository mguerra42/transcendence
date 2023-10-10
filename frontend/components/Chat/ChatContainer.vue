<template>  
  <!-- Open chat button -->
  <div v-if="!client.chat.chatVisible" class="fixed bottom-3 left-3 w-30 text-zinc-200 bg-zinc-700 font-bold rounded-lg flex justify-center">
    <button @click="toggleChat" class="px-2 py-2 hover:text-zinc-400">
          Open Chats
    </button>
  </div>
  
  <!-- Chat window -->
  <div v-if="client.chat.chatVisible" class="fixed bottom-3 left-3 lg:w-1/3 md:w-1/3 sm:w-2/5 ">
    <div v-if="!isLoading" class="max-h-[70vh] flex bg-zinc-700 rounded-lg">
      <ChatSelection/>
      <ChatConversationWindow/>
    </div>
    <div v-else class="min-h-[70vh] flex bg-zinc-700 rounded-lg">
      <div class="w-1/3 h-[70vh] flex-col flex items-center justify-center bg-zinc-800 rounded-lg px-2">
        <div clas="flex-col justity-center items-center">
          <p class="text-sm animate-bounce text-center text-zinc-400 mb-4">Loading chats...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- invisble scrollbar hack -->
<style>
  .scrollbar-w-2::-webkit-scrollbar {
    width: 0rem;
  }
</style>

<script setup lang="ts">
import { createClientOnly } from 'nuxt/dist/app/components/client-only';


  //TODO : refactor to make this shorter 
  const auth = useAuth();
  const client = useClient();
  const socket = useSocket();
  const channel = useChannel();
  const isLoading = ref(true)
  client.chat.newMessage = '';
  client.chat.chatVisible = false;
  client.chat.chatMessages = ref();
  client.chat.usersArray = [];
  client.chat.channelArray = [];
  client.chat.messages = [];
  client.chat.chatState= {select: 'EMPTY', receiver:[] };

  const refreshUsers = async () => {
    client.chat.messages = await client.chat.currentHistory();
    client.chat.usersArray = await client.chat.getAllUsers();
    client.chat.channelArray = await channel.getChannels();
  };

  const toggleChat = () => {
    client.chat.chatVisible = !client.chat.chatVisible;
    if (client.chat.chatVisible === false)
      handleAFK(true);
    else
      handleAFK(false);
  };
  const handleAFK = (status:boolean) => {
    if (status === true)
      socket.emit('afk', {
        sender: auth.session.username,
        text: 'OFFLINE',
      });
    else
      socket.emit('afk', {
        sender: auth.session.username,
        text: 'ONLINE',
      });
  };

  onBeforeMount(() => {
      isLoading.value = true;
  })

  onMounted(async () => {
    await auth.refreshSession();
    await socket.connect();

    isLoading.value = false;
    refreshUsers();
    socket.on('afkResponse', () => {
      refreshUsers();
    });
    socket.on('receivePrivateMessage', async (data: any) => {
      setInterval(() => {}, 50);
      client.chat.messages = await client.chat.currentHistory();
    });
    socket.on('joinChannelResponse', (data: any) => {
      client.chat.chatState.receiver.userCount = data.userCount;
      client.chat.chatState.receiver.onlineUsers = data.onlineUsersInChannel;
    });
    socket.on('receiveMessageFromChannel', async (data: any) => {
      const currentTime = new Date();
      const timeOptions:any = { hour: '2-digit', minute: '2-digit' };
      const formattedTime = currentTime.toLocaleTimeString(undefined, timeOptions);
      setInterval(() => {}, 50);
      client.chat.messages = await client.chat.currentHistory();
    });
  });
</script>

