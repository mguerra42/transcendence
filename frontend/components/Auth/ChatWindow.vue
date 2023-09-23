<template>
  
  <div v-if="!chatVisible" class="fixed bottom-3 left-3 w-30 text-black bg-white border-5 font-semi-bold rounded-lg shadow-lg flex justify-center">
    <button @click="toggleChat" class="px-2 py-1 bg-white-500 text-blue-600 hover:bg-blue-100 rounded-lg">
      Chats
    </button>
  </div>

  <div v-if="chatVisible" class="fixed bottom-3 left-3 w-1/3 text-black bg-white border-5 font-semi-bold rounded-lg shadow-lg">
    
    <div class="flex justify-center">
      <button @click="toggleChat" class="px-2 py-1 bg-white-500 text-blue-600 hover:bg-blue-100 rounded-lg">
        Fermer
      </button>
    </div>
    
    <div class="max-h-[50vh] overflow-hidden flex">
      <!-- User List -->
      <div class="w-1/3 overflow-y-auto scrollbar-w-2 h-[50vh]">
        <h2 class="text-m font-semi-bold px-2 py-2 text-center">Connected Users</h2>
        <div v-for="user in onlineUsersArray" class="mb-2">
          <div class="bg-white cursor-pointer hover:bg-gray-100 flex justify-center">
            <button @click="chatWithUser(user)" class="mb-1 mt-2 text-black cursor-pointer">
              {{ user.username }}
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Window -->
      <div class="flex flex-col w-2/3 p-4">
        <div id="chatMessages" ref="chatMessages" class="overflow-y-auto scrollbar-w-2 h-[4/5]">
          <div class="flex flex-col">
            <div v-for="message in messages" :key="message.id" class="mb-2">
              <div :class="{ '': message.sender === 'You', 'mr-auto': message.sender === 'Server' }">
                <p class="bg-gray-200 text-sm text-black rounded-lg inline-block p-2">
                  {{ message.text }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="p-2 h-[1/5] mt-auto">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Type your message..."
            class="w-full p-2 text-sm text-black rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<!-- custom css to make the scrollbar smaller -->
<style>
  .scrollbar-w-2::-webkit-scrollbar {
    width: 0.15rem;
  }
  .scrollbar-w-2::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .scrollbar-w-2::-webkit-scrollbar-thumb {
    background: #98acc7;
  }
</style>

<script setup lang="ts">

const auth = useAuth();
const client = useClient();
const socket = useSocket();
const messages: Ref<{
   id: number;
   sender: string;
   text: string }[]> = ref([]); // Provide an initial type
const newMessage = ref('');
const chatVisible = ref(true);
const chatMessages = ref();

const scrollToBottom = () => {
  if (chatMessages.value === undefined)
    return ;
  chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
};

const clearChat = () => {
  messages.value = [];
  scrollToBottom();
};

const onlineUsersArray = await client.chat.getOnlineUsers();
const numberOfUsers = onlineUsersArray.length;

const chatWithUser = async (userToMessage : any) => {

    const onlineUsers = await client.chat.getOnlineUsers();
    
    for (const user of onlineUsers)
    {
        if (user.username === userToMessage.username)
        {
            const payload = {
                sender : auth.session.username,
                receiver: user.socketId,
                receiverUsername: user.username,
                text: 'Test : message received from ' + auth.session.username
            }
            socket.emit('chatBox', payload);
            return ;
        }
    }
};


const sendMessage = () => {
  if (newMessage.value.trim() === '') 
      return;
  socket.emit('chatBox', {
    sender: 'You',
    receiver: 'Server',
    text: newMessage.value 
  });

  // Add the sent message to the chat
  messages.value.push({
    id: Date.now(),
    sender: 'You',
    text: newMessage.value,
  });

  newMessage.value = '';
  //puts the action at the end of the stack list to help with inconsistent DOM updates
  setTimeout(() => {
    scrollToBottom();
  }, 0);
};

const toggleChat = () => {
  chatVisible.value = !chatVisible.value;
};

onMounted(async () => {
  await auth.refreshSession();
  await socket.connect();

  scrollToBottom(); // Scroll to the bottom when the component is mounted

  socket.on('chatBoxResponse', (data: any) => {
    console.log("received a response from server : ")
    console.log(data.yourdata.text)
    console.log("from : ")
    console.log(data.yourdata.sender)
    messages.value.push({
      id: Date.now(),
      sender: 'Server', // You can customize the sender here
      text: data.yourdata.text,
    });
  });
});
</script>
