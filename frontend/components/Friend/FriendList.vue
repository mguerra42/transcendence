<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  const friend = useFriend()
  const client = useClient()
  const socket = useSocket();
  const channel = useChannel();
  const newFriendName = ref('')
  client.friend.categoryName = 'amis';
  const selectedItem = ref<any | null>(null);
  client.chat.showUserProfile = false;


  const displayUserProfile = async (userToMessage : any) => {
    client.chat.messages = [];
    client.chat.chatState.receiver.id = userToMessage.id;
    client.chat.chatState.receiver.username = userToMessage.username;
    client.chat.messages = await client.chat.currentHistory();
    client.chat.chatState.receiver.avatarPath = userToMessage.avatarPath;
    client.chat.chatState.receiver.victories = userToMessage.victories;
    client.chat.chatState.receiver.defeats = userToMessage.defeats;
    client.chat.chatState.receiver.ladderPoint = userToMessage.ladderPoint;

    client.chat.showUserProfile = !client.chat.showUserProfile;
    client.chat.showAdd = await friend.showAddOption(client.chat.chatState.receiver.username);
  }

    const addFriend = async (newFriendUsername: string) => {
      console.log('add a friend : ', newFriendUsername);
      await client.friend.add(newFriendUsername);
      await friend.toggleCategory(client.friend.categoryName);
      newFriendName.value = '';
      channel.refresh();
  };

  const removeFriend = async (friendName: string) => {
    console.log('remove a friend : ', friendName);
    await client.friend.remove(friendName);
    await friend.toggleCategory(client.friend.categoryName);
    channel.refresh();
  };

  onMounted(() => {
    friend.fetchMutualFriendList();
    friend.fetchInverseFriendList();
    friend.toggleCategory(client.friend.categoryName);
  });
</script>

<template>
  <div class="bg-zinc-700 rounded">
    <div class="flex">

    <input
      v-model="newFriendName"
      type="text"
      placeholder="Enter a username..."
      class="w-full px-2 py-2 text-sm rounded-lg bg-zinc-600 focus:outline-none focus:text-zinc-300"
    />
    <button @click="addFriend(newFriendName)" class="ml-2 text-zinc-200 text-sm px-8 px-1 bg-zinc-600 rounded hover:bg-zinc-800">
      Add
    </button>

    </div>
      <div class="bg-zinc-600 rounded mt-2 ">
        <div class="flex justify-center ml-3 mr-3 mt-3 mb-2">
          <div class="">
            <span :class="{'text-zinc-200 text-sm mr-auto cursor-pointer hover:text-zinc-200': client.friend.categoryName === 'amis',
                          'text-zinc-400 text-sm mr-auto cursor-pointer hover:text-zinc-200': client.friend.categoryName !== 'amis'}" @click="friend.toggleCategory('amis')">Amis</span>
          </div>
          <div class="ml-3 mr-3">
            <span :class="{'text-zinc-200 text-sm mr-auto cursor-pointer hover:text-zinc-200': client.friend.categoryName === 'enAttente',
                          'text-zinc-400 text-sm mr-auto cursor-pointer hover:text-zinc-200': client.friend.categoryName !== 'enAttente'}" @click="friend.toggleCategory('enAttente')">En attente</span>
          </div>
          <div class="">
            <span :class="{'text-zinc-200 text-sm mr-auto cursor-pointer hover:text-zinc-200': client.friend.categoryName === 'demandes',
                          'text-zinc-400 text-sm mr-auto cursor-pointer hover:text-zinc-200': client.friend.categoryName !== 'demandes'}" @click="friend.toggleCategory('demandes')">Demandes</span>
          </div>
        </div>


        <div class="max-h-64 overflow-y-auto p-2">
          <div v-for="item in client.friend.categoryArray" class="text-zinc-200 text-sm p-2 m-1 hover:bg-zinc-500 rounded flex justify-between ">
              <div class="flex">
                <div class="flex flex-col justify-center">
                  <img :src="item.avatarPath" class="w-6 h-6 rounded-full" />
                </div>
                <div class="flex flex-col justify-center">
                  <button @click="displayUserProfile(item)" class="ml-2">  {{ item.username }} </button>
                </div>
              </div>
              <div v-if="client.friend.categoryName === 'demandes'" class="flex">
                <button @click="addFriend(item.username)" class="bg-green i-ic:round-check-circle hover:bg-green-200 relative"></button>
                <button @click="removeFriend(item.username)" class="bg-red i-gridicons:cross-circle hover:bg-red-200 relative"></button>
              </div>
              <div v-if="client.friend.categoryName === 'enAttente'" class="flex">
                <button 
                @click="removeFriend(item.username)" class="bg-red i-gridicons:cross-circle hover:bg-red-200 relative"></button>
              </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  