import { defineStore } from 'pinia'
import notify from '~/plugins/notify';

export const useAuth = defineStore('auth', () => {
    const client = useClient()
    const config = useRuntimeConfig()
  
    const session = ref<{
        id: number
        provider: string
        email: string
        username: string
        avatar: string
        mfaEnabled: boolean
        mfaLevel: number
        isSetup: boolean
    }>()
    const isSetup = computed(() => session.value?.isSetup === true)
    const need2FA = computed(() => session.value?.mfaEnabled === true && session.value?.mfaLevel === 1)
    const showLoginView = computed(() => !session.value?.id || (session.value.id && need2FA.value))

    //const showForm = ref(false)
    //const showUserForm = ref(false)
    //const showQRCode = ref(false)
    //const QRCodeURL = ref('')
    //const twoFaStatus = ref(0)
    //const logged = ref<boolean | null>(null)
    const activeForm = ref('login')
    //const error = ref('')
    //const refresh = ref(false)

    // Get auth user data
    const refreshSession = async () => {
        //let sessionData : any;
        //sessionData = await client.auth.session()
        //if (sessionData?.id && (sessionData.twoFA === 0 || (sessionData.twoFA === 1 && sessionData.verified2FA === true))) {
        //    console.log('sessionData', sessionData)
        //    logged.value = true
        //    session.value = sessionData
        //}
        //else {
        //    logged.value = false
        //    session.value = {
        //        id: undefined,
        //        email: '',
        //        username: '',
        //        avatar: '',
        //        socketId: '',
        //    }
        //}
    }

    const logout = async () => {
        
      const { data, error } = await useRequest('/auth/logout', {
        method: 'POST',
      })
        //await client.auth.logout()
        await getSession()
    }
    const verify2FA = async (code) => {
        
        const { data, error } = await useRequest('/auth/2fa', {
            method: 'POST',
            body: {
                code,
            },
        })

        if (error.value) {
            useNotification().notify({
                text: error.value.data.message,
                type: 'error',
            })
        } else {
            await getSession()
        }
    }

    const getSession =  async () => {
        // using $fetch here because nuxt SSR fucks up with cookies
        const data: any = await $fetch(`/auth/session`, {
          method: 'GET',
          baseURL: useRuntimeConfig().public.baseURL,
          credentials: 'include',
        }).catch((x) => {
          return null
        })
        
        if (data?.id) {
            session.value = data
        } else {
            // reset session
            session.value = {}
        }
    
        return data
      }

    const signup = async ({
        //username,
        email,
        password,
      }) => {
        await $fetch('/auth/signup', {
          method: 'POST',
          baseURL: config.public.baseURL,
          body: {
            //username,
            email,
            password,
          },
        })
        .then(async (data) => {
            useNotification().notify({
                text: data.message,
                type: 'success',
            })
            await login('credentials', {
              email,
              password,
            })
        })
        .catch((error) => {
            console.log("error", error.data)
            useNotification().notify({
                text: error.data.message,
                type: 'error',
            })
        })
      }
    const login = async (provider, payload?) => {
        console.log("provider", provider)
        if (provider === '42') {
            const redirect = encodeURIComponent(`${config.public.baseURL}/auth/42/callback`)
            location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${config.public.INTRA_CLIENT_ID}&redirect_uri=${redirect}&response_type=code`
            return
        }
        if (provider === 'credentials') {
            console.log("payload", payload)
            const { data, error } = await useRequest('/auth/login', {
                method: 'POST',
                body: payload,
            })
            if(error.value) {
                useNotification().notify({
                    text: error.value.data.message,
                    type: 'error',
                })
                return
            }

            getSession()
        }
      }

      const setup = async (payload) => {
        const formData = new FormData()
        formData.append('avatar', payload.avatar)
        formData.append('username', payload.username)
        const { data, error } = await useRequest('/auth/setup', {
          method: 'POST',
          body: formData,
          watch: false
        })
        if(error.value) {
            useNotification().notify({
                text: error.value.data.message,
                type: 'error',
            })
            return
        }
        await getSession()
      }

    return {
        login,
        logout,
        showLoginView,
        signup,
        verify2FA,
        need2FA,
        session,
        getSession,
        isSetup,
        setup,
        //error,
        //session,
        activeForm,
        //showForm,
        //showUserForm,
        //showQRCode,
        //QRCodeURL,
        //twoFaStatus,
        //logged,
        //refreshSession,
        //logout,
        //refresh,
    }
})
