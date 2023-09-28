<script setup lang="ts">
const client = useClient();
const auth = useAuth();
const socket = useSocket();

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