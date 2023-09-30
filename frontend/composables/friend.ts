import { defineStore } from 'pinia'
// import { useRuntimeConfig } from '@nuxt/use-runtime-config';

export const useFriend = defineStore('friend', () => {
  let showFriend = ref(false);
  let mutualfriends = ref<any[]>([]);
  let currentCategory = ref<any[]>([]);
  let pendingfriends = ref<any[]>([]);
  let askingfriends = ref<any[]>([]);

    const fetchMutualFriendList = async () => {
      try {
        const response = await fetch(`${useRuntimeConfig().public.baseURL}/friend/list`, {
          method: 'GET',
          credentials: 'include',
        });
    
        if (!response.ok) {
          throw new Error('La requête a échoué');
        }
    
        const data = await response.json();
        console.log('Données d\'amis reçues :', data.friends); 
        mutualfriends.value = data.friends; // Mettez à jour mutualfriends avec la liste d'amis
      } catch (error) {
        console.error('Erreur lors de la récupération de la liste d\'amis :', error);
      }
    };
    const toggleCategory= async (category:string) => {
      if (category === 'amis') {
        await fetchMutualFriendList();
        return mutualfriends.value;
      } else if (category === 'enAttente') {
        return mutualfriends.value;
      } else if (category === 'demandes') {
        return mutualfriends.value;
      }
    };
  
    return { 
      showFriend,
      currentCategory,
      toggleCategory,
      fetchMutualFriendList
    }
  })