import { defineStore } from 'pinia'

export const useAuth = defineStore('auth', () => {
    const client = useClient()
    const session = ref({
        id: '',
        email: '',
        username: '',
        avatarPath: '',
        socketId: '',
    })

    const showForm = ref(false)
    const showUserForm = ref(false)
    const logged = ref<boolean | null>(null)
    const mode = ref('login')
    const error = ref('')
    const refresh = ref(false)

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
                username: '',
                avatarPath: '',
                socketId: '',
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
        showUserForm,
        logged,
        refreshSession,
        logout,
        refresh,
    }
})
