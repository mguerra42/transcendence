import { defineStore } from 'pinia'

export const useAuth = defineStore('auth', () => {
    const client = useClient()
    const session = ref({
        id: '',
        email: '',
        username: '',
        avatarPath: '',
        socketId: '',
        victories: 0,
        defeats: 0,
    })

    const showForm = ref(false)
    const showUserForm = ref(false)
    const showQRCode = ref(false)
    const QRCodeURL = ref('')
    const twoFaStatus = ref(0)
    const logged = ref<boolean | null>(null)
    const mode = ref('login')
    const error = ref('')
    const refresh = ref(false)

    // Get auth user data
    const refreshSession = async () => {
        let sessionData : any;
        sessionData = await client.auth.session()
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
                victories: 0,
                defeats: 0,
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
        showQRCode,
        QRCodeURL,
        twoFaStatus,
        logged,
        refreshSession,
        logout,
        refresh,
    }
})
