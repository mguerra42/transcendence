<template>  
  <!-- Open chat button -->
  <div v-if="!client.chat.chatVisible" class="fixed bottom-3 left-3 w-30 text-zinc-200 bg-zinc-700 font-bold rounded-lg flex justify-center">
    <button @click="toggleChat" class="px-2 py-2 hover:text-zinc-400">
          Open Chats
    </button>
  </div>
  
  <!-- Chat window -->
  <!-- Size and positioning -->
  <div v-if="client.chat.chatVisible" class="fixed bottom-3 left-3 lg:w-1/3 md:w-1/3 sm:w-2/5 ">
    <!-- Main container div -->
    <div class="max-h-[70vh] flex bg-zinc-700 rounded-lg">
      <ChatUserChannelList/>
        
      <!-- Conversation Window div -->
      <div class="flex flex-col w-2/3 p-2 m-2">
        <!-- Messages -->
        <div v-if="client.chat.chatState.select === 'DM'" class="p-2 h-[1/5] w-full bg-zinc-600 hover:bg-zinc-500 rounded-lg flex mr-auto mb-2 cursor-pointer">
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
            <!-- <p v-if="isChatWindowOpen()" class="text-sm text-center text-zinc-500 w-full rounded-lg p-1"> -->
              <!-- This is the start of your conversation with {{ currentUser.username }}. -->
            <!-- </p> -->
            <!-- <p v-else class="text-sm text-center text-zinc-500 w-full rounded-lg p-2"> -->
              <!-- No open conversation. -->
            <!-- </p> -->
            <div v-if="client.chat.chatState.select === 'DM'" v-for="message in client.chat.messages" class="mb-2">
              <div :class="{ 'text-left': message.sender === auth.session.username, 'text-right': message.sender !== auth.session.username }">
                <p class="text-sm text-zinc-300 w-full break-all rounded-lg hover:bg-zinc-600 inline-block p-2">
                  {{ message.text }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Channel -->
        <div v-if="client.chat.chatState.select === 'CHANNEL'" class="p-2 h-[1/5] w-full bg-zinc-600 hover:bg-zinc-500 rounded-lg flex mr-auto mb-2 cursor-pointer">
          <div class="flex flex-col justify-center">
            <!-- <img :src="currentUser.avatar" class="w-10 h-10 rounded-full" /> -->
          </div>
          <div class="flex flex-col justify-center">
            <p class="ml-3 text-lg text-zinc-200 font-bold" >#{{ client.chat.chatState.receiver.name }}</p>
            <p class="ml-3 text-xs text-zinc-400" >Subscribed : {{ client.chat.chatState.receiver.userCount }} users</p>
            <p class="ml-3 text-xs text-zinc-400" >Online : {{ client.chat.chatState.receiver.onlineUsers }} users</p>
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

        <!-- Input -->
        <div v-if="client.chat.chatState.select === 'DM'" class="p-2 h-[1/5] mt-auto ">
          <input
            v-model="client.chat.newMessage"
            @keyup.enter="sendMessage"
            placeholder="Send a message..."
            class="w-full px-2 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
          />
        </div>
        <div v-if="client.chat.chatState.select === 'CHANNEL'" class="p-2 h-[1/5] mt-auto ">
          <input
            v-model="client.chat.newMessage"
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
  client.chat.newMessage = '';
  client.chat.chatVisible = false;
  client.chat.chatMessages = ref();
  client.chat.usersArray = [];
  client.chat.channelArray = [];
  client.chat.messages = [];
  client.chat.chatState= {select: 'EMPTY', receiver:[] };

  const refreshUsers = async () => {
    client.chat.usersArray = await client.chat.getAllUsers();
    client.chat.channelArray = await channel.getAllChannels();
  };

  const sendMessage = () => {
    if (client.chat.newMessage.trim() === '') 
        return;
    socket.emit('sendPrivateMessage', {
      sender: auth.session.username,
      receiver: client.chat.chatState.receiver.username,
      text: client.chat.newMessage 
    });

    client.chat.messages.push({
      sender: auth.session.username,
      text: client.chat.newMessage,
    });
    client.chat.newMessage = '';

    setTimeout(() => {
      client.chat.scrollToBottom();
    }, 0);
  };

  //add user object to message
  const sendMessageInChannel = () => {
    if (client.chat.newMessage.trim() === '') 
        return;
      socket.emit('sendMessageToChannel', {
      sender: auth.session.username,
      avatar: auth.session.avatarPath,
      receiver: client.chat.chatState.receiver.name,
      text: client.chat.newMessage 
    });
    client.chat.newMessage = '';

    setTimeout(() => {
      client.chat.scrollToBottom();
    }, 0);
  }

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

  onMounted(async () => {
    await auth.refreshSession();
    await socket.connect();

    refreshUsers();
    client.chat.scrollToBottom();
    socket.on('afkResponse', () => {
      refreshUsers();
    });
    socket.on('receivePrivateMessage', (data: any) => {
      client.chat.messages.push({
        sender: data.sender,
        text: data.content,
      });
    });
    socket.on('joinChannelResponse', (data: any) => {
      client.chat.chatState.receiver.userCount = data.userCount;
      client.chat.chatState.receiver.onlineUsers = data.onlineUsersInChannel;
    });
    socket.on('receiveMessageFromChannel', (data: any) => {
        const currentTime = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const formattedTime = currentTime.toLocaleTimeString(undefined, timeOptions);

        client.chat.messages.push({
          sender: data.sender,
          avatar: data.avatar,
          time: formattedTime,
          text: data.yourdata,
        });
    });

    //trick to scroll to bottom always after vue has updated the DOM
    setTimeout(() => {
      client.chat.scrollToBottom();
    }, 0);
  });
</script>

