<script setup lang="ts">
const auth = useAuth()
const socket = useSocket()
const client = useClient()

const onlineUsersArray = await client.chat.getOnlineUsers();
const numberOfUsers = onlineUsersArray.length;

const chatWithUser = (userSocket : string) => {
    const payload = {
        sender : auth.session.username,
        receiver: userSocket,
        text: 'Test : message received from ' + auth.session.username
    }
    socket.emit('chatBox', payload);
};

  

</script>


<template>
    <br/>
    Chat
    <br/>
    Connected users : {{ numberOfUsers }}
    <br/>
    <div v-for="user in onlineUsersArray" :key="numberOfUsers" class="mb-2">
        <div class="">
            <button  class=" mb-1 mt-2 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="chatWithUser(user.socketId)"> {{ user.username }}</button>
        </div>
    </div>
</template>