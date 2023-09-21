<template>
  <div class="fixed bottom-3 left-3 w-1/2 text-black sm:w-1/3 md:w-1/4 lg:w-1/5 bg-white border-5 font-semi-bold cursor-pointer rounded-lg shadow-lg">
    <div class="flex justify-center">
      <button @click="toggleChat" class="px-2 py-1 bg-white-500 text-blue-600 hover:bg-blue-100 rounded-lg">
        {{ chatVisible ? 'Fermer' : 'Chats' }}
      </button>
    </div>
    <div v-if="chatVisible" class="max-h-[50vh] overflow-y-auto p-4">
      <!-- Chat messages will go here -->
      <div class="flex flex-col"> <!-- Reverse order to make new messages appear at the bottom -->
        <div v-for="message in messages" :key="message.id" class="mb-2">
          <div :class="{ 'ml-auto justify-end': message.sender === 'You', 'mr-auto justify-start': message.sender === 'Server' }">
            <p class="bg-gray-200 text-sm text-black rounded-lg inline-block p-2">
              {{ message.text }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Input field for sending messages -->
    <div v-if="chatVisible" class="p-2">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="Type your message..."
        class="w-full p-2 text-sm text-black rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
      />
    </div>
  </div>
</template>


<script setup lang="ts">

const auth = useAuth();
const socket = useSocket();
const messages: Ref<{
   id: number;
   sender: string;
   text: string }[]> = ref([]); // Provide an initial type
const newMessage = ref('');
const chatVisible = ref(true);

const sendMessage = () => {
  if (newMessage.value.trim() === '') return;

  // Send the message via the socket
  socket.emit('chatBox', { text: newMessage.value });

  // Add the sent message to the chat
  messages.value.push({
    id: Date.now(),
    sender: 'You',
    text: newMessage.value,
  });

  // Clear the input field
  newMessage.value = '';
};

const toggleChat = () => {
  chatVisible.value = !chatVisible.value;
};

onMounted(async () => {
  await auth.refreshSession();
  await socket.connect();

  socket.on('fromserver', (data: any) => {
    // Add the received message to the chat
    messages.value.push({
      id: Date.now(),
      sender: 'Server', // You can customize the sender here
      text: data.yourdata.text,
    });
  });
});
</script>
