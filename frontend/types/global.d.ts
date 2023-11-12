

declare global {
    interface UserProfile {
        userId: number
        username: string
        avatar: string
        stats: {
            elo: number
            victories: number
            defeats: number
        }
    }
    
    interface Message {
        id: number
        content: string
        from: number
        timestamp: Date
    }

    interface ChannelUser {
        userId: number
        channelId: number
        role: 'USER' | 'ADMIN' | 'OWNER'
        mutedUntil?: Date
        bannedUntil?: Date
        readUntil: number
        online: boolean
        user: UserProfile
    }

    interface Channel {
        id: number
        name: string
        description: string
        password?: string
        type: 'PUBLIC' | 'PRIVATE' | 'PROTECTED' | 'DM'
        messages: Message[]
        unread: Message[]
        users: ChannelUser[]
    }

    interface Conversation {
        channelId: number
        userId: number
        user: {
            id: number
            username: string
            avatar: string
        }
		role: 'USER' | 'ADMIN' | 'OWNER'
		mutedUntil?: Date
		bannedUntil?: Date
        readUntil: number
		message: string
		channel: Channel
    }
}

export {};
