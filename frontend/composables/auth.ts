import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const client = useClient()
  const username = ref('')
  const password = ref('')

  const login = () => {
    console.log('login', username, password)
    // use client.auth.login ;)
  }

  return {
    username,
    password,
    login,
  }
})
