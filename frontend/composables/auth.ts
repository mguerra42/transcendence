import { defineStore } from 'pinia'

export const useAuth = defineStore('auth', () => {
  const client = useClient()
  const session = ref({
    id: '',
    email: '',
  })

  const showForm = ref(false)
  const logged = ref<boolean | null>(null)
  const mode = ref('login')
  const error = ref('')

  // Get auth user data
  const refreshSession = async () => {
    const sessionData = await client.auth.session()
    if (sessionData?.id) {
      logged.value = true
      session.value = sessionData
    }
    else {
      logged.value = false
      session.value = {
        id: '',
        email: '',
      }
    }
  }

  const logout = async () => {
    await client.auth.logout()
    await refreshSession()
  }

  return {
    error,
    session,
    mode,
    showForm,
    logged,
    refreshSession,
    logout,
  }
})
