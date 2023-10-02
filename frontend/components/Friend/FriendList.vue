<script setup lang="ts">
import { ref, onMounted } from 'vue';
const friend = useFriend()
const client = useClient()
const newFriendName = ref('')
const selectedItem = ref<any | null>(null);
let currentCategory : Ref<any[]|undefined> = ref([]);

const fetchFriendlist = async (category:string) => {
  if (category === 'amis') {
    currentCategory.value = await friend.toggleCategory(category)
    console.log("fetchfriendlist:")
    console.log(currentCategory.value)
  } else if (category === 'enAttente') {
    currentCategory.value = await friend.toggleCategory(category)
  } else if (category === 'demandes') {
    currentCategory.value = await friend.toggleCategory(category)
    console.log("fetchinversefriendlist:")
    console.log(currentCategory.value)
  }
  };
onMounted(() => {
  friend.fetchMutualFriendList();
  friend.fetchInverseFriendList();
  friend.toggleCategory('amis');
});



</script>

<template>
  <div v-if="friend.showFriend" class="fixed bg-gray-500 rounded-md left-50 bottom-60 p-4">
    <div class="flex">
    <input
    v-model="newFriendName"
    type="text"
    placeholder="Rechercher un ami"
    class="block px-4 h-10 py-2 mb-4 border border-gray-300 rounded-md"
    />
    <button @click="client.friend.add(newFriendName)" class="px-4 py-1 h-10 ml-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
    Ajouter
    </button>
    </div>
    <div class="bg-gray-200 p-4 rounded-lg">
      <div class="mb-4 flex">
        <div class="flex items-center">
          <span class="text-gray-700 font-bold cursor-pointer hover:text-blue-500 transition duration-300" @click="fetchFriendlist('amis')">Amis</span>
        </div>

        <div class="flex items-center ml-4">
          <span class="text-gray-700 font-bold cursor-pointer hover:text-blue-500 transition duration-300" @click="fetchFriendlist('enAttente')">En attente</span>
        </div>

        <div class="flex items-center ml-4">
          <span class="text-gray-700 font-bold cursor-pointer hover:text-blue-500 transition duration-300" @click="fetchFriendlist('demandes')">Demandes</span>
        </div>
      </div>


    <div class="grid grid-cols-1 gap-2">
      <div v-for="item in currentCategory" class="bg-white p-2 rounded shadow hover:bg-gray-100">
        <div>{{ item.username }}</div>
      </div>
    </div>
  </div>
  </div>
  </template>
  