
interface Message {
    id: number
    content: string
    from: number
    timestamp: Date
}

interface User {
    id: number
    username: string
    avatar: string
    stats: {
        elo: number
        victories: number
        defeats: number
    }
    isOnline: boolean
}

interface Channel {
    id: number
    name: string
    description: string
    messages: Message[]
    users: User[]
    content: string
}

interface PrivateChannel {
    id: number
    messages: Message[]
    users: User[]
    content: string
}

export const useChat = defineStore('chat', () => {
    const visible = ref(false)

    const setVisible = (state: boolean) => {
        visible.value = state === true
    }

    const socket = useSocket()

    const channels = ref<Channel[]>([])
    const dms = ref<PrivateChannel[]>([])

    const current = ref('home')

    const newChannel = ref({
        name: '',
        description: '',
        type: 'public',
        password: '',
    })

    const createChannel = async () => {
        console.log('Send msg to socket')
        socket.emit('channels:create', newChannel.value)
    }


    return {
        visible,
        setVisible,
        current,

        newChannel,
        createChannel,
        channels,
        dms,
    }
})