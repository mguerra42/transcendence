import { defineStore } from 'pinia'

export const useFriend = defineStore('friend', () => {
    
    const showFriend = ref(false)
    const data = ref('')
    
    
  
    return { showFriend }
  })