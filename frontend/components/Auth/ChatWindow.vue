<template>  
  <!-- Open chat button -->
  <div v-if="!chatVisible" class="fixed bottom-3 left-3 w-30 text-zinc-200 bg-zinc-700 font-bold rounded-lg flex justify-center">
    <button @click="toggleChat" class="px-2 py-2 hover:text-zinc-400">
          Open Chats
    </button>
  </div>

  <!-- Chat window -->
  <!-- Size and positioning -->
  <div v-if="chatVisible" class="fixed bottom-3 left-3 lg:w-1/3 md:w-1/3 sm:w-2/5 ">
    <!-- Main container div -->
    <div class="max-h-[70vh] flex bg-zinc-700 rounded-lg">
      <!-- User List div -->
      <div class="w-1/3 overflow-y-auto scrollbar-w-2 h-[70vh] bg-zinc-800 rounded-lg px-2 py-2 flex flex-col">
        <button @click="toggleChat" class="px-2 py-2 text-left text-zinc-200 hover:text-zinc-400">
          Close
        </button>
        <button @click="refreshUsers" class="text-sm mb-3 mt-2 text-left text-zinc-200 hover:text-zinc-400 font-semi-bold px-2 py-2">
          Connected Users
        </button>
        <div v-for="user in onlineUsersArray" class="mb-2">
          <div v-if="user.username !== auth.session.username" :class="{'bg-zinc-700 text-zinc-200 cursor-pointer rounded-lg': client.chat.receiver === user.username,
                        'bg-zinc-800 cursor-pointer hover:bg-zinc-700 rounded-lg flex': client.chat.receiver !== user.username}" >
            <button @click="chatWithUser(user)" class="px-2 py-2 w-full text-sm text-left text-zinc-300 cursor-pointer">
              {{ user.username }}
            </button>
          </div>
        </div>
      </div>

      <!-- Conversation Window div -->
      <div class="flex flex-col w-2/3 p-4">
        <!-- Messages -->
        <div id="chatMessages" ref="chatMessages" class="overflow-y-auto max-w-full scrollbar-w-2 h-[4/5] px-3 rounded-lg">
          <div class="flex flex-col">
            <p v-if="receiverDefined()" class="text-sm text-center text-zinc-500 w-full rounded-lg p-2">
              This is the start of your conversation with {{ client.chat.receiver }}.
            </p>
            <p v-else class="text-sm text-center text-zinc-500 w-full rounded-lg p-2">
              No open conversation.
            </p>
            <div v-if="receiverDefined()" v-for="message in messages" class="mb-2">
              <div :class="{ 'text-left': message.sender === auth.session.username, 'text-right': message.sender !== auth.session.username }">
                <p class="text-sm text-zinc-300 w-full break-all rounded-lg hover:bg-zinc-600 inline-block p-2">
                  {{ message.text }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Input -->
        <div v-if="receiverDefined()" class="p-2 h-[1/5] mt-auto ">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Send a message..."
            class="w-full px-2 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
          />
        </div>
        <div v-else>
          <div class=""></div>
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
  //TODO : refactor to make this shorter 
  const auth = useAuth();
  const client = useClient();
  const socket = useSocket();
  const newMessage = ref('');
  const chatVisible = ref(true);
  const chatMessages = ref();
  const onlineUsersArray: Ref<any[]> = ref([]);
  const messages: Ref<{ sender: string; text: string }[]> = ref([]);

  const receiverDefined = () => {
    if (client.chat.receiver === undefined)
      return false;
    else return true;
  };
  const scrollToBottom = () => {
    if (chatMessages.value === undefined)
      return ;
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
  };
  const clearChat = () => {
    messages.value = [];
    scrollToBottom();
  };
  const refreshUsers = async () => {
    onlineUsersArray.value = await client.chat.getOnlineUsers();
  };
  const chatWithUser = async (userToMessage : any) => {
    if (client.chat.receiver != userToMessage.username)
      clearChat();
    client.chat.receiver = userToMessage.username;
  };
  const sendMessage = () => {
    if (newMessage.value.trim() === '') 
        return;
    socket.emit('chatBox', {
      sender: auth.session.username,
      receiver: client.chat.receiver,
      text: newMessage.value 
    });

    messages.value.push({
      sender: auth.session.username,
      text: newMessage.value,
    });
    newMessage.value = '';

    setTimeout(() => {
      scrollToBottom();
    }, 0);
  };
  const toggleChat = () => {
    chatVisible.value = !chatVisible.value;
  };

  onUpdated(() => {
    refreshUsers();
  });

  onMounted(async () => {
    await auth.refreshSession();
    await socket.connect();

    refreshUsers();
    scrollToBottom();
    socket.on('chatBoxResponse', (data: any) => {
      messages.value.push({
        sender: data.sender,
        text: data.yourdata,
      });

      //trick to scroll to bottom always after vue has updated the DOM
      setTimeout(() => {
      scrollToBottom();
      }, 0);
    });
  });
</script>
