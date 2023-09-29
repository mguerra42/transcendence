<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import { Prisma } from '@prisma/client';
const friend = useFriend()
const client = useClient()

const newFriendName = ref('')
// const items = ref([])
// const selectedItem = ref(null)
const items = ref<any[]>([]); // Spécifiez le type des éléments ici
const selectedItem = ref<any | null>(null); // Spécifiez le type de selectedItem

const fetchFriendList = async () => {
  try {
    const response = await fetch(`${useRuntimeConfig().public.baseURL}/friend/list`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('La requête a échoué');
    }

    const data = await response.json();
    items.value = data.friends; // Mettez à jour items avec la liste d'amis
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste d\'amis :', error);
  }
};

onMounted(() => {
  fetchFriendList();
});

</script>

<template>
  <div v-if="friend.showFriend" class="fixed bg-gray-500 rounded-md left-50 bottom-100 p-4">
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
      <div class="mb-4">
      <label for="selectItem" class="block text-gray-700 font-bold mb-2">Amis</label>
        <div class="grid grid-cols-1 gap-2">
          <div v-for="item in items" :key="item.id" class="bg-white p-2 rounded shadow">
          {{ item.username }}
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>
  