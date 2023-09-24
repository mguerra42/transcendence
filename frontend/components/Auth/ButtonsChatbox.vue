<script setup lang="ts">
const auth = useAuth()
const socket = useSocket()
const client = useClient()

const onlineUsersArray = await client.chat.getOnlineUsers();
const usersArray = await client.chat.getAllUsers();
const offlineUsersArray = await client.chat.getOfflineUsers();
const numberOfOnlineUsers = onlineUsersArray.length;
const numberOfUsers = usersArray.length;
const numberOfOfflineUsers = offlineUsersArray.length;

const chatWithUser = async (userToMessage : any) => {
    client.chat.receiver = userToMessage.username;
};

  

</script>


<template>
    <br/>
    Chat
    <br/>
    Connected users : {{ numberOfOnlineUsers }}
    <br/>
    <div v-for="user in onlineUsersArray" class="mb-2">
        <div class="">
            <button  class=" mb-1 mt-2 rounded bg-blue-500 px-2 py-1 b-blue-700 cursor-pointer hover:bg-blue-600" @click="chatWithUser(user)"> {{ user.username }}</button>
        </div>
    </div>
</template>