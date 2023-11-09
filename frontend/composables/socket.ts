import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useSocket = defineStore('socket', () => {
    const socket = ref()
    const auth = useAuth()
	const chat = useChat()

    const disconnect = async () => {
        if (auth.logged === true)
        {
            socket.value.disconnect()
        }
    }

    const connect = async () => {
        const _socket = io('http://localhost:3001', {
            withCredentials: true,
        })
        _socket.on('connect', () => {
            console.log('Socket connected')
			chat.init()
        })
        _socket.on('disconnect', () => {
            console.log('Socket disconnected')
        })
        socket.value = _socket
    }

    const emit = (event: string, data: any) => {
        socket.value.emit(event, data)
    }

    const on = (event: string, callback: (data: any) => void) => {
        socket.value.on(event, callback)
    }

    return {
        disconnect,
        connect,
        emit,
        on,
    }
})
