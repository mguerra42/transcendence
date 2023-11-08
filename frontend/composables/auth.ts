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
        if (sessionData?.id && (sessionData.twoFA === 0 || (sessionData.twoFA === 1 && sessionData.verified2FA === true))) {
            console.log('sessionData', sessionData)
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
        showQRCode,
        QRCodeURL,
        twoFaStatus,
        logged,
        refreshSession,
        logout,
        refresh,
    }
})
