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
    newFriendName.value = ''
};

const removeFriend = async (friendName: string) => {
  console.log('remove a friend : ', friendName);
  await client.friend.remove(friendName);
  await fetchFriendlist(categoryTab);
};


onMounted(() => {
  friend.fetchMutualFriendList();
  friend.fetchInverseFriendList();
  fetchFriendlist('amis')
  friend.toggleCategory('amis');
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
            <span :class="{'text-zinc-200 text-sm mr-auto cursor-pointer hover:text-zinc-200': categoryTab === 'amis',
                          'text-zinc-400 text-sm mr-auto cursor-pointer hover:text-zinc-200': categoryTab !== 'amis'}" @click="fetchFriendlist('amis')">Amis</span>
          </div>
          <div class="ml-3 mr-3">
            <span :class="{'text-zinc-200 text-sm mr-auto cursor-pointer hover:text-zinc-200': categoryTab === 'enAttente',
                          'text-zinc-400 text-sm mr-auto cursor-pointer hover:text-zinc-200': categoryTab !== 'enAttente'}" @click="fetchFriendlist('enAttente')">En attente</span>
          </div>
          <div class="">
            <span :class="{'text-zinc-200 text-sm mr-auto cursor-pointer hover:text-zinc-200': categoryTab === 'demandes',
                          'text-zinc-400 text-sm mr-auto cursor-pointer hover:text-zinc-200': categoryTab !== 'demandes'}" @click="fetchFriendlist('demandes')">Demandes</span>
          </div>
        </div>


        <div class="max-h-64 overflow-y-auto p-2">
          <div v-for="item in currentCategory" class="text-zinc-200 text-sm p-2 m-1 hover:bg-zinc-500 rounded flex justify-between ">
              <div class="flex">
                <div class="flex flex-col justify-center">
                  <img :src="item.avatarPath" class="w-6 h-6 rounded-full" />
                </div>
                <div class="flex flex-col justify-center">
                  <p class="ml-2">  {{ item.username }} </p>
                </div>
              </div>
              <div v-if="categoryTab === 'demandes'" class="flex">
                <button @click="addFriend(item.username)" class="bg-green i-ic:round-check-circle hover:bg-green-200 relative"></button>
                <button @click="removeFriend(item.username)" class="bg-red i-gridicons:cross-circle hover:bg-red-200 relative"></button>
              </div>
              <div v-if="categoryTab === 'enAttente'" class="flex">
                <button 
                @click="removeFriend(item.username)" class="bg-red i-gridicons:cross-circle hover:bg-red-200 relative"></button>
              </div>
          </div>
        </div>


    </div>
  </div>

  </template>
  