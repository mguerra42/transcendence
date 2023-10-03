<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
const friend = useFriend()
const client = useClient()
let categoryTab = 'amis';
const newFriendName = ref('')
const selectedItem = ref<any | null>(null);
let currentCategory : Ref<any[]|undefined> = ref([]);

const fetchFriendlist = async (category:string) => {
  if (category === 'amis') {
    currentCategory.value = await friend.toggleCategory(category)
    categoryTab = 'amis';
    console.log("fetchfriendlist:")
    console.log(currentCategory.value)
  } else if (category === 'enAttente') {
    currentCategory.value = await friend.toggleCategory(category)
    categoryTab = 'enAttente';
  } else if (category === 'demandes') {
    currentCategory.value = await friend.toggleCategory(category)
    categoryTab = 'demandes';
    console.log("fetchinversefriendlist:")
    console.log(currentCategory.value)
  }
  };

  const addFriend = async (newFriendName: string) => {
  console.log('add a friend : ', newFriendName);
  await client.friend.add(newFriendName);
  await fetchFriendlist(categoryTab);
};

const removeFriend = async (friendName: string) => {
  console.log('remove a friend : ', friendName);
  await client.friend.remove(friendName);
  await fetchFriendlist(categoryTab);
};


onMounted(() => {
  friend.fetchMutualFriendList();
  friend.fetchInverseFriendList();
  friend.toggleCategory('amis');
});



</script>

<template>
  <div v-if="friend.showFriend" class="fixed min-h-90 max-h-90 bg-gray-700 rounded-t-md right-30 bottom-10 p-4 h-70">
    <div class="flex">

    <input
    v-model="newFriendName"
    type="text"
    placeholder="Rechercher un ami"
    class="block px-4 h-10 py-2 mb-4 w-45 border border-gray-300 rounded-md"
    />
    <button @click="addFriend(newFriendName)" class="px-4 py-1 h-10 ml-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
    Add
    </button>
    <div @click="friend.showFriend = false"
            class="absolute  top--2 right--2 right p-1 cursor-pointer hover:text-white rounded m-1 text-gray-400 h-10 ">
            <div class="i-mdi:close"></div>
        </div>
    </div>
    <div class="bg-gray-700  rounded-lg  ">
      <div class="mb-4 flex">
        <div class="flex items-center">
          <span class="text-white font-bold cursor-pointer hover:text-blue-500 transition duration-300" @click="fetchFriendlist('amis')">Amis</span>
        </div>

        <div class="flex items-center ml-4 mt-n4">
          <span class="text-white font-bold cursor-pointer hover:text-blue-500 transition duration-300" @click="fetchFriendlist('enAttente')">En attente</span>
        </div>

        <div class="flex items-center ml-4 mt-n4">
          <span class="text-white font-bold cursor-pointer hover:text-blue-500 transition duration-300" @click="fetchFriendlist('demandes')">Demandes</span>
        </div>
      </div>


      <div class="grid grid-cols-1 gap-2">
      <div class="max-h-64 overflow-y-auto">
        <div v-for="item in currentCategory" class="text-white bg-gray-700 p-2 shadow hover:bg-gray-600 flex justify-between items-center">
            <div>{{ item.username }}</div>
            <div v-if="categoryTab === 'demandes'" class="flex space-x-2">
              <button @click="addFriend(item.username)" class="bg-green i-ic:round-check-circle hover:bg-green-200 relative"></button>
              <button @click="removeFriend(item.username)" class="bg-red i-gridicons:cross-circle hover:bg-red-200 relative"></button>
            </div>
            <div v-if="categoryTab === 'enAttente'" class="flex space-x-2">
              <button 
              @click="removeFriend(item.username)" class="bg-red i-gridicons:cross-circle hover:bg-red-200 relative"></button>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>

  </template>
  