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
        <button @click="refreshUsers" class="text-sm mb-2 mt-2 text-left text-zinc-200 hover:text-zinc-400 font-semi-bold px-2 py-2">
          Messages privés
        </button>
        <div v-for="user in usersArray" class="mb-1">
          <div v-if="user.username !== auth.session.username" :class="{'bg-zinc-700 text-zinc-200 cursor-pointer rounded-lg flex': currentUser.username === user.username,
                        'bg-zinc-800 cursor-pointer hover:bg-zinc-700 rounded-lg flex': currentUser.username !== user.username}" >
              <div class="flex flex-col justify-center">
                <img v-if="user.status==='ONLINE'" src="Location_dot_green.svg" class="ml-2 w-2 h-2 mr-auto rounded-full" />
                <img v-else="user.status==='OFFLINE'" src="Location_dot_grey.svg" class="ml-2 w-2 h-2 mr-auto rounded-full" />
              </div>
              <button @click="chatWithUser(user)" :class="{ 'px-2 py-2 w-full ml-1 text-sm text-left text-zinc-300 cursor-pointer':user.status === 'ONLINE', 
                                                            'px-2 py-2 w-full ml-1 text-sm text-left text-zinc-500 cursor-pointer':user.status === 'OFFLINE'}">
                {{ user.username }}
              </button>
          </div>
        </div>
      </div>

      <!-- Conversation Window div -->
      <div class="flex flex-col w-2/3 p-2 m-2">
        <!-- Messages -->
        <div v-if="receiverDefined()" class="p-2 h-[1/5] w-full bg-zinc-600 hover:bg-zinc-800 rounded-lg flex mr-auto mb-2 cursor-pointer">
          <div class="flex flex-col justify-center">
            <img :src="currentUser.avatar" class="w-10 h-10 rounded-full" />
          </div>
          <div class="flex flex-col justify-center">
            <p class="ml-3 text-md" >{{ currentUser.username }}</p>
            <p class="ml-3 text-xs text-zinc-400" >W/L : {{ currentUser.wins }}-{{ currentUser.losses }}</p>
            <p class="ml-3 text-xs text-zinc-400" >Elo : {{ currentUser.elo }}</p>
          </div>
        </div>
        <div id="chatMessages" ref="chatMessages" class="overflow-y-auto max-w-full scrollbar-w-2 h-[3/5] px-1 rounded-lg">
          <div class="flex flex-col">
            <p v-if="receiverDefined()" class="text-sm text-center text-zinc-500 w-full rounded-lg p-1">
              This is the start of your conversation with {{ currentUser.username }}.
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
          <div></div>
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
  const offlineUsersArray: Ref<any[]> = ref([]);
  const usersArray: Ref<any[]> = ref([]);
  const currentUser = ref({avatar: '', username: '', wins: 0, losses: 0, elo: 0});
  const messages: Ref<{ sender: string; text: string }[]> = ref([]);

  const receiverDefined = () => {
    if (currentUser.value.username !== '')
      return true;
    else return false;
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
    usersArray.value = await client.chat.getAllUsers();
  };
  const chatWithUser = async (userToMessage : any) => {
    if (currentUser.value.username != userToMessage.username)
      clearChat();
    console.log(userToMessage);
    currentUser.value.avatar = userToMessage.avatarPath;
    currentUser.value.username = userToMessage.username;
    currentUser.value.wins = userToMessage.victories;
    currentUser.value.losses = userToMessage.defeats;
    currentUser.value.elo = userToMessage.ladderPoint;
  };
  const sendMessage = () => {
    if (newMessage.value.trim() === '') 
        return;
    socket.emit('chatBox', {
      sender: auth.session.username,
      receiver: currentUser.value.username,
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
    if (chatVisible.value === false)
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

  onMounted(async () => {
    await auth.refreshSession();
    await socket.connect();

    currentUser.value.avatar = '';
    currentUser.value.username = '';
    refreshUsers();
    scrollToBottom();
    socket.on('afkResponse', () => {
      refreshUsers();
    });
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

