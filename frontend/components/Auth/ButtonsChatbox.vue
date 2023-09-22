<script setup lang="ts">
const auth = useAuth()
const socket = useSocket()
const client = useClient()

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

  

</script>


<template>
    <br/>
    Chat
    <br/>
    Connected users : {{ numberOfUsers }}
    <br/>
    <div v-for="user in onlineUsersArray" class="mb-2">
        <div class="">
            <button  class=" mb-1 mt-2 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="chatWithUser(user)"> {{ user.username }}</button>
        </div>
    </div>
</template>