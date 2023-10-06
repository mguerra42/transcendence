// Le client est un objet qui contient toutes les fonctions de l'app.
// Il peut être utilisé partout dans la partie front pour interagir avec les différents composants.
// Vous pouvez ajouter des fonctions ici pour les rendre accessibles partout dans l'app, mais ne supprimez pas les fonctions existantes si il y a encore des références à celles-ci. (Ctrl + F: client.xxx)
// Cela nous permettra de tous bosser sur le même code sans avoir à se soucier des conflits de merge.
// Merci d'ajouter des commentaires pour expliquer ce que fait chaque fonction ainsi que le typage des paramètres et du retour.
import { defineStore } from 'pinia'
import { RefSymbol } from '@vue/reactivity'
import { useFetch } from '#app'

export const useRequest: typeof useFetch = (path, options = {}) => {
    const config = useRuntimeConfig()
    options.credentials = 'include'
    options.baseURL = config.public.baseURL
    return useFetch(path, options)
}

interface AppClient {

    // Gardez un seul niveau de hierarchie, ex: group.functionname = implementation
    // group: {
    //    functionname: () => void
    // }

    auth: {
        authMethod: string
        login: ({
            email,
            password,
        }: {
            email: string
            password: string
        }) => void // login
        signup: ({
            username,
            email,
            password,
        }: {
            username: string
            email: string
            password: string
        }) => void // login
        update: (
            {
                username,
                email,
                password,
                newPassword,
                newPasswordConfirmation,
            }: {
                username: string
                email: string
                password: string
                newPassword: string
                newPasswordConfirmation: string
            },
        ) => void // update user data
        onFileSelected: (event: any) => void // upload avatar
        avatarFile: Ref<File | undefined> // avatar file
        loginWithGoogle: () => void // login with google
        login42: () => void // login 42
        logout: () => void // logout
        session: () => any // get user data
    }
    friend: {
        profile: () => void // get user profile
        list: () => void // get friends list
        inverselist: () => void
        pendinglist: () => void
        add: (username: string) => void // add friend
        remove: (friendName: string) => void // remove friend
    }
    chat: {
    // Channels
        createChannel: () => void // create channel
        leaveChannel: () => void // leave channel
        updateChannel: () => void // update channel
        getOnlineUsers: () => any // get online users
        getAllUsers: () => any // get all users
        getOfflineUsers: () => any // get offline users
        setAdmin: (userId: string, status: boolean) => void // set moderator
        // Admin
        kick: (userId: string) => void // kick user
        ban: (userId: string) => void // ban user
        mute: (userId: string) => void // mute user

        // User
        list: () => void // get channels list
        join: () => void // join channel
        leave: () => void // leave channel
        send: () => void // send message to channel
        sendTo: () => void // send DM to user
        block: () => void // block user
        inviteGame: () => void // invite user to game
        clearChat: (div: any) => void
        scrollToBottom: (div: any) => void
        currentHistory: () => any // { sender: string; text: string; time?: string; avatar?: string; user?: any }[]
        usersArray: globalThis.Ref<any[]>
        channelArray: globalThis.Ref<any[]>
        chatVisible: boolean
        chatMessages: globalThis.Ref<any>
        chatState: { select: string; receiver: any }
        newMessage: string
        messages: any[]
        showUserProfile: boolean
    }

    game: {

        addToGameQueue: (playerUsername: string) => any
        removeFromGameQueue: (playerUsername: string) => any
        setQueueStatusToWaiting: (playerUsername: string) => any
        findAMatch: (playerUsername: string) => any
        create: () => void // create game
    }
}

export const useClient = defineStore('client', () => {
    const client: AppClient = {} as AppClient
    const authStore = useAuth()
    const friendStore = useFriend()
    const socket = useSocket()
    const channel = useChannel()
    /* ¯-_-¯-_-¯-_-¯-_-¯-_-¯-_-¯*\
¯-_-¯\_(ツ)_/¯-_-¯ AUTH
\*¯-_-¯-_-¯-_-¯-_-¯-_-¯-_-¯ */

    // Authentification
    client.auth = {} as AppClient['auth']
    client.chat = {} as AppClient['chat']
    client.game = {} as AppClient['game']

    // This variable is used to determine which auth method is used at the time of signin
    client.auth.authMethod = 'default'

    // This function is called to log the user in.
    // It takes an email and a password as parameters
    // and returns a token if the login is successful.
    // Token will also be stored in the cookies, so nothing else is needed after this to keep the session alive.
    // It returns an error if the login is not successful.
    // Finally, we call the auth.refreshSession() function to refresh the session. (see auth.ts)
    client.auth.login = async ({
        email,
        password,
    }) => {
        console.log('login', email, password)
        // data.value.access_token, but not needed here, we use cookies.
        const { data, error } = await useRequest('/auth/login', {
            method: 'POST',
            body: {
                email,
                password,
            },
        })

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return
        }
        authStore.showForm = false
        await authStore.refreshSession()
    }

    client.auth.loginWithGoogle = async () => {
        location.href = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=http://localhost:3001/api/v0/auth/google/callback&scope=email%20profile&client_id=535545866334-87k5bo4t0sbf05v3i8lgf0c0ea8fkcsb.apps.googleusercontent.com'
    }

    client.auth.login42 = async () => {
        location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a8654d5f52c9f6fd539181d269f4c72d07954f0f6ac7409ca17d77eee7ac7822&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fv0%2Fauth%2F42%2Fcallback&response_type=code'
    }

    // This function is called to register a new user
    // It takes an email and a password as parameters
    // It automatically logs the user in after registration.
    client.auth.signup = async ({
        username,
        email,
        password,
    }) => {
    // data.value.access_token, but not needed here, we use cookies.
        const { data, error } = await useRequest('/auth/signup', {
            method: 'POST',
            body: {
                username,
                email,
                password,
            },
        })
        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return
        }
        // Auto login after registration
        await client.auth.login({
            email,
            password,
        })
    }
    client.auth.logout = async () => {
        if (client.auth.authMethod === 'google') {
            const { data, error } = await useRequest('/auth/google/logout', {
                method: 'POST',
            })
        }
        else if (client.auth.authMethod === '42') {
            const { data, error } = await useRequest('/auth/42/logout', {
                method: 'POST',
            })
        }
        else {
            const { data, error } = await useRequest('/auth/logout', {
                method: 'POST',
            })
        }
    }

    client.auth.session = async () => {
    // using $fetch here because nuxt SSR fucks up with cookies
        const data = await $fetch(`${useRuntimeConfig().public.baseURL}/auth/session`, {
            method: 'GET',
            credentials: 'include',
        }).catch((x) => {
            return null
        })
        return data
    }

    client.auth.avatarFile = ref<File>()

    client.auth.update = async ({
        username,
        email,
        password,
        newPassword,
        newPasswordConfirmation,

    }) => {
        const formData = new FormData()
        formData.append('username', username) // la ref de ton input username
        formData.append('email', email)
        formData.append('password', password)
        formData.append('newPassword', newPassword)
        formData.append('newPasswordConfirmation', newPasswordConfirmation)
        if (client.auth.avatarFile.value)
            formData.append('avatar', client.auth.avatarFile.value) // la ref de ton input file

        // console.log(client.auth.avatarFile.value)

        const { data, error } = await useRequest('/auth/update', {
            method: 'POST',
            body: formData,
        })

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return
        }

        authStore.showUserForm = false
        await authStore.refreshSession()
    }

    client.auth.onFileSelected = async (event: any) => {
        client.auth.avatarFile.value = event.target.files[0]
    }

    client.chat.getOnlineUsers = async () => {
        const { data, error } = await useRequest('/socket/getonlineusers', {
            method: 'GET',
        })

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return null
        }
        return data.value
    }

    client.chat.getAllUsers = async () => {
        const { data, error } = await useRequest('/socket/getallusers', {
            method: 'GET',
        })

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return null
        }
        return data.value
    }

    client.chat.getOfflineUsers = async () => {
        const { data, error } = await useRequest('/socket/getofflineusers', {
            method: 'GET',
        })

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return null
        }
        return data.value
    }

    client.chat.clearChat = async (div: any) => {
        client.chat.messages = await client.chat.currentHistory()
        client.chat.scrollToBottom(div)
    }

    client.chat.scrollToBottom = (div: any) => {
        if (div.value === undefined)
            return
        div.value = div.value.scrollHeight
    }

    client.chat.currentHistory = async () => {
        if (client.chat.chatState !== undefined && client.chat.chatState.select === 'DM') {
            const { data, error } = await useRequest('/socket/gethistory', {
                method: 'POST',
                body: {
                    senderId: authStore.session.id,
                    receiverId: client.chat.chatState.receiver.id,
                },
            })

            if (error.value?.statusCode) {
                authStore.error = error.value?.statusMessage as string
                return null
            }

            return data.value
        }
        else if (client.chat.chatState !== undefined && client.chat.chatState.select === 'CHANNEL') {
            const { data, error } = await useRequest('/socket/getchannelhistory', {
                method: 'POST',
                body: {
                    channelId: client.chat.chatState.receiver.id,
                },
            })

            if (error.value?.statusCode) {
                authStore.error = error.value?.statusMessage as string
                return null
            }
            return data.value
        }
        return []
    }

    client.chat.createChannel = async () => {
        const name = prompt('Enter channel name')
        if (name === null || name === '')
            return null

        if (name.length > 20) {
            alert('Channel name too long')
            return null
        }

        const { data, error } = await useRequest('/socket/createchannel', {
            method: 'POST',
            body: {
                name,
            },
        })
        if (error.value?.statusCode || data.value === null) {
            alert('Channel already exists')
            authStore.error = error.value?.statusMessage as string
            return null
        }
        if (data.value !== null && data.value !== undefined) {
            client.chat.messages = []
            client.chat.chatState.select = 'CHANNEL'
            client.chat.chatState.receiver.id = data.value.id
            client.chat.chatState.receiver.name = data.value.name
            socket.emit('joinChannel', {
                sender: authStore.session.username,
                receiver: data.value.name,
            })
        }

        socket.emit('refreshChannel', { sender: authStore.session.username })
    }

    client.chat.leaveChannel = async () => {
        //console.log('name = ', client.chat.chatState.receiver.name, ' id = ', client.chat.chatState.receiver.id)
        socket.emit('leaveChannel', {
            sender: authStore.session.username,
            receiver: client.chat.chatState.receiver.name,
        })

        const { data, error } = await useRequest('/socket/leavechannel', {
            method: 'POST',
            body: {
                channelName: client.chat.chatState.receiver.name,
                channelId: client.chat.chatState.receiver.id,
                userId: authStore.session.id,
                userName: authStore.session.username,
            },
        })

        if (data.value === '1') {
            client.chat.chatState.select = 'EMPTY'
            client.chat.chatState.receiver.id = null
            client.chat.chatState.receiver.name = null
            client.chat.messages = []
        }

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return null
        }

        socket.emit('refreshChannel', { sender: authStore.session.username })
    }

    const gameLobby: Ref<any[]> = ref([])

    client.friend = {} as AppClient['friend']

    client.friend.add = async (newFriendName: string) => {
        console.log('add a friend : ', newFriendName)
        const { data, error } = await useRequest('/friend/add', {
            method: 'POST',
            body: {
                newFriendName,
            },
        })
    }

    client.friend.remove = async (friendName: string) => {
        console.log('remove a friend : ', friendName)
        const { data, error } = await useRequest('/friend/remove', {
            method: 'POST',
            body: {
                friendName,
            },
        })
    }

    client.game = {
        addToGameQueue: async (playerUsername: string) => {
            // If user is already in the game queue, return
            const userExists: any = await useRequest(`/matchmaking/getUserFromQueue?playerUsername=${playerUsername}`, {
                method: 'GET',
            })
            if (userExists.data.value.profile !== undefined)
                return null
            // Else add user in the game queue
            const response: any = await useRequest('/matchmaking/addPlayerToQueue', {
                method: 'POST',
                body: { username: playerUsername },
            })
            return response.data.value
        },

        removeFromGameQueue: async (playerUsername: string) => {
            const userExists: any = await useRequest(`/matchmaking/getUserFromQueue?playerUsername=${playerUsername}`, {
                method: 'GET',
            })
            if (userExists.data.value.profile === undefined)
                return null
            const response: any = await useRequest('/matchmaking/removePlayerFromQueue', {
                method: 'POST',
                body: { username: playerUsername },
            })
            return response.data.value
        },

        setQueueStatusToWaiting: async (playerUsername: string) => {
            const userExists: any = await useRequest(`/matchmaking/getUserFromQueue?playerUsername=${playerUsername}`, {
                method: 'GET',
            })
            if (userExists.data.value.profile === undefined)
                return null
            const response: any = await useRequest('/matchmaking/setUserToWaiting', {
                method: 'POST',
                body: { username: playerUsername },
            })
            return response.data.value
        },

        findAMatch: async (playerUsername: string) => {
            // Fetch users in the queue
            let usersArray: any = await useRequest('/matchmaking/getNormalGameQueue', {
                method: 'GET',
            })

            if (usersArray.data.value.length < 2) {
                console.log('abon ?')
                let retries = 0
                while (retries < 10 && usersArray.data.value.length < 2) {
                    await new Promise(timeout => setTimeout(timeout, 1000))
                    usersArray = await useRequest('/matchmaking/getNormalGameQueue', {
                        method: 'GET',
                    })
                    retries++
                }
                if (retries >= 10) {
                    await useRequest('/matchmaking/removePlayerFromQueue', {
                        method: 'POST',
                        body: { username: playerUsername },
                    })
                    return null
                }
            }

            for (let i = 0; i < usersArray.data.value.length; i++) {
                if (usersArray.data.value[i].profile.username != playerUsername && usersArray.data.value[i].confirmed === 'idle') {
                    console.log('found a match with ; ')
                    console.log(usersArray.data.value[i])
                    // await client.game.setQueueStatusToWaiting(playerUsername)
                    await client.game.setQueueStatusToWaiting(usersArray.data.value[i].profile.username)
                    return usersArray.data.value[i]
                }
            }
            return null
        },
        create: () => {
        },
    }
    return client
})
