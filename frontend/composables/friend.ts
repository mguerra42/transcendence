import { defineStore } from 'pinia'
import { useRuntimeConfig } from '@nuxt/runtime';

export const useFriend = defineStore('friend', () => {
    
    const showFriend = ref(false)
    const data = ref('')
    
    
  
    return { showFriend }
  })