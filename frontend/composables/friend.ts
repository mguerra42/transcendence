import friendListVue from '../components/Friend/FriendList.vue';
import { defineStore } from 'pinia'

export const useFriend = defineStore('friend', () => {
  let mutualfriends = ref<any[]>([]);
  let inversefriends = ref<any[]>([]);
  let pendingfriends = ref<any[]>([]);
  const client = useClient();

    const fetchMutualFriendList = async () => {
      try {
        const response = await fetch(`${useRuntimeConfig().public.baseURL}/friend/amis`, {
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

    const getFriends = async () => {
      await fetchMutualFriendList();
      return (mutualfriends.value);
    };

    
    const fetchPendingFriendList = async () => {
      try {
        const response = await fetch(`${useRuntimeConfig().public.baseURL}/friend/enAttente`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('La requête /friend/pendinglist a échoué');
        }
        
        const data = await response.json();
        console.log('Données d\'amis en attente reçues :', data.friends); 
        pendingfriends.value = data.friends;
      } catch (error) {
        console.error('Erreur lors de la récupération de la liste de demandes d\'amis :', error);
      }
    };

    const fetchInverseFriendList = async () => {
      try {
        const response = await fetch(`${useRuntimeConfig().public.baseURL}/friend/demandes`, {
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

    const toggleCategory= async (category:string) => {
      if (category === 'amis') {
        await fetchMutualFriendList();
        client.friend.categoryArray = mutualfriends.value;
        client.friend.categoryName = 'amis';
      } else if (category === 'enAttente') {
        await fetchPendingFriendList();
        client.friend.categoryArray = pendingfriends.value;
        client.friend.categoryName = 'enAttente';
      } else if (category === 'demandes') {
        await fetchInverseFriendList();
        client.friend.categoryArray = inversefriends.value;
        client.friend.categoryName = 'demandes';
      }
    };

    // const fetchFriendlist = async (category:string) => {
    //   if (category === 'amis') {
    //     currentCategory.value = await friend.toggleCategory(category)
    //     categoryTab = 'amis';
    //   } else if (category === 'enAttente') {
    //     currentCategory.value = await friend.toggleCategory(category)
    //     categoryTab = 'enAttente';
    //   } else if (category === 'demandes') {
    //     currentCategory.value = await friend.toggleCategory(category)
    //     categoryTab = 'demandes';
    //   }
    //   };


    return { 
      toggleCategory,
      fetchMutualFriendList,
      fetchInverseFriendList,
      fetchPendingFriendList,
      getFriends
    }
  })