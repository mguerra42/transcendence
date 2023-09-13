<script setup lang="ts">
import { ref, onMounted } from 'vue';
const friend = useFriend()
const client = useClient()

const newFriendName = ref('')
const items = ref([])
const selectedItem = ref(null)

</script>

<template>
    <div v-if="friend.showFriend" class="fixed left-50 bottom-100 p-4">
        <div class="flex">
            <input
                v-model="newFriendName"
                type="text"
                placeholder="Rechercher un ami"
                class="block px-4 py-2 mb-4 border border-gray-300 rounded-md"
            />
            <button @click="client.friend.add(newFriendName)" class="px-4 py-2 ml-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
                Ajouter
            </button>
        </div>
      <select v-model="selectedItem" class="block">
        <option disabled value="">Sélectionnez un élément</option>
        <option v-for="item in items" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
    </div>
  </template>
  