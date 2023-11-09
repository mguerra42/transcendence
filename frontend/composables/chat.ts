
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

    const socket = useSocket()

    const visible = ref(true)

    const setVisible = (state: boolean) => {
        visible.value = state === true
    }

    const channels = ref<Channel[]>([])
    const dms = ref<PrivateChannel[]>([])

    const current = ref('home')

    const newChannel = ref({
        name: '',
        description: '',
        type: 'PUBLIC',
        password: '',
    })

    const createChannel = async () => {
        console.log('Send msg to socket')
        socket.emit('channels:create', newChannel.value)
    }

	const conversation = ref({
		channelId: '',
		role: 'USER',
		mutedUntil: null,
		bannedUntil: null,
		content: '',
		channel: {
			id: null,
			name: null,
			type: 'PUBLIC',
			description: null,
			users: [],
			messages: []
		}
	})


	const setConversation = async (channel) => {
        socket.emit('channels:last', {
			channel
		})
		current.value = 'channel'
		conversation.value = channel
	}

	const getChannel = (channelId) => channels.value.find(conv => conv.channelId == channelId)

	const sendMessage = async () => {
		socket.emit('channels:message', {
			channelId: conversation.value.channelId,
			content: conversation.value.content
		})
		conversation.value.content = ''
	}

	
	const init = async () => {
        socket.on('channels:list', (data) => {
			channels.value = data
			console.log("channels list", data)
		})
        socket.on('channels:message', (data) => {
			//channels.value = data
			console.log("channels message", data)
			let conversation = getChannel(data.channelId)
			if (conversation) {
				conversation.channel.messages.push({
					from: data.from,
					content: data.content,
					timestamp: data.timestamp
				})
			}
		})
        socket.emit('channels:list', {})
        socket.emit('dms:list', {})

	}


	const getChannelUsers = (conv) => conv.channel.users
	const getChannelOnlineUsers = (conv) => conv.channel.users.filter(u => u.online)
    const getUserFromId = (conv, id: number) => conv.channel.users.find(u => u.user.id == id)

    return {
		init,
        visible,
        setVisible,
        current,

        newChannel,
        createChannel,
        channels,
		getChannelUsers,
		getChannelOnlineUsers,
		getUserFromId,
        conversation,
        setConversation,
        sendMessage,
        dms,
    }
})