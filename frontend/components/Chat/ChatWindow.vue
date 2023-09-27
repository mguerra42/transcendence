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
      <!-- <ChatUserChannelList/> -->
      <!-- User List div -->
      <div class="w-1/3 overflow-y-auto scrollbar-w-2 h-[70vh] bg-zinc-800 rounded-lg px-2 py-2 flex flex-col">
        <button @click="toggleChat" class="px-2 py-2 text-left text-zinc-200 hover:text-zinc-400">
          Close
        </button>
        <!-- MP -->
        <button @click="refreshUsers" class="text-sm mb-2 mt-2 text-left text-zinc-200 hover:text-zinc-400 font-semi-bold px-2 py-2">
          Messages privés
        </button>
        <div v-for="user in usersArray" class="mb-1 flex">
          <div v-if="user.username !== auth.session.username" :class="{ 'bg-zinc-700 text-zinc-200 cursor-pointer rounded flex': (chatState.receiver.id === user.id && chatState.select === 'DM'),
                                                                        'bg-zinc-800 cursor-pointer hover:bg-zinc-700 rounded flex': (chatState.receiver.id !== user.id || chatState.select !== 'DM') }" >
              <div class="flex flex-col justify-center relative w-8 ">
                <img :src="user.avatarPath" class="ml-1 w-6 h-6 mr-auto rounded-full" />
                <img v-if="user.status==='ONLINE'" src="Location_dot_green.svg" class="absolute bottom-1 right-0 w-3 h-3 border-3 border-zinc-800 rounded-full" />
                <img v-else="user.status==='OFFLINE'" src="Location_dot_grey.svg" class="absolute bottom-1 right-0 w-3 h-3 border-3 border-zinc-800 rounded-full" />
              </div>
              <div class="flex-col justify-center">
                <div @click="chatWithUser(user)" :class="{'px-2 py-2 w-full ml-1 text-sm text-left text-zinc-300 cursor-pointer':user.status === 'ONLINE', 
                                                          'px-2 py-2 w-full ml-1 text-sm text-left text-zinc-500 cursor-pointer':user.status === 'OFFLINE'}">
                  {{ user.username }}
                </div>
              </div>
          </div>
        </div>
        <!-- Channel -->
        <button class="text-sm mb-2 mt-2 text-left text-zinc-200 hover:text-zinc-400 font-semi-bold px-2 py-2">
          Channels
        </button>
        <div v-for="channelList in channelArray" :class="{ 'bg-zinc-700 text-zinc-200 cursor-pointer rounded flex': (chatState.receiver.id === channelList.id && chatState.select === 'CHANNEL'),
                                                                        'bg-zinc-800 cursor-pointer hover:bg-zinc-700 rounded flex': (chatState.receiver.id !== channelList.id || chatState.select !== 'CHANNEL') }" >
          <div class="{'bg-zinc-700 text-zinc-200 cursor-pointer rounded-lg': client.chat.receiver === user.username,
                        'bg-zinc-800 cursor-pointer hover:bg-zinc-700 rounded-lg flex': client.chat.receiver !== user.username}" >
            <button @click="chatWithChannel(channelList)" class="px-2 py-2 w-full text-sm text-left text-zinc-300 cursor-pointer':user.status">
              #{{ channelList.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Conversation Window div -->
      <div class="flex flex-col w-2/3 p-2 m-2">
        <!-- Messages -->
        <div v-if="chatState.select === 'DM'" class="p-2 h-[1/5] w-full bg-zinc-600 hover:bg-zinc-500 rounded-lg flex mr-auto mb-2 cursor-pointer">
          <div class="flex flex-col justify-center">
            <img :src="chatState.receiver.avatarPath" class="w-12 h-12 rounded-full" />
          </div>
          <div class="flex flex-col justify-center">
            <p class="ml-3 text-md text-zinc-200" >{{ chatState.receiver.username }}</p>
            <p class="ml-3 text-xs text-zinc-400" >W/L : {{ chatState.receiver.victories }}-{{ chatState.receiver.defeats }}</p>
            <p class="ml-3 text-xs text-zinc-400" >Elo : {{ chatState.receiver.ladderPoint }}</p>
          </div>
        </div>
        <div id="chatMessages" ref="chatMessages" class="overflow-y-auto max-w-full scrollbar-w-2 h-[3/5] px-1 rounded-lg">
          <div class="flex flex-col">
            <!-- <p v-if="isChatWindowOpen()" class="text-sm text-center text-zinc-500 w-full rounded-lg p-1"> -->
              <!-- This is the start of your conversation with {{ currentUser.username }}. -->
            <!-- </p> -->
            <!-- <p v-else class="text-sm text-center text-zinc-500 w-full rounded-lg p-2"> -->
              <!-- No open conversation. -->
            <!-- </p> -->
            <div v-if="chatState.select === 'DM'" v-for="message in messages" class="mb-2">
              <div :class="{ 'text-left': message.sender === auth.session.username, 'text-right': message.sender !== auth.session.username }">
                <p class="text-sm text-zinc-300 w-full break-all rounded-lg hover:bg-zinc-600 inline-block p-2">
                  {{ message.text }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Channel -->
        <div v-if="chatState.select === 'CHANNEL'" class="p-2 h-[1/5] w-full bg-zinc-600 hover:bg-zinc-500 rounded-lg flex mr-auto mb-2 cursor-pointer">
          <div class="flex flex-col justify-center">
            <!-- <img :src="currentUser.avatar" class="w-10 h-10 rounded-full" /> -->
          </div>
          <div class="flex flex-col justify-center">
            <p class="ml-3 text-lg text-zinc-200 font-bold" >#{{ chatState.receiver.name }}</p>
            <p class="ml-3 text-xs text-zinc-400" >Subscribed : {{ chatState.receiver.userCount }} users</p>
            <p class="ml-3 text-xs text-zinc-400" >Online : {{ chatState.receiver.onlineUsers }} users</p>
          </div>
        </div>
        <div id="chatMessages" ref="chatMessages" class="overflow-y-auto max-w-full scrollbar-w-2 h-[3/5] px-1 rounded-lg">
          <div class="flex flex-col">
            <!-- <p v-if="isChatWindowOpen()" class="text-sm text-center text-zinc-500 w-full rounded-lg p-1"> -->
              <!-- This is the start of your conversation in {{ currentChannel.name }}. -->
            <!-- </p> -->
            <!-- <p v-else class="text-sm text-center text-zinc-500 w-full rounded-lg p-2"> -->
              <!-- No open conversation. -->
            <!-- </p> -->
            <div v-if="chatState.select === 'CHANNEL'" v-for="message in messages" class="mb-1">
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

        <!-- Input -->
        <div v-if="chatState.select === 'DM'" class="p-2 h-[1/5] mt-auto ">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Send a message..."
            class="w-full px-2 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
          />
        </div>
        <div v-if="chatState.select === 'CHANNEL'" class="p-2 h-[1/5] mt-auto ">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessageInChannel"
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
  const channel = useChannel();
  const newMessage = ref('');
  const chatVisible = ref(true);
  const chatMessages = ref();
  const usersArray: Ref<any[]> = ref([]);
  const channelArray: Ref<any[]> = ref([]);
  const messages: Ref<{ sender: string; text: string; time?: string; avatar?: string; }[]> = ref([]);
  let chatState: Ref<{ select: string; receiver : any }> = ref({select: 'EMPTY', receiver:[] })

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
    channelArray.value = await channel.getAllChannels();
  };
  const chatWithUser = async (userToMessage : any) => {
    if (chatState.value.receiver.id != userToMessage.id || chatState.value.select != 'DM')
      clearChat();
    chatState.value.select = 'DM';
    chatState.value.receiver.id = userToMessage.id;
    chatState.value.receiver.username = userToMessage.username;
    chatState.value.receiver.avatarPath = userToMessage.avatarPath;
    chatState.value.receiver.victories = userToMessage.victories;
    chatState.value.receiver.defeats = userToMessage.defeats;
    chatState.value.receiver.ladderPoint = userToMessage.ladderPoint;
  };
  const chatWithChannel = async (channelToMessage : any) => {
    if (chatState.value.receiver.id != channelToMessage.id || chatState.value.select != 'CHANNEL')
      clearChat();
    chatState.value.select = 'CHANNEL';
    chatState.value.receiver.id = channelToMessage.id;
    chatState.value.receiver.name = channelToMessage.name;
    socket.emit('joinChannel', {
      sender: auth.session.username,
      receiver: chatState.value.receiver.name,
    });
  };
  const sendMessage = () => {
    if (newMessage.value.trim() === '') 
        return;
    socket.emit('sendPrivateMessage', {
      sender: auth.session.username,
      receiver: chatState.value.receiver.username,
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

  //add user object to message
  const sendMessageInChannel = () => {
    if (newMessage.value.trim() === '') 
        return;
      socket.emit('sendMessageToChannel', {
      sender: auth.session.username,
      avatar: auth.session.avatarPath,
      receiver: chatState.value.receiver.name,
      text: newMessage.value 
    });
    newMessage.value = '';

    setTimeout(() => {
      scrollToBottom();
    }, 0);
  }

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

    refreshUsers();
    scrollToBottom();
    socket.on('afkResponse', () => {
      refreshUsers();
    });
    socket.on('receivePrivateMessage', (data: any) => {
      messages.value.push({
        sender: data.sender,
        text: data.content,
      });
    });
    socket.on('joinChannelResponse', (data: any) => {
      chatState.value.receiver.userCount = data.userCount;
      chatState.value.receiver.onlineUsers = data.onlineUsersInChannel;
    });
    socket.on('receiveMessageFromChannel', (data: any) => {
        const currentTime = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const formattedTime = currentTime.toLocaleTimeString(undefined, timeOptions);

        messages.value.push({
          sender: data.sender,
          avatar: data.avatar,
          time: formattedTime,
          text: data.yourdata,
        });
    });

    //trick to scroll to bottom always after vue has updated the DOM
    setTimeout(() => {
    scrollToBottom();
    }, 0);
  });
</script>

