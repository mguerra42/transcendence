import { defineStore } from 'pinia'
// import { useRuntimeConfig } from '@nuxt/use-runtime-config';

export const useFriend = defineStore('friend', () => {
  let showFriend = ref(false);
  let mutualfriends = ref<any[]>([]);
  let inversefriends = ref<any[]>([]);
  let currentCategory = ref<any[]>([]);
  let pendingfriends = ref<any[]>([]);

    const fetchMutualFriendList = async () => {
      try {
        const response = await fetch(`${useRuntimeConfig().public.baseURL}/friend/list`, {
          method: 'GET',
          credentials: 'include',
        });
    
        if (!response.ok) {
          throw new Error('La requête /friend/list a échoué');
        }
    
        const data = await response.json();
        console.log('Données d\'amis mutuels reçues :', data.friends); 
        mutualfriends.value = data.friends; // Mettez à jour mutualfriends avec la liste d'amis
      } catch (error) {
        console.error('Erreur lors de la récupération de la liste d\'amis :', error);
      }
    };

    const fetchInverseFriendList = async () => {
      try {
        const response = await fetch(`${useRuntimeConfig().public.baseURL}/friend/inverselist`, {
          method: 'GET',
          credentials: 'include',
        });
    
        if (!response.ok) {
          throw new Error('La requête /friend/inverselist a échoué');
        }
    
        const data = await response.json();
        console.log('Données de demandes d\'amis reçues :', data.friends); 
        inversefriends.value = data.friends;
      } catch (error) {
        console.error('Erreur lors de la récupération de la liste de demandes d\'amis :', error);
      }
    };

    const fetchPendingFriendList = async () => {
      try {
        const response = await fetch(`${useRuntimeConfig().public.baseURL}/friend/pendinglist`, {
          method: 'GET',
          credentials: 'include',
        });
    
        if (!response.ok) {
          throw new Error('La requête /friend/pendinglist a échoué');
        }
    
        const data = await response.json();
        console.log('Données d\'amis en attente reçues :', data.friends); 
        inversefriends.value = data.friends;
      } catch (error) {
        console.error('Erreur lors de la récupération de la liste de demandes d\'amis :', error);
      }
    };
    const toggleCategory= async (category:string) => {
      if (category === 'amis') {
        await fetchMutualFriendList();
        return mutualfriends.value;
      } else if (category === 'enAttente') {
        await fetchPendingFriendList();
        return pendingfriends.value;
      } else if (category === 'demandes') {
        await fetchInverseFriendList();
        return inversefriends.value;
      }
    };
  
    return { 
      showFriend,
      currentCategory,
      toggleCategory,
      fetchMutualFriendList,
      fetchInverseFriendList,
      fetchPendingFriendList
    }
  })