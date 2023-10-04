<script setup lang="ts">
const client = useClient();
const auth = useAuth();
const socket = useSocket();

const sendMessage = async () => {
  if (client.chat.newMessage.trim() === '') 
      return;
  socket.emit('sendPrivateMessage', {
    senderId: auth.session.id,
    receiverId: client.chat.chatState.receiver.id,
    text: client.chat.newMessage 
  });
  client.chat.newMessage = '';
  setInterval(() => {}, 80);
  client.chat.messages = await client.chat.currentHistory();
  setInterval(() => {}, 80);
  client.chat.messages = await client.chat.currentHistory();
};

const sendMessageInChannel = async () => {
  if (client.chat.newMessage.trim() === '') 
      return;
  socket.emit('sendMessageToChannel', {
    senderId: auth.session.id,
    //avatar: auth.session.avatarPath,
    receiverId: client.chat.chatState.receiver.id,
    receiver: client.chat.chatState.receiver.name,
    text: client.chat.newMessage 
  });
  client.chat.newMessage = '';
  setInterval(() => {}, 80);
  client.chat.messages = await client.chat.currentHistory();
  setInterval(() => {}, 80);
  client.chat.messages = await client.chat.currentHistory();
  //console.log('sendMessageInChannel (InputField.vue) , client.chat.messages = ', client.chat.messages);
}
</script>

<template>
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
</template>